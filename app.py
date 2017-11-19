import requests
from flask import Flask
app = Flask(__name__)

@app.route('/getML')
def getML():
    return 'got ML'

@app.route('/getstockdata')
def getStockData():
    return requests.get('https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json?api_key=qWcicxSctVxrP9PhyneG').content
