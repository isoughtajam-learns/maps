import json
from collections import defaultdict

from flask import Flask, render_template, request, redirect

app = Flask(__name__)

temp_pins = defaultdict(list)

@app.route("/")
def index():
    return render_template('index.html')


@app.get("/pins")
def get_pins():
    """
    Retrieve default set of pins to load a map
    :return:
    """
    print('Retrieved pins: {}'.format(temp_pins))
    return temp_pins


@app.post("/pin")
def post_pin():
    """
    accept details of a pin from request and write to storage
    :return:
    """
    error = 'invalid pin data'
    if request.method == 'POST':
        try:
            data = json.loads(request.data.decode('utf-8'))
            print('Received {} from maps UI'.format(data))
            temp_pins[data.get('layer')].append(data)
            print('temp_pins: {}'.format(temp_pins))
            error = None
        except Exception as e:
            error=error
    return redirect("/")
