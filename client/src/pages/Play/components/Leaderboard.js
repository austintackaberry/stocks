import React, { Component } from "react";
import styled from "react-emotion";

class Leaderboard extends Component {
  render() {
    let hamburger;
    let leaderboardContent;
    let leaderboardClass;
    let { currentData, records, data } = this.props;
    let leaderboardStyle = { paddingLeft: "2%" };
    if (
      records.gamesPlayed >= 1 ||
      (data.length > 0 && currentData.length >= data.length - 1)
    ) {
      leaderboardClass = "";
      leaderboardStyle.paddingRight = "20px";
      if (window.innerWidth * 0.02 > 20) {
        leaderboardStyle.paddingLeft = "20px";
      }
      let hamburgerClass = "hb-container";
      leaderboardContent = <div />;
      if (!this.props.leaderboardIsHidden) {
        leaderboardClass = "lb-border";
        hamburgerClass = "hb-container change";
        leaderboardContent = (
          <div>
            <h3 id="lb-heading">Leaderboard</h3>
            <div className="leader-content-container">
              <div className="leader-content">
                <p>
                  <span style={{ fontWeight: "bold" }}>1st</span>{" "}
                  {records.leaderboard[0].name}: {records.leaderboard[0].score}
                </p>
                <p>
                  <span style={{ fontWeight: "bold" }}>2nd</span>{" "}
                  {records.leaderboard[1].name}: {records.leaderboard[1].score}
                </p>
                <p>
                  <span style={{ fontWeight: "bold" }}>3rd</span>{" "}
                  {records.leaderboard[2].name}: {records.leaderboard[2].score}
                </p>
              </div>
            </div>
          </div>
        );
      }
      hamburger = (
        <Hamburger
          id="hamburger"
          className={hamburgerClass}
          onClick={() => {
            this.props.handleLeaderboardClick();
          }}
        >
          <div className="bar1" />
          <div className="bar2" />
          <div className="bar3" />
        </Hamburger>
      );
    } else {
      if (window.innerWidth * 0.02 > 30) {
        leaderboardStyle.paddingLeft = "30px";
      }
      leaderboardClass = "";
    }
    if (leaderboardContent) {
      return (
        <div
          id="leaderboard"
          style={leaderboardStyle}
          className={leaderboardClass}
        >
          {hamburger}
          {leaderboardContent}
        </div>
      );
    }
    return null;
  }
}

export default Leaderboard;

const Hamburger = styled("button")`
  background-color: transparent;
  border: none;
  &:focus {
    outline: 0;
  }
`;
