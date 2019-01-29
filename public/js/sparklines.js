var _sparklines     = [],
    _sparkcontainer = [],
    _sparktable     = [],
    _metaMinMax     = null

var setPaginateCallback = function() { //{{{
  $("#sparktable_paginate").on('click', e => {
    toggleSelectRowsButton()
  })
} //}}}

function drawSparkLines(linedata, meta, target) { //{{{
  var xmax = d3.max(linedata.map(l => l.line.length)),
      ymax = d3.max(_.flatten(linedata.map(l => l.line.map(li => li.y))))

  linedata.forEach(ld => {
    var lmeta = meta.find(e => e.label == ld.label)
    if(!lmeta) return 
    var scont = new SparkLineContainer(lmeta)
    scont.appendTo(target)
    var line = sparkLine(ld.line, "#sl" + scont.label + "> td.line", ld.label, xmax, ymax)
    _sparklines.push(line)
    scont.setSparkLine(line)
    _sparkcontainer.push(scont)
    _filterids.push(scont.label)
  })

  var ex = metaMinMax(meta)
  _metaMinMax = ex

  Object.keys(ex).forEach(k => {
    updateSliderValue([ex[k].min, ex[k].max], k)
  })

  _filtervals = _.cloneDeep(ex)
  _sparktable = $("#sparktable").DataTable( {
    "select": { style: 'multi' },
    "lengthMenu": [[15, 30, 50, -1], [15, 30, 50, "All"]],
    "columnDefs": [
        { "orderable": false, "targets": 1 }
    ],
    "buttons": [
      'selectAll',
      'selectNone'
    ],
    "language": {
      "buttons": {
        selectAll: "Select all items",
        selectNone: "Select none"
      }
    },
    "drawCallback": toggleSelectRowsButton

  })

  _sparktable.on("select", (e) => toggleClearAllButton())
  _sparktable.on("deselect", () => toggleClearAllButton())

  $("#sparktable_filter").hide()

  $("#filternosemesters").slider({
    id: "semesterslider",
    min: ex.semester.min,
    max: ex.semester.max,
    range: true,
    tooltip: "always",
    tooltip_position: "bottom",
    value: [ex.semester.min, ex.semester.max]
  })
    .on( "change", e => sliderChange(e, "semester"))

  $("#filterects").slider({
    id: "ectsslider",
    min: ex.ects.min,
    max: ex.ects.max,
    range: true,
    value: [ex.ects.min, ex.ects.max]
  })
    .on( "change", e => sliderChange(e, "ects"))

  $("#filtermaxects").slider({
    id: "peakslider",
    min: ex.peak.min,
    max: ex.peak.max,
    range: true,
    value: [ex.peak.min, ex.peak.max]
  })
    .on( "change", e => sliderChange(e, "peak"))

  $("#filtermeanects").slider({
    id: "meansemesterectsslider",
    min: ex.meansemesterects.min,
    max: ex.meansemesterects.max,
    range: true,
    value: [ex.meansemesterects.min, ex.meansemesterects.max]
  })
    .on( "change", e => sliderChange(e, "meansemesterects"))

  $("#filtermeangrade").slider({
    id: "meangradeslider",
    min: ex.meangrade.min,
    max: ex.meangrade.max,
    range: true,
    value: [ex.meangrade.min, ex.meangrade.max]
  })
    .on( "change", e => sliderChange(e, "meangrade"))

  $("#filtermediangrade").slider({
    id: "mediangradeslider",
    min: ex.mediangrade.min,
    max: ex.mediangrade.max,
    range: true,
    value: [ex.mediangrade.min, ex.mediangrade.max]
  })
    .on( "change", e => sliderChange(e, "mediangrade"))

  $("#filterstartsemester").slider({
    id: "startsemesterslider",
    ticks: ex.startsemestervals.map((e,i) => i),
    ticks_snap_bounds: 10,
    formatter: d => ex.startsemester[d],
    range: true,
    value: [0, ex.startsemestervals.length-1]
  })
    .on("change", e => sliderChange(e, "startsemester"))

  $("#filterstatus").on("change", e => {
    updateFilter("status", _.compact([$("#filterstatus").val()]))
  })

}  //}}}

function sliderChange(e, type) { //{{{
  if(e.value.oldValue[0] != e.value.newValue[0] || e.value.oldValue[1] != e.value.newValue[1]) {
    updateFilter(type, e.value.newValue[0], e.value.newValue[1])
    updateSliderValue(e.value.newValue, type)
  }
} //}}}

function updateSliderValue(vals, type) { //{{{
  switch(type) {
    case "semester":
      $("#semminval").text(vals[0])
      $("#semmaxval").text(vals[1])
      break
    case "ects":
      $("#ectminval").text(vals[0])
      $("#ectmaxval").text(vals[1])
      break
    case "peak":
      $("#mesminval").text(vals[0])
      $("#mesmaxval").text(vals[1])
      break
    case "meansemesterects":
      $("#epsminval").text(vals[0])
      $("#epsmaxval").text(vals[1])
      break
    case "startsemester":
      $("#firminval").text(_metaMinMax.startsemestervals[vals[0]])
      $("#firmaxval").text(_metaMinMax.startsemestervals[vals[1]])
      break
    case "meangrade":
      $("#meaminval").text(vals[0])
      $("#meamaxval").text(vals[1])
      break
    case "mediangrade":
      $("#medminval").text(vals[0])
      $("#medmaxval").text(vals[1])
      break
  }
} //}}}

function highlightSparkLine(id, isstatic = false) { //{{{
  var s = _sparkLines.find(e => e.label == id)
  var c = isstatic ? "sparkLineHighlightedStatic" : "sparkLineHighlighted"
  s.svg.classed(c, true)
} //}}}

function unhighlightSparkLine(id, isstatic = false) { //{{{
  var s = _sparkLines.find(e => e.label == id)
  var c = isstatic ? "sparkLineHighlightedStatic" : "sparkLineHighlighted"
  s.svg.classed(c, false)
} //}}}

function sparkLineClicked(label) { //{{{
  if(!isHighlighted(label)) {
    addDetails([label])
    addHighlight([label], true)
  } else {
    removeDetails([label])
    removeHighlight([label], true)
  }
} //}}}

function sparkLine(data, target, label = "", xmax, ymax) {
    var margin = {top: 2, right: 2, bottom: 2, left: 2},
      width   = 140 - margin.right - margin.left,
      height  = 36 - margin.top - margin.bottom

  var svg = d3.select(target)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .classed("sparkLine", true)

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")" )

  var datamaxX = d3.max(data.map(e => e.x)),
      datamaxY = d3.max(data.map(e => e.y))

  var maxX = xmax ? xmax : datamaxX
  var maxY = ymax ? ymax : datamaxY

  var x = d3.scaleLinear()
    .rangeRound([0, width])
    .domain([-1,maxX])

  var y = d3.scaleLinear()
    .rangeRound([height, 0])
    .domain([0,maxY])

	var line = d3.line()
		.x(d => x(d.x))
		.y(d => y(d.y))

  g.append("g").append("path")
		.datum(data)
    .attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", d => line(d))

   return { svg: svg, data: data, label: label, x: x, y: y }
}
