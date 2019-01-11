from decimal import *
from boto3 import dynamodb
import boto3
from boto3.dynamodb.conditions import Key, Attr
from boto3.session import Session
import requests
import pandas as pd
import quandl
import math
import random
import os
import numpy as np
from sklearn import preprocessing, cross_validation, svm
from sklearn.linear_model import LinearRegression
import json
from dotenv import load_dotenv

# load env vars
load_dotenv()


dynamodb_session = Session(aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                           aws_secret_access_key=os.getenv(
                               'AWS_SECRET_ACCESS_KEY'),
                           region_name='us-west-1')

dynamodb = dynamodb_session.resource('dynamodb')


def get_stock_data(stockSymbol):
    quandl.ApiConfig.api_key = os.getenv(
        'QUANDL_API_KEY')
    allData = quandl.get('WIKI/'+stockSymbol)

    # Approximate number of trading days in a year
    dataLength = 251

    all_data_length = len(allData)
    first_data_elem = math.floor(random.random()*(all_data_length-dataLength))
    mlData = allData[0:first_data_elem+dataLength]

    def format_for_model(dataArray):
        dataArray = dataArray[['Adj. Open', 'Adj. High',
                               'Adj. Low', 'Adj. Close', 'Adj. Volume']]
        dataArray['HL_PCT'] = (
            dataArray['Adj. High'] - dataArray['Adj. Close']) / dataArray['Adj. Close'] * 100.0
        dataArray['PCT_change'] = (
            dataArray['Adj. Close'] - dataArray['Adj. Open']) / dataArray['Adj. Open'] * 100.0
        dataArray = dataArray[['Adj. Close',
                               'HL_PCT', 'PCT_change', 'Adj. Volume']]
        dataArray.fillna(-99999, inplace=True)
        return dataArray

    mlData = format_for_model(mlData)

    forecast_col = 'Adj. Close'
    forecast_out = int(math.ceil(0.12*dataLength))

    mlData['label'] = mlData[forecast_col].shift(-forecast_out)
    mlData.dropna(inplace=True)

    X = np.array(mlData.drop(['label'], 1))
    X = preprocessing.scale(X)
    X_data = X[-dataLength:]
    X = X[:-dataLength]
    data = mlData[-dataLength:]
    mlData = mlData[:-dataLength]
    y = np.array(mlData['label'])

    X_train, X_test, y_train, y_test = cross_validation.train_test_split(
        X, y, test_size=0.3)

    clf = LinearRegression()
    clf.fit(X_train, y_train)

    prediction = clf.predict(X_data)
    data = data[['Adj. Close']]
    data = data.rename(columns={'Adj. Close': 'EOD'})
    data['prediction'] = prediction[:]

    # Convert dataframe to dictionary
    data = data.to_dict(orient='index')
    return_data = []

    # Format data
    for key, value in data.items():
        date = key.date()
        stringDate = str(date.month) + '/' + \
            str(date.day) + '/' + str(date.year)
        return_data.append(
            {"date": date, "EOD": Decimal(str(value['EOD'])), "prediction": Decimal(str(value['prediction'])), "stringDate": stringDate})

    # Sort data by date
    return_data = sorted(return_data, key=lambda item: item['date'])

    # Format data
    for i, elem in enumerate(return_data):
        return_data[i]['date'] = return_data[i]['stringDate']
        del return_data[i]['stringDate']

    return return_data


def insert_stock_data(stockList):
    table = dynamodb.Table('stockit')
    with table.batch_writer() as batch:
        for i in range(1, len(stockList)):
            batch.put_item(
                Item=stockList[i]
            )


def get_stock_data_from_db():
    table = dynamodb.Table('stockit')
    data = table.scan()
    return data['Items']


stocks = get_stock_data_from_db()
stockData = []
for stock in stocks:
    name = stock['name']
    symbol = stock['symbol']
    id = stock['id']
    data = get_stock_data(symbol)
    stockEl = {"data": data, "id": id, "name": name, "symbol": symbol}
    stockData.append(stockEl)

insert_stock_data(stockData)
