var _hmdata         = null,
    _spdata         = null,
    _distanceMatrix = null,
    _linedata       = null

document.addEventListener("DOMContentLoaded", function(event) { 
  socket = io('http://raph.cs.univie.ac.at', {path: '/vissocket.io'})
  socket.emit("getGenHeatMapData")
  socket.emit("getGenScatterPlotData")
  socket.emit("getGenLineData")
  socket.emit("getGenDistanceMatrix")

  socket.on("heatMapData", d => {
    _hmdata = d
    _distanceMatrix = new DistanceMatrix(d)
    drawHeatmap(d, ".heatmap", false)
  })

  socket.on("scatterPlotData", d => {
    _spdata = d
    drawScatterplot(d, ".scatterplot")
  })
  
  socket.on("lineData", d => {
    _linedata = d
    drawSmallLines(_linedata, ".smalllines")
  })
  
  socket.on("genHeatMapData", d => {
    _hmdata = d
    _distanceMatrix = new DistanceMatrix(d)
    drawHeatmap(d, ".heatmap", false)
  })

  socket.on("genScatterPlotData", d => {
    _spdata = d
    drawScatterplot(d, ".scatterplot")
  })
  
  socket.on("genLineData", d => {
    _linedata = d
    drawSmallLines(_linedata, ".smalllines")
  })
});
