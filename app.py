import json

from flask import Flask, render_template, request

app = Flask(__name__)

temp_pins = []

@app.route("/")
def index():
    return render_template('index.html')


@app.get("/pins/")
def get_pins():
    """
    Retrieve default set of pins to load a map
    :return:
    """
    return temp_pins

"""
Should we be able to retrieve/write pins within certain LayerGroups 
exclusively?
"""
@app.post("/pin/")
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
            temp_pins.append(data)
            # import pdb
            # pdb.set_trace()
            error = None
        except Exception as e:
            error=error
    return temp_pins
