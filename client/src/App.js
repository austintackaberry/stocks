import React, { Component } from 'react';
import * as d3 from "d3";
import './App.css';

class App extends Component {

  constructor() {
    super();
    this.lineChart = this.lineChart.bind(this);
  }

  lineChart() {
    fetch('/getstockdata', {
      method: 'get'
    }).then(function(res) {
      return res.json();
    }).then(function(response) {
      var data = response.dataset_data.data.slice(0,100);
      console.log(data);
      var width = 500;
      var height = 500;
      var yScale = d3.scaleTime()
                     .domain(d3.extent(data, d => d[11]))
                     .range([height, 0]);
      var xScale = d3.scaleLinear()
                     .domain(d3.extent(data, d => d[0]))
                     .range([0, width]);
      const selectScaledX = datum => xScale(selectX(datum));
      const selectScaledY = datum => yScale(selectY(datum));

      const sparkLine = d3.line()
        .x(selectScaledX)
        .y(selectScaledY);

    const linePath = sparkLine(data);

    return <svg
        className="container"
        height={height}
        width={width}
      >
        <g className="line">
          <path d={linePath} />
        </g>
      </svg>

      // d3.select("svg")
      //     .attr("width", width)
      //     .attr("height", height)
      //   .selectAll("circle")
      //   .data(data)
      //   .enter()
      //   .append("circle")
      //     .attr("cx", d => xScale(d[0]))
      //     .attr("cy", d => xScale(d[11]))
      //     .attr("r", 5)
    });

  }

  componentWillMount() {
    console.log('hey');
  }

  render() {
    var svgLine = this.linceChart();
    return svgLine;
  }
}

export default App;
