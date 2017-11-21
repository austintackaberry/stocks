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
      randStock: ''
    }
    this.plotGraph = this.plotGraph.bind(this);
    this.plotTimer = this.plotTimer.bind(this);
    this.handleStart = this.handleStart.bind(this);
  }

  plotGraph(data, currentData) {
    var margin = {top: 50, right: 20, bottom: 20, left: 20};
    var padding = {top: 20, right: 20, bottom: 20, left: 20};
    var outerWidth = 700;
    var outerHeight = 500;
    var innerWidth = outerWidth - margin.left - margin.right;
    var innerHeight = outerHeight - margin.top - margin.bottom;
    var width = innerWidth - padding.left - padding.right;
    var height = innerHeight - padding.top - padding.bottom;

    var selectX = datum => (new Date(datum[0]).setHours(0,0,0,0));
    var selectY = datum => datum[11];
    var xScale = d3.scaleTime()
                   .domain(d3.extent(data, selectX))
                   .range([margin.left+padding.left, margin.left+padding.left+width]);
    var yScale = d3.scaleLinear()
                   .domain(d3.extent(data, selectY))
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
  }

  componentWillMount() {
    var data = [];
    var currentData = [];
    var randStock;
    async.series([
      (callback) => {
        var stocks = [
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
          ['SAP','SAP'],
          ['HP','HPQ'],
          ['Walmart','WMT'],
          ['Tesla','TSLA'],
          ['Amazon','AMZN'],
          ['ExxonMobil','XOM'],
          ['Goldman Sachs','GS'],
          ['JPMorgan Chase','JPM'],
          ['Blue Apron','APRN'],
          ['Salesforce','CRM']
        ];
        randStock = stocks[Math.floor(Math.random()*stocks.length)];
        fetch('/getstockdata/?stock=' + randStock[1], {
          method: 'get'
        }).then(function(res) {
          return res.json();
        }).then(function(response) {
          data = response.dataset_data.data.slice(0,100);
          callback();
        });
      },
      (callback) => {
        this.setState({
          data:data,
          randStock:randStock,
        });
        callback();
      }
    ]);
  }

  handleStart() {
    this.plotTimer();
  }

  componentDidUpdate() {
    var currentData = this.state.currentData;
    if (currentData.length !== 0) {
      console.log(currentData.length);
      this.plotTimer();
    }
  }

  plotTimer() {
    setTimeout(function () {
      var currentData = this.state.currentData;
      var data = this.state.data;
      if (currentData.length !== data.length) {
        currentData = data.slice(99-currentData.length);
        this.plotGraph(data, currentData);
      }
    }.bind(this), 60);
  }

  render() {
    var svgJSX = this.state.svgJSX;
    return (
      <div>
        <button onClick={() => {this.handleStart()}} style={{'display':'block', 'margin': '0 auto'}}>Start</button>
        {svgJSX}
      </div>
    );
    return <div></div>;
  }
}

export default App;
