import React, { Component } from "react";
import * as d3 from "d3";
import "../../App.css";
import Leaderboard from "./components/Leaderboard";
import Podium from "./components/Podium";
import Buttons from "./components/Buttons";
import StockData from "./components/StockData";
import Slider from "./components/Slider";
import queryString from "query-string";
import styled from "react-emotion";
import { userBought, userSold, gameStarted } from "../../helpers/analytics";

class Play extends Component {
  constructor() {
    super();

    const initialStockData = {
      currentStocks: 3,
      currentBuys: 3,
      currentSells: 3
    };

    this.initialStockData = { ...initialStockData };

    this.state = {
      svgJSX: null,
      data: [],
      currentData: [],
      currentUserScatterData: [],
      currentUserScatterColor: [],
      currentMLScatterData: [],
      currentMLScatterColor: [],
      loading: false,
      randStock: {},
      gettingNewStock: false,
      userStockJSX: [],
      userStockData: {
        ...initialStockData,
        bank: 0
      },
      mlStockData: {
        ...initialStockData,
        bank: 0
      },
      userBought: false,
      userSold: false,
      records: {
        scoreHasBeenCalcd: false,
        gamesPlayed: 0,
        leaderboard: [
          {
            name: "User",
            score: 0
          },
          {
            name: "AI",
            score: 0
          },
          {
            name: "Market",
            score: 0
          }
        ]
      },
      podium: [
        {
          name: "User",
          stockValue: 0
        },
        {
          name: "AI",
          stockValue: 0
        },
        {
          name: "Market",
          stockValue: 0
        }
      ],
      resizing: false,
      leaderboardIsHidden: false,
      sliderVal: 50,
      showStartScreen: true,
      numGamesStarted: 0
    };
    this.plotGraph = this.plotGraph.bind(this);
    this.plotTimer = this.plotTimer.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleBuySell = this.handleBuySell.bind(this);
    this.handleBuy = this.handleBuy.bind(this);
    this.handleSell = this.handleSell.bind(this);
    this.handleSlider = this.handleSlider.bind(this);
    this.getNewStock = this.getNewStock.bind(this);
    this.checkMLBuySell = this.checkMLBuySell.bind(this);
    this.calcScore = this.calcScore.bind(this);
    this.handleLeaderboardClick = this.handleLeaderboardClick.bind(this);
  }

