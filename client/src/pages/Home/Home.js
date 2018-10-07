import React, { Component } from "react";
import { Link } from "react-router-dom";
import styled from "react-emotion";

const Intro = styled("div")`
  text-align: center;
  margin: 0 auto;
`;

const Container = styled("div")`
  width: 60%;
  margin: 0 auto;
  margin-top: 40px;
  max-width: 800px;
  border: 1px solid rgb(174, 176, 182);
  background-color: rgb(205, 206, 210);
  border-radius: 5px;
  padding: 15px 30px 15px 30px;
`;

const PlayContainer = styled("div")`
  margin: 0 auto;
  text-align: center;
  margin-bottom: 10px;
`;

const PlayLink = styled(Link)`
  text-decoration: none;
`;

class Home extends Component {
  render() {
    return (
      <Container>
        <Intro>
          <h2>Welcome to StockIT!</h2>
          <h4>
            Test your stock-picking skills against the market and a machine
            learning algorithm
          </h4>
          <p>
            A random 365-day period of a random stock will be chosen. You and
            the AI will each start with 3 stocks, 3 "buys", and 3 "sells". Press
            the up arrow key to "buy" a stock, and press the down arrow key to
            "sell" a stock.
          </p>
          <br />
          <p>Good Luck!</p>
          <br />
        </Intro>
        <PlayContainer>
          <PlayLink to="/play?autoStart=true">
            <div id="start-btn" className="btn btn-active">
              Start
            </div>
          </PlayLink>
        </PlayContainer>
      </Container>
    );
  }
}

export default Home;
