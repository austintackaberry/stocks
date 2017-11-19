<TimeSeriesSparkLineScatterPlot
  data={dailyStockData}
  height={500}
  selectX={datum => new Date(datum[0])}
  selectY={datum => datum[11]}
  width={500}
/>
