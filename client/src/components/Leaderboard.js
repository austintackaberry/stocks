import React, { Component } from 'react';

class Leaderboard extends Component {
  constructor() {
    super();

  }

  render() {
    let hamburger;
    let leaderboardContent;
    let leaderboardClass;
    let records = this.props.records;
    let data = this.props.data;
    let currentData = this.props.currentData;
    let leaderboardStyle;
    if (records.gamesPlayed >= 1 || (data.length > 0 && currentData.length >= data.length-1)) {
      leaderboardClass = "";
      leaderboardStyle = {"padding-left": "2%", "padding-right": "20px"};
      if (window.innerWidth * 0.02 > 20) {
        leaderboardStyle['padding-left'] = "20px";
      }
      let hamburgerClass = "hb-container";
      leaderboardContent = <div></div>;
      if (!this.props.leaderboardIsHidden) {
        leaderboardClass = "lb-border";
        hamburgerClass = "hb-container change";
        leaderboardContent = (
          <div>
            <h3 id="lb-heading" >Leaderboard</h3>
            <div className="leader-content-container">
              <div className="leader-content">
                <p><span style={{"font-weight":"bold"}}>1st</span> {records.leaderboard[0].name}: {records.leaderboard[0].score}</p>
                <p><span style={{"font-weight":"bold"}}>2nd</span> {records.leaderboard[1].name}: {records.leaderboard[1].score}</p>
                <p><span style={{"font-weight":"bold"}}>3rd</span> {records.leaderboard[2].name}: {records.leaderboard[2].score}</p>
              </div>
            </div>
          </div>
        );
      }
      hamburger =
        <div id='hamburger' className={hamburgerClass} onClick={() => {this.props.handleLeaderboardClick()}}>
          <div class="bar1"></div>
          <div class="bar2"></div>
          <div class="bar3"></div>
        </div>;
    }
    else {
      leaderboardStyle = {"padding-left": "2%"};
      if (window.innerWidth * 0.02 > 30) {
        leaderboardStyle['padding-left'] = "30px";
      }
      leaderboardClass = "";
    }

    return (
      <div id="leaderboard" style={leaderboardStyle} className={leaderboardClass}>
        {hamburger}
        {leaderboardContent}
      </div>
    );
  }
}

export default Leaderboard;