  componentDidMount() {
    const { history, location } = this.props;
    const { search } = location;
    const searchParamObj = queryString.parse(search);
    if (searchParamObj.autoStart) {
      history.replace(location.pathname);
      this.handleStart();
    }
    document.addEventListener("keydown", this.handleBuySell, false);
    window.addEventListener("resize", this.handleResize, false);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.leaderboardIsHidden !== prevState.leaderboardIsHidden) {
      document.body.style.zoom = 1.0;
      this.handleResize();
    }
  }

  handleResize() {
    var currentData = this.state.currentData.slice();
    var data = this.state.data.slice();
    var currentUserScatterData = this.state.currentUserScatterData.slice();
    var currentUserScatterColor = this.state.currentUserScatterColor.slice();
    var currentMLScatterData = this.state.currentMLScatterData.slice();
    var currentMLScatterColor = this.state.currentMLScatterColor.slice();
    if (currentData.length > 0 && currentData.length === data.length) {
      this.setState({ resizing: true });
      this.plotGraph(
        data,
        currentData,
        currentUserScatterData,
        currentUserScatterColor,
        currentMLScatterData,
        currentMLScatterColor
      );
    }
  }

  handleSlider(event) {
    this.setState({ sliderVal: event.target.value });
  }

  async getNewStock({ userStockData, mlStockData }) {
    var stockData = [];
    var randStock = {};
    const fetchRes = await fetch(`/getStockData`, {
      method: "get"
    });
    const response = await fetchRes.json();
    const { data, symbol, name } = response;
    randStock.name = name;
    randStock.symbol = symbol;
    stockData = data;
    this.setState({
      data: stockData,
      randStock: randStock,
      currentData: [],
      currentUserScatterData: [],
      currentUserScatterColor: [],
      currentMLScatterData: [],
      currentMLScatterColor: [],
      gettingNewStock: false,
      userStockData: {
        ...userStockData,
        finalStockValue: parseFloat(
          stockData[stockData.length - 1].EOD * userStockData.currentStocks
        )
      },
      mlStockData
    });
    this.plotTimer();
    return;
  }

  async handleStart() {
    this.setState({ loading: true });
    var currentData = this.state.currentData.slice();
    var data = this.state.data.slice();
    const newStockData = {
      userStockData: { ...this.initialStockData, bank: 0 },
      mlStockData: { ...this.initialStockData, bank: 0 }
    };
    if (currentData.length === data.length) {
      await this.getNewStock(newStockData);
      gameStarted(this.state.numGamesStarted + 1);
      this.setState({ numGamesStarted: this.state.numGamesStarted + 1 });
    }
  }

  handleBuySell = event => {
    if (event.key == "ArrowDown") {
      this.handleSell();
    }
    if (event.key == "ArrowUp") {
      this.handleBuy();
    }
  };
  handleBuy = event => {
    var { userStockData } = this.state;
    if (userStockData.currentBuys > 0) {
      this.setState({ userBought: true });
      userBought();
    }
  };
  handleSell = event => {
    var { userStockData } = this.state;
    if (userStockData.currentSells > 0) {
      this.setState({ userSold: true });
      userSold();
    }
  };

  checkMLBuySell(currentData) {
    var lastElem = currentData[currentData.length - 1];
    var dataLength = this.state.data.length;
    var currentDataLength = currentData.length;
    var multiplier =
      ((dataLength * 0.88 - currentDataLength) / (dataLength * 0.88)) * 1.0;
    if (multiplier < 0.01) {
      multiplier = 0.01;
    }
    var { mlStockData } = this.state;
    var pctDiff = ((lastElem.prediction - lastElem.EOD) / lastElem.EOD) * 100.0;
    if (currentDataLength % 1 === 0) {
      if (pctDiff > 10 * multiplier && mlStockData.currentBuys > 0) {
        return "buy";
      }
      if (pctDiff < -10 * multiplier && mlStockData.currentSells > 0) {
        return "sell";
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
    var { records, userStockData, mlStockData } = this.state;
    if (data.length !== currentData.length) {
      if (records.scoreHasBeenCalcd) {
        records.scoreHasBeenCalcd = false;
      }
      currentData = data.slice(0, currentData.length + 1);
      var lastStockPrice = parseFloat(currentData[currentData.length - 1].EOD);
      var mlShouldBuySell = this.checkMLBuySell(currentData);
      if (mlShouldBuySell) {
        if (mlShouldBuySell === "buy") {
          currentMLScatterColor.push("rgba(39, 144, 214, 0.4)");
          currentMLScatterData.push(currentData[currentData.length - 1]);
          mlStockData.currentBuys--;
          mlStockData.currentStocks++;
          mlStockData.bank = (
            parseFloat(mlStockData.bank) - lastStockPrice
          ).toFixed(2);
          mlStockData.currentStockValue += lastStockPrice;
        } else if (mlShouldBuySell === "sell") {
          currentMLScatterColor.push("rgba(175, 3, 3, 0.4)");
          currentMLScatterData.push(currentData[currentData.length - 1]);
          mlStockData.currentSells--;
          mlStockData.currentStocks--;
          mlStockData.bank = (
            parseFloat(mlStockData.bank) + lastStockPrice
          ).toFixed(2);
          mlStockData.currentStockValue -= lastStockPrice;
        }
      }
      if (this.state.userSold) {
        currentUserScatterColor.push("rgba(175, 3, 3, 1.0)");
        currentUserScatterData.push(currentData[currentData.length - 1]);
        userStockData.currentSells--;
        userStockData.currentStocks--;
        userStockData.bank = (
          parseFloat(userStockData.bank) + lastStockPrice
        ).toFixed(2);
        userStockData.currentStockValue -= lastStockPrice;
        this.setState({ userSold: false });
      } else if (this.state.userBought) {
        currentUserScatterColor.push("rgba(39, 144, 214, 1.0)");
        currentUserScatterData.push(currentData[currentData.length - 1]);
        userStockData.currentBuys--;
        userStockData.currentStocks++;
        userStockData.bank = (
          parseFloat(userStockData.bank) - lastStockPrice
        ).toFixed(2);
        userStockData.currentStockValue += lastStockPrice;
        this.setState({ userBought: false });
      }
      userStockData.currentStockValue = (
        lastStockPrice * userStockData.currentStocks
      ).toFixed(2);
      mlStockData.currentStockValue = (
        lastStockPrice * mlStockData.currentStocks
      ).toFixed(2);
      this.setState({
        userStockData: userStockData,
        mlStockData: mlStockData
      });
      var timeWait;
      if (userStockData.currentBuys + userStockData.currentSells === 0) {
        timeWait = 50;
      } else {
        timeWait = 450 - this.state.sliderVal * 4;
      }
      setTimeout(
        function() {
          this.plotGraph(
            data,
            currentData,
            currentUserScatterData,
            currentUserScatterColor,
            currentMLScatterData,
            currentMLScatterColor
          );
        }.bind(this),
        timeWait
      );
    } else {
      if (!records.scoreHasBeenCalcd) {
        records.scoreHasBeenCalcd = true;
        this.calcScore();
      }
    }
    this.setState({ records: records });
  }

  calcScore() {
    var { userStockData, mlStockData, records } = this.state;
    var podium = [
      {
        name: "User",
        stockValue: parseFloat(
          (
            parseFloat(userStockData.currentStockValue) +
            parseFloat(userStockData.bank)
          ).toFixed(2)
        )
      },
      {
        name: "AI",
        stockValue: parseFloat(
          (
            parseFloat(mlStockData.currentStockValue) +
            parseFloat(mlStockData.bank)
          ).toFixed(2)
        )
      },
      {
        name: "Market",
        stockValue: parseFloat(userStockData.finalStockValue.toFixed(2))
      }
    ];
    podium.sort(function(a, b) {
      return b.stockValue - a.stockValue;
    });
    var lastScores = {};
    var pointsGiven = 0;
    if (podium[0].stockValue !== podium[1].stockValue) {
      lastScores[podium[0].name] = 3;
      pointsGiven += 3;
    }
    if (podium[2].stockValue !== podium[1].stockValue) {
      lastScores[podium[2].name] = 1;
      pointsGiven += 1;
    }
    if (pointsGiven === 4) {
      lastScores[podium[1].name] = 2;
      pointsGiven += 2;
    }
    if (pointsGiven === 0) {
      lastScores[podium[0].name] = 2;
      lastScores[podium[1].name] = 2;
      lastScores[podium[2].name] = 2;
      pointsGiven += 6;
    } else if (pointsGiven === 3) {
      lastScores[podium[1].name] = 1.5;
      lastScores[podium[2].name] = 1.5;
      pointsGiven += 3;
    } else if (pointsGiven === 1) {
      lastScores[podium[0].name] = 2.5;
      lastScores[podium[1].name] = 2.5;
      pointsGiven += 5;
    }

    records.gamesPlayed++;

    for (let i = 0; i < records.leaderboard.length; i++) {
      if (records.leaderboard[i].name === "User") {
        records.leaderboard[i].score += lastScores["User"];
      }
      if (records.leaderboard[i].name === "AI") {
        records.leaderboard[i].score += lastScores["AI"];
      }
      if (records.leaderboard[i].name === "Market") {
        records.leaderboard[i].score += lastScores["Market"];
      }
    }
    records.leaderboard.sort(function(a, b) {
      return b.score - a.score;
    });

    this.setState({
      podium: podium,
      records: records
    });
  }

  plotGraph(
    data,
    currentData,
    currentUserScatterData,
    currentUserScatterColor,
    currentMLScatterData,
    currentMLScatterColor
  ) {
    var margin;
    var svgStyle = {};
    margin = {
      top: window.innerHeight / 20.0,
      right: window.innerWidth / 35.0,
      bottom: window.innerHeight / 45.0,
      left: window.innerWidth / 12.0
    };
    if (margin.top > 20) {
      margin.top = 20;
    }
    if (margin.bottom > 20) {
      margin.bottom = 20;
    }
    if (margin.left > 30) {
      margin.left = 30;
    }
    if (margin.right > 10) {
      margin.right = 10;
    }
    const svgWidth = document.getElementById("svg-container")
      ? document.getElementById("svg-container").offsetWidth
      : window.innerWidth * 0.98;
    var padding = {
      top: window.innerHeight / 39.0,
      right: window.innerWidth / 35.0,
      bottom: 20,
      left: 25
    };
    if (padding.right > 15) {
      padding.right = 15;
    }
    var outerHeight = window.innerHeight * 0.7;
    if (outerHeight > 1.5 * svgWidth) {
      outerHeight = 1.5 * svgWidth;
    }
    var innerWidth = svgWidth - margin.left - margin.right;
    var innerHeight = outerHeight - margin.top - margin.bottom;
    var width = innerWidth - padding.left - padding.right;
    var height = innerHeight - padding.top - padding.bottom;

    var selectX = datum => new Date(datum["date"]).setHours(0, 0, 0, 0);
    var selectY = datum => datum.EOD;
    var xScale = d3
      .scaleTime()
      .domain(d3.extent(currentData, selectX))
      .range([margin.left + padding.left, margin.left + padding.left + width]);
    var yScale = d3
      .scaleLinear()
      .domain(d3.extent(currentData, selectY))
      .range([margin.top + padding.top + height, margin.top + padding.top]);
    const xAxis = d3
      .axisBottom()
      .scale(xScale)
      .ticks(Math.floor(window.innerWidth / 183.0));
    const yAxis = d3
      .axisLeft()
      .scale(yScale)
      .ticks(5);
    const selectScaledX = datum => xScale(selectX(datum));
    const selectScaledY = datum => yScale(selectY(datum));
    const sparkLine = d3
      .line()
      .x(selectScaledX)
      .y(selectScaledY);
    const linePath = sparkLine(currentData);
    const userCirclePoints = currentUserScatterData.map(datum => ({
      x: selectScaledX(datum),
      y: selectScaledY(datum)
    }));
    const mlCirclePoints = currentMLScatterData.map(datum => ({
      x: selectScaledX(datum),
      y: selectScaledY(datum)
    }));
    const { name } = this.state.randStock;
    var title = null;
    if (currentData.length === data.length) {
      title = (
        <text
          x={svgWidth / 2}
          y={margin.top}
          style={{
            fontSize: "1.2em",
            fontWeight: "bold",
            textAnchor: "middle"
          }}
        >
          {name}
        </text>
      );
    }
    var svgJSX = (
      <SvgContainer id="svg-container">
        <svg
          className="container"
          height={outerHeight}
          width="100%"
          style={svgStyle}
        >
          <g
            className="xAxis"
            ref={node => d3.select(node).call(xAxis)}
            style={{
              transform: `translateY(${height + padding.top + margin.top}px)`,
              fontSize: "1.0em"
            }}
          />
          <g
            className="yAxis"
            ref={node => d3.select(node).call(yAxis)}
            style={{
              transform: `translateX(${padding.left + margin.left}px)`,
              fontSize: "1.0em"
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
                style={{ fill: currentUserScatterColor[index] }}
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
                style={{ fill: currentMLScatterColor[index] }}
              />
            ))}
          </g>
          {title}
        </svg>
      </SvgContainer>
    );
    this.setState({
      svgJSX: svgJSX,
      data: data,
      currentData: currentData,
      currentUserScatterData: currentUserScatterData,
      currentUserScatterColor: currentUserScatterColor,
      currentMLScatterData: currentMLScatterData,
      currentMLScatterColor: currentMLScatterColor,
      showStartScreen: false
    });
    var { gettingNewStock, resizing } = this.state;
    if (currentData.length !== 0 && !gettingNewStock && !resizing) {
      this.plotTimer();
    }
    this.setState({ resizing: false });
  }

  handleLeaderboardClick() {
    document.getElementById("hamburger").classList.toggle("change");
    this.setState({ leaderboardIsHidden: !this.state.leaderboardIsHidden });
  }

  render() {
    var {
      records,
      userStockData,
      podium,
      gettingNewStock,
      svgJSX,
      loading
    } = this.state;
    var data = this.state.data.slice();
    var currentData = this.state.currentData.slice();
    var buys = userStockData.currentBuys === 1 ? "buy" : "buys";
    var sells = userStockData.currentSells === 1 ? "sell" : "sells";
    var startJSX = null;
    if (svgJSX) {
      if (loading) {
        this.setState({ loading: false });
      }
      if (currentData.length !== 0 && currentData.length === data.length) {
        startJSX = (
          <div id="start-buy-sell-container">
            <button
              onClick={e => this.handleStart(e)}
              id="start-btn"
              className="btn btn-active"
            >
              Start
            </button>
          </div>
        );
      }
    }
    const svgPlaceholder = (
      <SvgPlaceholder
        height={window.innerHeight * 0.7}
        onClick={e => this.handleStart(e)}
      >
        <StartText>Start</StartText>
      </SvgPlaceholder>
    );
    return (
      <Container>
        <MainContent>
          <GraphContent>{svgJSX || (!loading && svgPlaceholder)}</GraphContent>
          <Leaderboard
            leaderboardIsHidden={this.state.leaderboardIsHidden}
            handleLeaderboardClick={() => this.handleLeaderboardClick()}
            records={records}
            data={data}
            currentData={currentData}
          />
        </MainContent>
        <div id="below-svg">
          <div id="start-buy-sell-container">
            <Slider
              sliderVal={this.state.sliderVal}
              handleSlider={event => this.handleSlider(event)}
              showStartScreen={this.state.showStartScreen}
            />
            {startJSX}
            <Buttons
              svgJSX={svgJSX}
              currentData={currentData}
              data={data}
              handleBuy={() => this.handleBuy()}
              handleSell={() => this.handleSell()}
              userStockData={userStockData}
            />
          </div>
          <StockData
            svgJSX={svgJSX}
            userStockData={userStockData}
            buys={buys}
            sells={sells}
          />
          <Podium
            currentData={currentData}
            data={data}
            gettingNewStock={gettingNewStock}
            podium={podium}
          />
        </div>
      </Container>
    );
  }
}

export default Play;

const SvgPlaceholder = styled("button")(({ height }) => {
  return {
    width: "100%",
    backgroundColor: "gray",
    height,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  };
});

const Container = styled("div")`
  padding: 15px;
`;

const StartText = styled("p")`
  color: white;
  font-size: 24px;
  font-weight: bold;
`;

const SvgContainer = styled("div")`
  display: table;
  width: 100%;
  margintop: 1.7%;
  flex: 1 1 400px;
`;

const MainContent = styled("div")`
  display: flex;
  flex-direction: row;
`;

const GraphContent = styled("div")`
  flex-grow: 1;
`;
