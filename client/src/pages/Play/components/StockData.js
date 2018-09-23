import React, { Component } from "react";

class StockData extends Component {
  render() {
    let stockDataJSX = null;
    const { buys, sells, userStockData } = this.props;
    if (this.props.svgJSX > 0) {
      stockDataJSX = (
        <div>
          <p>
            You have {userStockData.currentStocks} stocks plus cash worth a
            total of ${(
              parseFloat(userStockData.currentStockValue) +
              parseFloat(userStockData.bank)
            ).toFixed(2)}
          </p>
          <p>
            You have {userStockData.currentBuys} {buys} and{" "}
            {userStockData.currentSells} {sells} left
          </p>
        </div>
      );
    }
    return stockDataJSX;
  }
}

export default StockData;
