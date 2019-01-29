_detailPathContainer = []
_detailPathsMaxY = 0

function addDetailPath(id, target) { //{{{
  var data = _linedata.find(e => e.id == id)
  var lmeta = _meta.find(e => e.label == id)
  var semester = Object.keys(data.semester).sort()
  var lineData = []
  Object.entries(data.semester).forEach(e => lineData.push({ semester: e[0], value: e[1].map(e => e.ects).reduce((a,b) => a+b)}))
  var maxY = d3.max(lineData, e => e.value)
  lineData = lineData.sort((a,b) => {
    if(a.semester < b.semester) return -1
    else if(a.semester > b.semester) return 1
    else return 0
  })
  var lcont = new DetailPathContainer(lmeta)
  lcont.appendTo(target)
  var dp = detailPath(data, id, "#dp" + lcont.label + " > div.svg", semester, lineData, maxY)
  lcont.setDetailPath(dp)
  _detailPathContainer.push(lcont)
} //}}} 

function removeDetailPath(id) { //{{{
  path = _detailPathContainer.find(e => e.label == id)
  _detailPathContainer.splice(
    _detailPathContainer.indexOf(path),
    1
  )
  $("#dp"+id).remove()
  $(".ttip"+id).remove()
} //}}}

function highlightCourse(id, isstatic) {
  $(".b" + id).addClass(isstatic ? "detailPathHighlightedStatic" : "detailPathHighlighted")
}

function unhighlightCourse(id, isstatic) {
  $(".b" + id).removeClass(isstatic ? "detailPathHighlightedStatic" : "detailPathHighlighted")
}

function detailPathMouseOver(data, tooltip, pathId) {
  var bodyOffsets = $("#dp" + pathId).offset();
  tooltip.transition()
    .duration(200)                                                                                           
    .style("opacity", .9)
  tooltip.html(data.name) 
    .style("left", (event.clientX + 10) + "px")
    .style("top", (event.clientY - 10) + "px")

  addCourseHighlight(data.lvnumber)
}

function detailPathMouseOut(data, tooltip) {
  tooltip.transition()
    .duration(500)
    .style("opacity", 0)

  removeCourseHighlight(data.lvnumber)
}

function detailPathClick(data) {
  if(isCourseHighlighted(data.lvnumber)) {
    removeCourseHighlight(data.lvnumber, true)
  } else {
    addCourseHighlight(data.lvnumber, true) 
  }
}

function detailPath(data, id, target, xDomain, lineData, maxY) {
  var margin = {top: 10, right: 10, bottom: 25, left: 25},
      width   = 750 - margin.right - margin.left,
      height  = 250 - margin.top - margin.bottom

  var tooltip = d3.select(".tooltipland").append("div")                                                               
    .attr("class", "detailPathTooltip ttip" + id )
    .style("opacity", 0);

  var svg = d3.select(target)
    .append("svg")
    .attr("width", width + margin.left + margin.right)                                                      
    .attr("height", height + margin.top + margin.bottom)
    .classed("detailPath", true)

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")" )                                              

  var x = d3.scaleBand()
    .rangeRound([0,width])
    .domain(xDomain)
    .padding(0.1)

  var y = d3.scaleLinear()
    .rangeRound([height, 0])
    .domain([0, maxY])

  var line = d3.line()
    .x(d => x(d.semester))
    .y(d => y(d.value))

  g.append("g")
    .attr("class", "axis x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

  g.append("g")
    .attr("class", "axis y")
    .call(d3.axisLeft(y))
  
  var bars = []

  Object.entries(data.semester).forEach(se => {
    var upper = 0
    se[1].sort((a,b) => a.ects <= b.ects).forEach(e => {
      upper += height-y(e.ects)
      var el = _.cloneDeep(e)
      el.xVal = x(se[0])
      el.yVal = height-upper
      bars.push(el)
    })
  })
  
  var c = g.selectAll("rect")
      .data(bars)
    .enter().append("rect")
      .attr("class", e => "barElement b" + e.lvnumber)
      .attr("x", e => e.xVal)
      .attr("y", e => e.yVal)
      .attr("width", x.bandwidth())
      .attr("height", e => height-y(e.ects))
      .attr("ects", e => e.ects)
      .attr("name", e => e.name)
      .attr("lvnumber", e => e.lvnumber)
      .attr("fill", "lightgrey")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .on("mouseover", e => detailPathMouseOver(e, tooltip, id))
      .on("mouseout", e => detailPathMouseOut(e, tooltip))
      .on("click", e => detailPathClick(e))
      
  g.append("g").append("path")
      .attr("class", "topline")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 6)
      .attr("d", d => line(d))
      .attr("transform", "translate(" + x.bandwidth()/2*1.05 + ",-3)")
	
  return { svg: svg, id: id, data: data, xDomain: xDomain, maxY: maxY, lineData: lineData }
}
