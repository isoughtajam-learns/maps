"""
The main application logic as it relates to request handling is here.
"""
import json
import os
from json import JSONDecodeError

import bcrypt
from flask import (
    Flask,
    render_template,
    request,
    Response,
    make_response
)
from waitress import serve

from maps.data.database import conn
from maps.data.serde import (
    serialize_get_pins,
    serialize_post_pin,
    add_updated_at_timestamp,
    serialize_user
)
from maps.data.queries import (
    GET_MARKERS,
    POST_MARKER,
    GET_PASS,
    CREATE_USER,
    GET_USER,
    PATCH_MARKER,
    DELETE_MARKER
)
from maps.utils.auth import create_token_for_user

from .constants import AUTH_HEADER, USERNAME

from maps.utils.auth import (
    filter_payload_from_auth_header,
    add_user_to_dict_from_auth_header
)


app = Flask(__name__)

@app.route("/")
def index() -> str:
    print('requested /')
    return render_template('index.html')


@app.get("/pins")
def get_pins() -> Response:
    """
    Retrieve default set of pins to load a map for a given authorized user
    :return:
    """
    if not request.headers.get(AUTH_HEADER):
        return make_response({}, 204)

    username_dict = filter_payload_from_auth_header(
        request.headers.get(AUTH_HEADER),
        USERNAME
    )
    cur = conn.cursor()
    cur.execute(
        GET_MARKERS,
        username_dict)
    return make_response(
        serialize_get_pins(cur.fetchall()), 200)


@app.get("/user")
def get_user() -> Response:
    """
    Retrieve user object for a given authorized user
    :return:
    """
    if not request.headers.get(AUTH_HEADER):
        return make_response({}, 401)

    username_dict = filter_payload_from_auth_header(
        request.headers.get(AUTH_HEADER),
        USERNAME
    )
    cur = conn.cursor()
    cur.execute(
        GET_USER,
        username_dict)
    user = cur.fetchone()
    print('USER: {}'.format(user))
    return make_response(
        serialize_user(user, cur.description), 200)


@app.route('/pin', methods=['POST', 'PATCH'])
def post_pin() -> Response:
    """
    Accept details of a pin from request and write to database
    :return:
    """
    query = POST_MARKER
    if not request.headers.get(AUTH_HEADER):
        return make_response({}, 204)
    if request.method == 'PATCH':
        query = PATCH_MARKER
    try:
        data = add_user_to_dict_from_auth_header(
            request.headers.get(AUTH_HEADER), json.loads(
            request.data.decode('utf-8')))
        cur = conn.cursor()
        cur.execute(query, serialize_post_pin(data))
    except JSONDecodeError as e:
        return make_response({'error': e}, 400)
    return make_response({}, 201)


@app.delete('/pin/<int:pin_id>')
def delete_pin(pin_id: int) -> Response:
    """
    Accept id of a pin from request and deletes if possible
    :return:
    """
    if not request.headers.get(AUTH_HEADER):
        return make_response({}, 204)
    try:
        data = filter_payload_from_auth_header(
            request.headers.get(AUTH_HEADER), USERNAME)
        data.update({'id': pin_id})
        cur = conn.cursor()
        cur.execute(DELETE_MARKER, data)
    except JSONDecodeError as e:
        return make_response({'error': e}, 400)
    return make_response({}, 201)


@app.route('/login', methods=['GET', 'POST'])
def login() -> Response | str:
    """
    GET requests will receive a rendered login page while POST requests
     will authenticate the provided username and password against the users
     table in the database.

    POST response is a jwt.

    Does not require Authorization header.
    """
    if request.method == 'GET':
        return render_template('login.html')
    else:
        try:
            data = json.loads(request.data.decode('utf-8'))
            username = data.get('username')
            password = data.get('password')
            cur = conn.cursor()
            cur.execute(GET_PASS, {'username': username})
            encoded = cur.fetchone()[0].tobytes()
            assert(bcrypt.checkpw(password.encode('utf-8'), encoded))
        except Exception as e:
            return make_response({'error': 'Password did not match our records.'}, 401)

        return make_response({
            'token': create_token_for_user(username),
            'username': username
        }, 200)


@app.route('/signup', methods=['GET', 'POST'])
def signup() -> Response | str:
    """
    GET requests will receive a rendered sign up page while POST requests
     will create a user with the provided username and password in the users
     table in the database.

    POST response is a jwt.

    Does not require Authorization header.
    """
    if request.method == 'GET':
        return render_template('signup.html')
    else:
        error = ''
        try:
            data = json.loads(request.data.decode('utf-8'))
            username = data.get('username')
            password = data.get('password')
            cur = conn.cursor()
            cur.execute(CREATE_USER, add_updated_at_timestamp({
                'username': username,
                'encoded': bcrypt.hashpw(password.encode('utf-8'),
                                         bcrypt.gensalt())
            }))
            error = cur.statusmessage
            assert('INSERT' in cur.statusmessage)
        except Exception as e:
            return make_response({'error': 'Error creating user {}'.format(error)}, 401)

    return make_response({
            'token': create_token_for_user(username=username),
            'username': username
        }, 200)

if __name__ == "__main__":
    env_var = os.environ.get('MAKEMAPS_SECRET')
    if not env_var:
        raise 'No secret set for auth token. Please run command "export MAKEMAPS_SECRET=<secret string of your choice>" then restart the application.'
    serve(app, host='0.0.0.0', port=5000, url_scheme='https')
