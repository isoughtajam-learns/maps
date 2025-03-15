"""
The main application logic as it relates to request handling is here.
"""
import json
from json import JSONDecodeError

from flask import Flask, render_template, request, redirect

from data.database import conn
from data.serde import serialize_get_pins, serialize_post_pin
from data.queries import GET_PINS, POST_PIN

app = Flask(__name__)

@app.route("/")
def index() -> str:
    return render_template('index.html')


@app.get("/pins")
def get_pins() -> dict:
    """
    Retrieve default set of pins to load a map
    :return:
    """
    cur = conn.cursor()
    cur.execute(GET_PINS)
    return serialize_get_pins(cur.fetchall())


@app.post("/pin")
def post_pin():
    """
    Accept details of a pin from request and write to database
    :return:
    """
    error = 'invalid pin data'
    if request.method == 'POST':
        content_type = request.headers.get('Content-Type')
        data = {}
        if content_type == 'application/json':
            try:
                data = request.get_json()
            except Exception as e:
                print('ERROR parsing application/json {}'.format(e))
        elif content_type == 'application/x-www-form-urlencoded':
            data = request.form
        try:
            data = json.loads(request.get_data().decode('utf-8'))
            cur = conn.cursor()
            cur.execute(POST_PIN, serialize_post_pin(data))
            error = None
        except JSONDecodeError as e:
            print('ERROR ERROR ERROR {}'.format(e))
            error=e
    return redirect("/")
