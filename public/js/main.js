var _hmdata           = null,
    _spdata           = null,
    _distanceMatrix   = null,
    _orderedLabels    = null,
    _hmOrderedLabels  = null,
    _meta             = null,
    _sparklinedata    = null,
    _linedata         = null

$.fn.dataTable.ext.search.push(
  function( settings, data, dataIndex ) {
    var label = data[0] + "-" + data[2] || 0
    if( _filterids.includes(label) )
      return true
    return false
  }
)

document.addEventListener("DOMContentLoaded", function(event) {
  socket = io('127.0.0.1:5000', {path: ''})
  //socket.emit("getHeatMapData")
  //socket.emit("getScatterPlotData")
  socket.emit("getLineData")
  //socket.emit("getLineData")
  //socket.emit("getDistanceMatrix")
  //socket.emit("getOrderedLabels")

  socket.on("heatMapData", d => {
    _hmdata = d
    _distanceMatrix = new DistanceMatrix(d)
    initHeatmap(d, _hmOrderedLabels)
  })

  socket.on("orderedLabels", d => {
    _orderedLabels = d
    _hmOrderedLabels = d.sort((a,b) => a.order[0] < b.order[0]).map(e => e.label)
    initHeatmap(_hmdata, _hmOrderedLabels)
  })

  socket.on("scatterPlotData", d => {
    _spdata = d
    drawScatterplot(d, ".scatterplot")
  })

  socket.on("metaData", d => {
    _meta = d
    initSparkLines(_sparklinedata, _meta)
  })

  socket.on("lineData", d => {
    _linedata = d
    drawSmallLines(_linedata, ".smalllines")
  })

  socket.on("allLineData", d => {
    _sparklinedata = d
    initSparkLines(_sparklinedata, _meta)
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

  $(".page2").hide()
  $("#loading").hide()

  $("#applySelection").on("click", () => {
    var selids = []
    _sparktable.rows({selected: true}).data().each(e => {
      selids.push(e[0] + '-' + e[2])
    })
    if(selids.length > 100) {
      alert("not a good idea! max paths 100")
      return
    }
    socket.emit("visualizeData", selids)

    $("#loading").show()
    $(".page1").hide()
  })

  $("#selectAllButton").on('click', (e) => {
    var x = $(e.target)
    if(! x.hasClass("pressed") ) {
      _sparktable.rows({page:'current'}).select()
    } else {
      _sparktable.rows({page:'current'}).deselect()
    }
    toggleClearAllButton()
    toggleSelectRowsButton()
  })

  $("#selectAllRows").on('click', (e) => {
    _sparktable.rows({search:'applied'}).select()
    toggleClearAllButton()
  })

  $("#clearSelection").on('click', (e) => {
    _sparktable.rows({selected:true}).deselect()
    toggleClearAllButton()
  })

  $("#backToSelection").on('click', (e) => {
    $(".page2").hide()
    $(".page1").show()
    clearDrawingSpace()
  })

})

function clearDrawingSpace() {
  $(".tooltipland").empty()
  $(".scatterplot").empty()
  $(".heatmap").empty()
  $(".smalllines").empty()
  $(".dpaths").empty()
  _hmdata = null
  _orderedLabels = null
  _hmOrderedLabels = null
  _heatmap = null
  _scatterplot = null
  _smallLines = []
}

function toggleClearAllButton() {
  if(_sparktable.rows({selected:true}).data().length != 0) {
    $("#clearSelection").removeClass("disabled")
    $("#applySelection").removeClass("disabled")
  } else {
    $("#clearSelection").addClass("disabled")
    $("#applySelection").addClass("disabled")
  }
  toggleSelectRowsButton()
}

function toggleSelectRowsButton() {
  var x = $('#selectAllButton')
  if( x.hasClass("pressed") && $("#sparktable tbody .selected").length < 10 ) {
    x.removeClass("pressed")
    x.text("select all shown")
  } else if( !x.hasClass("pressed") && $("#sparktable tbody .selected").length > 10 ) {
    x.addClass("pressed")
    x.text("deselect all shown")
  }
}

function initHeatmap(hmdata, labels) {
  if(hmdata && labels) {
    $(".page2").show()
    $("#loading").hide()
    drawHeatmap(hmdata, ".heatmap", false, labels)
  }
}

function initSparkLines(linedata, meta) {
  if(linedata && meta) {
    drawSparkLines(linedata, meta, "sparklinecontainer")
  }
}
