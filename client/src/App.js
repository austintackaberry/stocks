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
      currentLineData: [],
      currentScatterData: [],
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
      sold: false,
      bought: false,
      dataColorArr: []
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

  plotGraph(data, currentLineData, currentScatterData, dataColorArr) {
    var margin = {top: 50, right: 20, bottom: 20, left: 20};
    var padding = {top: 25, right: 25, bottom: 25, left: 25};
    var outerWidth = window.innerWidth*0.8;
    var outerHeight = window.innerHeight*0.7;
    var innerWidth = outerWidth - margin.left - margin.right;
    var innerHeight = outerHeight - margin.top - margin.bottom;
    var width = innerWidth - padding.left - padding.right;
    var height = innerHeight - padding.top - padding.bottom;

    var selectX = datum => (new Date(datum[0]).setHours(0,0,0,0));
    var selectY = datum => datum[11];
    var xScale = d3.scaleTime()
                   .domain(d3.extent(currentLineData, selectX))
                   .range([margin.left+padding.left, margin.left+padding.left+width]);
    var yScale = d3.scaleLinear()
                   .domain(d3.extent(currentLineData, selectY))
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
    const linePath = sparkLine(currentLineData);
    const circlePoints = currentScatterData.map(datum => ({
      x: selectScaledX(datum),
      y: selectScaledY(datum),
    }));
    var randStockName = this.state.randStock[0];
    var title = [];
    if (currentLineData.length === data.length) {
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
          {circlePoints.map((circlePoint, index) => (
            <circle
              cx={circlePoint.x}
              cy={circlePoint.y}
              key={`${circlePoint.x},${circlePoint.y}`}
              r={6}
              style={{"fill":dataColorArr[index]}}
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
        currentLineData:currentLineData,
        currentScatterData:currentScatterData,
        dataColorArr: dataColorArr
      }
    );
    var gettingNewStock = this.state.gettingNewStock;
    if (currentLineData.length !== 0 && !gettingNewStock) {
      this.plotTimer();
    }
  }

  getNewStock() {
    var data = [];
    var randStock;
    var stocks = this.state.stocks.slice();
    var userStockData = this.state.userStockData;
    async.series([
      (callback) => {
        randStock = stocks[Math.floor(Math.random()*stocks.length)];
        console.log(randStock);
        fetch('/getstockdata/?stock=' + randStock[1], {
          method: 'get'
        }).then(function(res) {
          return res.json();
        }).then(function(response) {
          var dataLength = 365;
          var allData = response.dataset_data.data.slice();
          var allDataLength = allData.length;
          var firstDataElem = Math.floor(Math.random()*(allDataLength-dataLength));
          data = allData.slice(firstDataElem,firstDataElem+dataLength);
          callback();
        });
      },
      (callback) => {
        userStockData.finalStockValue = parseFloat(data[0][11] * userStockData.currentStocks).toFixed(2);
        this.setState({
          data:data,
          randStock:randStock,
          currentLineData: [],
          currentScatterData: [],
          dataColorArr: [],
          gettingNewStock: false,
          userStockData: userStockData
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
    this.setState({
      gettingNewStock: true,
      userStockData: userStockData
    });
    this.getNewStock();
  }

  handleBuySell = (event) => {
    console.log(event.key);
    var userStockData = this.state.userStockData;
    if (event.key == 'ArrowDown' && userStockData.currentSells > 0) {
      this.setState({sold:true});
    }
    if (event.key == 'ArrowUp' && userStockData.currentBuys > 0) {
      this.setState({bought:true});
    }
  }

  plotTimer() {
    var data = this.state.data.slice();
    var currentLineData = this.state.currentLineData.slice();
    var currentScatterData = this.state.currentScatterData.slice();
    var dataColorArr = this.state.dataColorArr.slice();
    if (data.length !== currentLineData.length) {
      currentLineData = data.slice(data.length-1-currentLineData.length);
      var userStockData = this.state.userStockData;
      var lastStockPrice = parseFloat(currentLineData[0][11]);

      if (this.state.sold) {
        dataColorArr.unshift("red");
        currentScatterData.unshift(currentLineData[0]);
        userStockData.currentSells--;
        userStockData.currentStocks--;
        userStockData.bank = (parseFloat(userStockData.bank) + lastStockPrice).toFixed(2);
        userStockData.currentStockValue -= lastStockPrice;
        this.setState({sold:false});
        console.log(typeof userStockData.bank);
      }
      else if (this.state.bought) {
        dataColorArr.unshift("blue");
        currentScatterData.unshift(currentLineData[0]);
        userStockData.currentBuys--;
        userStockData.currentStocks++;
        userStockData.bank = (parseFloat(userStockData.bank) - lastStockPrice).toFixed(2);
        userStockData.currentStockValue += lastStockPrice;
        this.setState({bought:false});
        console.log(typeof userStockData.bank);
      }
      userStockData.currentStockValue = (lastStockPrice * userStockData.currentStocks).toFixed(2);
      this.setState({
        userStockData:userStockData
      });
      setTimeout(function () {
        this.plotGraph(data, currentLineData, currentScatterData, dataColorArr);
      }.bind(this), 60);
    }
  }

  render() {
    var svgJSX = this.state.svgJSX.slice();
    var userStockJSX = [];
    var gettingNewStock = this.state.gettingNewStock;
    var userStockData = this.state.userStockData;
    var bankStr;
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
      userStockJSX.push(<p>You have {userStockData.currentStocks} stocks worth a total of ${userStockData.currentStockValue}</p>);
      userStockJSX.push(<p>You have {bankStr} cash in the bank</p>);
      userStockJSX.push(<p>You have {userStockData.currentBuys} {buys} and {userStockData.currentSells} {sells} left</p>);
    }
    if (this.state.currentLineData.length > 0 && this.state.data.length === this.state.currentLineData.length && !gettingNewStock) {
      userStockJSX.push(<br />);
      userStockJSX.push(<p>You have stocks plus cash totaling ${(parseFloat(userStockData.currentStockValue) + parseFloat(userStockData.bank)).toFixed(2)}</p>);
      userStockJSX.push(<p>If you did not make any transactions, you would have stocks worth ${userStockData.finalStockValue}</p>);
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
