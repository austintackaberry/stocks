from flask import flask
app = Flask(__name__)

@app.route('/getML')
def getML():
    return 'got ML'
