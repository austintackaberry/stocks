import React, { Component } from 'react';
import * as d3 from "d3";
import './App.css';
var async = require('async');

class App extends Component {

  constructor() {
    super();
    this.state = {
      svgJSX:[],
      data: [],
      currentData: [],
      randStock: '',
      stocks: [
        ['Apple Inc.','AAPL'],
        ['Pandora','P'],
        ['Microsoft','MSFT'],
        ['Alphabet','GOOGL'],
        ['IBM','IBM'],
        ['Intel','INTC'],
        ['Cisco Systems','CSCO'],
        ['Oracle','ORCL'],
        ['Facebook','FB'],
        ['Zynga','ZNGA'],
        ['HP','HPQ'],
        ['Walmart','WMT'],
        ['Tesla','TSLA'],
        ['Amazon','AMZN'],
        ['ExxonMobil','XOM'],
        ['Goldman Sachs','GS'],
        ['JPMorgan Chase','JPM'],
        ['Twitter', 'TWTR'],
        ['Salesforce','CRM']
      ],
      gettingNewStock: false,
      userStockJSX: [],
      userStockData: {
        currentStocks: 3,
        currentBuys: 3,
        currentSells: 3,
        bank: 0
      },
      sold: false,
      bought: false
    }
    this.plotGraph = this.plotGraph.bind(this);
    this.plotTimer = this.plotTimer.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleBuySell = this.handleBuySell.bind(this);
    this.getNewStock = this.getNewStock.bind(this);
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleBuySell, false);
  }

  plotGraph(data, currentData) {
    var margin = {top: 50, right: 20, bottom: 20, left: 20};
    var padding = {top: 20, right: 20, bottom: 20, left: 20};
    var outerWidth = 800;
    var outerHeight = 500;
    var innerWidth = outerWidth - margin.left - margin.right;
    var innerHeight = outerHeight - margin.top - margin.bottom;
    var width = innerWidth - padding.left - padding.right;
    var height = innerHeight - padding.top - padding.bottom;

    var selectX = datum => (new Date(datum[0]).setHours(0,0,0,0));
    var selectY = datum => datum[11];
    var xScale = d3.scaleTime()
                   .domain(d3.extent(currentData, selectX))
                   .range([margin.left+padding.left, margin.left+padding.left+width]);
    var yScale = d3.scaleLinear()
                   .domain(d3.extent(currentData, selectY))
                   .range([margin.top+padding.top+height, margin.top+padding.top]);
    const xAxis = d3.axisBottom()
                    .scale(xScale)
                    .ticks(data.length / 20);
    const yAxis = d3.axisLeft()
                    .scale(yScale)
                    .ticks(5);
    const selectScaledX = datum => xScale(selectX(datum));
    const selectScaledY = datum => yScale(selectY(datum));
    const sparkLine = d3.line()
                        .x(selectScaledX)
                        .y(selectScaledY);
    const linePath = sparkLine(currentData);
    const circlePoints = currentData.map(datum => ({
      x: selectScaledX(datum),
      y: selectScaledY(datum),
    }));
    var randStockName = this.state.randStock[0];
    var title = [];
    if (currentData.length === data.length) {
      title.push(
        <text
          x={width/2}
          y={(margin.top / 1.5)}
          style={{
            "font-size": "16px"
          }}
          >
            {randStockName}
          </text>
        );
    }
    var svgJSX = [];
    svgJSX.push(
      <svg
        className="container"
        height={outerHeight}
        width={outerWidth}
      >
        <g
          className="xAxis"
          ref={node => d3.select(node).call(xAxis)}
          style={{
            transform: `translateY(${height+padding.top+margin.top}px)`,
          }}
        />
        <g
          className="yAxis"
          ref={node => d3.select(node).call(yAxis)}
          style={{
            transform: `translateX(${padding.left+margin.left}px)`,
          }}
        />
        <g className="line">
          <path d={linePath} />
        </g>
        <g className="scatter">
          {circlePoints.map(circlePoint => (
            <circle
              cx={circlePoint.x}
              cy={circlePoint.y}
              key={`${circlePoint.x},${circlePoint.y}`}
              r={4}
            />
          ))}
        </g>
        {title}
      </svg>
    );
    this.setState(
      {
        svgJSX:svgJSX,
        data:data,
        currentData:currentData
      }
    );
    var gettingNewStock = this.state.gettingNewStock;
    if (currentData.length !== 0 && !gettingNewStock) {
      this.plotTimer();
    }
  }

  getNewStock() {
    var data = [];
    var randStock;
    var stocks = this.state.stocks.slice();
    async.series([
      (callback) => {
        randStock = stocks[Math.floor(Math.random()*stocks.length)];
        console.log(randStock);
        fetch('/getstockdata/?stock=' + randStock[1], {
          method: 'get'
        }).then(function(res) {
          return res.json();
        }).then(function(response) {
          data = response.dataset_data.data.slice(0,300);
          callback();
        });
      },
      (callback) => {
        this.setState({
          data:data,
          randStock:randStock,
          currentData: [],
          gettingNewStock: false
        });
        this.plotTimer();
        callback();
      }
    ]);
  }

  handleStart() {
    this.setState({gettingNewStock: true});
    this.getNewStock();
  }

  handleBuySell = (event) => {
    console.log(event.key);
    var userStockData = this.state.userStockData;
    if (event.key == 'ArrowUp' && userStockData.currentSells > 0) {
      this.setState({sold:true});
    }
    if (event.key == 'ArrowDown' && userStockData.currentBuys > 0) {
      this.setState({bought:true});
    }
  }

  plotTimer() {
    var data = this.state.data.slice();
    var currentData = this.state.currentData;
    currentData = data.slice(data.length-1-currentData.length);
    var userStockData = this.state.userStockData;
    var lastStockPrice = currentData[0][11]
    if (currentData.length === 1) {
      userStockData.initialStockValue = (lastStockPrice * userStockData.currentStocks).toFixed(2);
    }
    else if (this.state.sold) {
      userStockData.currentSells--;
      userStockData.currentStocks--;
      userStockData.bank = (userStockData.bank + lastStockPrice).toFixed(2);
      this.setState({sold:false});
    }
    else if (this.state.bought) {
      userStockData.currentBuys--;
      userStockData.currentStocks++;
      userStockData.bank = (userStockData.bank - lastStockPrice).toFixed(2);
      this.setState({bought:false});
    }
    userStockData.currentStockValue = (lastStockPrice * userStockData.currentStocks).toFixed(2);
    this.setState({
      userStockData:userStockData
    });
    setTimeout(function () {
      if (currentData.length !== data.length) {
        this.plotGraph(data, currentData);
      }
    }.bind(this), 60);
  }

  render() {
    var svgJSX = this.state.svgJSX.slice();
    var userStockJSX = [];
    var userStockData = this.state.userStockData;
    if (svgJSX.length > 0) {
      userStockJSX.push(<p>User has {userStockData.currentStocks} stocks worth a total of ${userStockData.currentStockValue}</p>);
      userStockJSX.push(<p>User has ${userStockData.bank} cash in the bank</p>);
      userStockJSX.push(<p>User has {userStockData.currentBuys} buys and {userStockData.currentSells} sells left</p>);
    }
    return (
      <div>
        <button onClick={() => {this.handleStart()}} style={{'display':'block', 'margin': '0 auto', 'margin-top': '20px'}}>Start</button>
        {svgJSX}
        {userStockJSX}
      </div>
    );
  }
}

export default App;
