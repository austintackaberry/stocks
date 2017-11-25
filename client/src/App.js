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
      currentUserScatterData: [],
      currentUserScatterColor: [],
      currentMLScatterData: [],
      currentMLScatterColor: [],
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
        ['Salesforce','CRM'],
        ["Macy's", 'M'],
        ['Advanced Auto Parts Inc.','AAP'],
        ['Baker Hughes','BHGE'],
        ['Marathon Oil','MRO'],
        ['Kroger','KR'],
        ['Foot Locker','FL'],
        ['Target','TGT'],
        ['Bed Bath & Beyond','BBBY'],
        ['Hilton Worldwide Holdings','HLT'],
        ['AutoZone','AZO'],
        ['Under Armour','UAA'],
        ['Mattel', 'MAT'],
        ["Kohl's",'KSS'],
        ['Schlumberger','SLB'],
        ['TripAdvisor','TRIP']
      ],
      gettingNewStock: false,
      userStockJSX: [],
      userStockData: {
        currentStocks: 3,
        currentBuys: 3,
        currentSells: 3,
        initialStocks: 3,
        initialBuys: 3,
        initialSells: 3,
        bank: 0
      },
      mlStockData: {
        currentStocks: 3,
        currentBuys: 3,
        currentSells: 3,
        initialStocks: 3,
        initialBuys: 3,
        initialSells: 3,
        bank: 0
      },
      userBought: false,
      userSold: false
    }
    this.plotGraph = this.plotGraph.bind(this);
    this.plotTimer = this.plotTimer.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleBuySell = this.handleBuySell.bind(this);
    this.getNewStock = this.getNewStock.bind(this);
    this.checkMLBuySell = this.checkMLBuySell.bind(this);
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleBuySell, false);
  }

  getNewStock() {
    var data = [];
    var randStock;
    var stocks = this.state.stocks.slice();
    var userStockData = this.state.userStockData;
    var mlStockData = this.state.mlStockData;
    async.series([
      (callback) => {
        randStock = stocks[Math.floor(Math.random()*stocks.length)];
        console.log(randStock);
        fetch('/getstockdata/?stock=' + randStock[1], {
          method: 'get'
        }).then(function(res) {
          return res.json();
        }).then(function(response) {
          data = JSON.parse(response).data;
          callback();
        });
      },
      (callback) => {
        userStockData.finalStockValue = parseFloat(data[data.length-1].EOD * userStockData.currentStocks);
        this.setState({
          data:data,
          randStock:randStock,
          currentData: [],
          currentUserScatterData: [],
          currentUserScatterColor: [],
          currentMLScatterData: [],
          currentMLScatterColor: [],
          gettingNewStock: false,
          userStockData: userStockData,
          mlStockData: mlStockData
        });
        this.plotTimer();
        callback();
      }
    ]);
  }

  handleStart() {
    var userStockData = this.state.userStockData;
    userStockData.currentStocks = userStockData.initialStocks;
    userStockData.currentBuys = userStockData.initialBuys;
    userStockData.currentSells = userStockData.initialSells;
    userStockData.bank = 0;
    var mlStockData = this.state.mlStockData;
    mlStockData.currentStocks = mlStockData.initialStocks;
    mlStockData.currentBuys = mlStockData.initialBuys;
    mlStockData.currentSells = mlStockData.initialSells;
    mlStockData.bank = 0;
    this.setState({
      gettingNewStock: true,
      userStockData: userStockData,
      mlStockData: mlStockData
    });
    this.getNewStock();
  }

  handleBuySell = (event) => {
    console.log(event.key);
    var userStockData = this.state.userStockData;
    if (event.key == 'ArrowDown' && userStockData.currentSells > 0) {
      this.setState({userSold:true});
    }
    if (event.key == 'ArrowUp' && userStockData.currentBuys > 0) {
      this.setState({userBought:true});
    }
  }

  checkMLBuySell(currentData) {
    var lastElem = currentData[currentData.length-1];
    var dataLength = this.state.data.length;
    var currentDataLength = currentData.length;
    var multiplier = (dataLength - currentDataLength) / dataLength * 1.0;
    var mlStockData = this.state.mlStockData;
    var pctDiff = (lastElem.prediction - lastElem.EOD) / lastElem.EOD * 100.0;
    if (currentDataLength % 5 === 0) {
      if (pctDiff > 10 * multiplier && mlStockData.currentBuys > 0) {
        return 'buy';
      }
      if (pctDiff < -10 * multiplier && mlStockData.currentSells > 0) {
        return 'sell';
      }
    }
    return false;
  }

  plotTimer() {
    var data = this.state.data.slice();
    var currentData = this.state.currentData.slice();
    var currentUserScatterData = this.state.currentUserScatterData.slice();
    var currentUserScatterColor = this.state.currentUserScatterColor.slice();
    var currentMLScatterData = this.state.currentMLScatterData.slice();
    var currentMLScatterColor = this.state.currentMLScatterColor.slice();
    if (data.length !== currentData.length) {
      currentData = data.slice(0,currentData.length+1);
      var userStockData = this.state.userStockData;
      var mlStockData = this.state.mlStockData;
      var lastStockPrice = parseFloat(currentData[currentData.length-1].EOD);
      var mlShouldBuySell = this.checkMLBuySell(currentData);
      if (mlShouldBuySell) {
        if (mlShouldBuySell === 'buy') {
          currentMLScatterColor.push("purple");
          currentMLScatterData.push(currentData[currentData.length-1]);
          mlStockData.currentBuys--;
          mlStockData.currentStocks++;
          mlStockData.bank = (parseFloat(mlStockData.bank) - lastStockPrice).toFixed(2);
          mlStockData.currentStockValue += lastStockPrice;
        }
        else if (mlShouldBuySell === 'sell') {
          currentMLScatterColor.push("green");
          currentMLScatterData.push(currentData[currentData.length-1]);
          mlStockData.currentSells--;
          mlStockData.currentStocks--;
          mlStockData.bank = (parseFloat(mlStockData.bank) + lastStockPrice).toFixed(2);
          mlStockData.currentStockValue -= lastStockPrice;
        }
      }
      if (this.state.userSold) {
        currentUserScatterColor.push("red");
        currentUserScatterData.push(currentData[currentData.length-1]);
        userStockData.currentSells--;
        userStockData.currentStocks--;
        userStockData.bank = (parseFloat(userStockData.bank) + lastStockPrice).toFixed(2);
        userStockData.currentStockValue -= lastStockPrice;
        this.setState({userSold:false});
      }
      else if (this.state.userBought) {
        currentUserScatterColor.push("blue");
        currentUserScatterData.push(currentData[currentData.length-1]);
        userStockData.currentBuys--;
        userStockData.currentStocks++;
        userStockData.bank = (parseFloat(userStockData.bank) - lastStockPrice).toFixed(2);
        userStockData.currentStockValue += lastStockPrice;
        this.setState({userBought:false});
      }
      userStockData.currentStockValue = (lastStockPrice * userStockData.currentStocks).toFixed(2);
      mlStockData.currentStockValue = (lastStockPrice * mlStockData.currentStocks).toFixed(2);
      this.setState({
        userStockData:userStockData,
        mlStockData:mlStockData
      });
      setTimeout(function () {
        this.plotGraph(data, currentData, currentUserScatterData, currentUserScatterColor, currentMLScatterData, currentMLScatterColor);
      }.bind(this), 75);
    }
  }

  plotGraph(data, currentData, currentUserScatterData, currentUserScatterColor, currentMLScatterData, currentMLScatterColor) {
    var margin = {top: 50, right: 20, bottom: 20, left: 20};
    var padding = {top: 25, right: 25, bottom: 25, left: 25};
    var outerWidth = window.innerWidth*0.8;
    var outerHeight = window.innerHeight*0.7;
    var innerWidth = outerWidth - margin.left - margin.right;
    var innerHeight = outerHeight - margin.top - margin.bottom;
    var width = innerWidth - padding.left - padding.right;
    var height = innerHeight - padding.top - padding.bottom;

    var selectX = datum => (new Date(datum['Date']).setHours(0,0,0,0));
    var selectY = datum => datum.EOD;
    var xScale = d3.scaleTime()
                   .domain(d3.extent(currentData, selectX))
                   .range([margin.left+padding.left, margin.left+padding.left+width]);
    var yScale = d3.scaleLinear()
                   .domain(d3.extent(currentData, selectY))
                   .range([margin.top+padding.top+height, margin.top+padding.top]);
    const xAxis = d3.axisBottom()
                    .scale(xScale)
                    .ticks(Math.floor(window.innerWidth/183.0));
    const yAxis = d3.axisLeft()
                    .scale(yScale)
                    .ticks(5);
    const selectScaledX = datum => xScale(selectX(datum));
    const selectScaledY = datum => yScale(selectY(datum));
    const sparkLine = d3.line()
                        .x(selectScaledX)
                        .y(selectScaledY);
    const linePath = sparkLine(currentData);
    const userCirclePoints = currentUserScatterData.map(datum => ({
      x: selectScaledX(datum),
      y: selectScaledY(datum),
    }));
    const mlCirclePoints = currentMLScatterData.map(datum => ({
      x: selectScaledX(datum),
      y: selectScaledY(datum),
    }));
    var randStockName = this.state.randStock[0];
    var title = [];
    if (currentData.length === data.length) {
      title.push(
        <text
          x={(outerWidth/2)}
          y={(margin.top / 1.5)}
          style={{
            "font-size": "1.5em",
            "text-anchor": "middle"
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
            "font-size": "1.0em"
          }}
        />
        <g
          className="yAxis"
          ref={node => d3.select(node).call(yAxis)}
          style={{
            transform: `translateX(${padding.left+margin.left}px)`,
            "font-size": "1.0em"
          }}
        />
        <g className="line">
          <path d={linePath} />
        </g>
        <g className="scatter">
          {userCirclePoints.map((circlePoint, index) => (
            <circle
              cx={circlePoint.x}
              cy={circlePoint.y}
              key={`${circlePoint.x},${circlePoint.y}`}
              r={6}
              style={{"fill":currentUserScatterColor[index]}}
            />
          ))}
        </g>
        <g className="scatter">
          {mlCirclePoints.map((circlePoint, index) => (
            <circle
              cx={circlePoint.x}
              cy={circlePoint.y}
              key={`${circlePoint.x},${circlePoint.y}`}
              r={6}
              style={{"fill":currentMLScatterColor[index]}}
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
        currentData:currentData,
        currentUserScatterData:currentUserScatterData,
        currentUserScatterColor: currentUserScatterColor,
        currentMLScatterData:currentMLScatterData,
        currentMLScatterColor: currentMLScatterColor,
      }
    );
    var gettingNewStock = this.state.gettingNewStock;
    if (currentData.length !== 0 && !gettingNewStock) {
      this.plotTimer();
    }
  }

  render() {
    var svgJSX = this.state.svgJSX.slice();
    var stockDataJSX = [];
    var gettingNewStock = this.state.gettingNewStock;
    var userStockData = this.state.userStockData;
    var mlStockData = this.state.mlStockData;
    var bankStr;
    var podium = [
      {
        name: 'User',
        stockValue: parseFloat(userStockData.currentStockValue) + parseFloat(userStockData.bank)
      },
      {
        name: 'AI',
        stockValue: parseFloat(mlStockData.currentStockValue) + parseFloat(mlStockData.bank)
      },
      {
        name: 'Market',
        stockValue: userStockData.finalStockValue
      }
    ];
    podium.sort(function (a, b) {
        return b.stockValue - a.stockValue;
      }
    );
    if (userStockData.bank < 0) {
      bankStr = '-$' + (-1*userStockData.bank);
    }
    else {
      bankStr = '$' + userStockData.bank;
    }
    var buys = 'buys';
    if (userStockData.currentBuys === 1) {
      buys = 'buy';
    }
    var sells = 'sells';
    if (userStockData.currentSells === 1) {
      sells = 'sell';
    }
    if (svgJSX.length > 0) {
      stockDataJSX.push(<p>You have {userStockData.currentStocks} stocks worth a total of ${userStockData.currentStockValue}</p>);
      stockDataJSX.push(<p>You have {bankStr} cash in the bank</p>);
      stockDataJSX.push(<p>You have {userStockData.currentBuys} {buys} and {userStockData.currentSells} {sells} left</p>);
    }
    if (this.state.currentData.length > 0 && this.state.data.length === this.state.currentData.length && !gettingNewStock) {
      stockDataJSX.push(<br />);
      stockDataJSX.push(<p>1st: {podium[0].name}: ${podium[0].stockValue.toFixed(2)}</p>);
      stockDataJSX.push(<p>2nd: {podium[1].name}: ${podium[1].stockValue.toFixed(2)}</p>);
      stockDataJSX.push(<p>3rd: {podium[2].name}: ${podium[2].stockValue.toFixed(2)}</p>);
    }
    return (
      <div>
        <button onClick={() => {this.handleStart()}} style={{'display':'block', 'margin': '0 auto', 'margin-top': '20px'}}>Start</button>
        {svgJSX}
        {stockDataJSX}
      </div>
    );
  }
}

export default App;
