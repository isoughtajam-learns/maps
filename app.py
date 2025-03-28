"""
The main application logic as it relates to request handling is here.
"""
import json
from json import JSONDecodeError

import bcrypt
from flask import Flask, render_template, request, redirect

from maps.data.database import conn
from maps.data.serde import (
    serialize_get_pins,
    serialize_post_pin,
    add_updated_at_timestamp
)
from maps.data.queries import GET_PINS, POST_PIN, GET_PASS, CREATE_USER
from maps.utils.auth import create_token_for_user

from maps.constants import AUTH_HEADER, USERNAME

from maps.utils.auth import (
    filter_payload_from_auth_header,
    append_user_to_dict_from_auth_header
)


app = Flask(__name__)

@app.route("/")
def index() -> str:
    return render_template('index.html')


@app.get("/pins")
def get_pins() -> dict:
    """
    Retrieve default set of pins to load a map for a given authorized user
    :return:
    """
    username_dict = filter_payload_from_auth_header(
        request.headers.get(AUTH_HEADER),
        USERNAME
    )
    cur = conn.cursor()
    cur.execute(
        GET_PINS,
        username_dict)
    return serialize_get_pins(cur.fetchall())


@app.post("/pin")
def post_pin():
    """
    Accept details of a pin from request and write to database
    :return:
    """
    error = 'invalid pin data'
    if request.method == 'POST':
        try:
            data = append_user_to_dict_from_auth_header(
                request.headers.get(AUTH_HEADER), json.loads(
                request.data.decode('utf-8')))
            cur = conn.cursor()
            cur.execute(POST_PIN, serialize_post_pin(data))
            error = None
        except JSONDecodeError as e:
            print('ERROR ERROR ERROR {}'.format(e))
            error=e
    return json.dumps({})


@app.route('/login', methods=['GET', 'POST'])
def login():
    """
    GET requests will receive a rendered login page while POST requests
     will authenticate the provided username and password against the users
     table in the database.

    POST response is a jwt.
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
            if not bcrypt.checkpw(password.encode('utf-8'), encoded):
                raise BaseException('Password did not match our records.')
            return create_token_for_user(username)
        except Exception as e:
            print('ERROR: {}', e)
    return create_token_for_user()

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """
    GET requests will receive a rendered sign up page while POST requests
     will create a user with the provided username and password in the users
     table in the database.

    POST response is a jwt.
    """
    username=None
    if request.method == 'GET':
        return render_template('signup.html')
    else:
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
            if 'INSERT' not in cur.statusmessage:
                raise 'Error creating user: {}'.format(cur.statusmessage)
        except Exception as e:
            print('ERROR: {}', e)
    return {'token': create_token_for_user(username=username)}

@app.route('/modal-test')
def modal_test():
    return render_template('modal-test.html')
