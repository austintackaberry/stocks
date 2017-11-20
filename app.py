import requests
from flask import Flask, request
app = Flask(__name__)

@app.route('/getML')
def getML():
    return 'got ML'

@app.route('/getstockdata/')
def getStockData():
    stock = request.args.get('stock', default=None, type=None)
    return requests.get('https://www.quandl.com/api/v3/datasets/WIKI/' + stock + '/data.json?api_key=qWcicxSctVxrP9PhyneG').content
