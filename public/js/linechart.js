var _smallLines = []

function drawSmallLines(linedata, target) { //{{{
  var xmax = d3.max(linedata.map(l => l.line.length)),
      ymax = d3.max(_.flatten(linedata.map(l => l.line.map(li => li.y))))

  linedata.forEach(ld => smallLineChart(ld.line, target, ld.id, xmax, ymax))
} //}}}

function highlightSmallLine(id, isstatic = false) { //{{{
  var s = _smallLines.find(e => e.label == id)
  var c = isstatic ? "smallLineHighlightedStatic" : "smallLineHighlighted"
  s.svg.classed(c, true)
} //}}}

function unhighlightSmallLine(id, isstatic = false) { //{{{
  var s = _smallLines.find(e => e.label == id)
  var c = isstatic ? "smallLineHighlightedStatic" : "smallLineHighlighted"
  s.svg.classed(c, false)
} //}}}

function smallLineClicked(label) { //{{{
  if(!isHighlighted(label)) {
    addDetails([label])
    addHighlight([label], true)
  } else {
    removeDetails([label])
    removeHighlight([label], true)
  }
} //}}}

function smallLineMouseOver(label) {
  addHighlight([label])
}

function smallLineMouseOut(label) {
  removeHighlight([label])
}

function smallLineChart(data, target, label = "", xmax, ymax) {
  var margin = {top: 5, right: 5, bottom: 25, left: 5},
      width   = 75 - margin.right - margin.left,
      height  = 95 - margin.top - margin.bottom

  var tooltip = d3.select(target).append("div")                                                               
    .attr("class", "linetooltip")
    .style("opacity", 0);

  var svg = d3.select(target)
    .append("svg")
    .attr("width", width + margin.left + margin.right)                                                      
    .attr("height", height + margin.top + margin.bottom)
    .classed("smallLine", true)
    .on("click", d => smallLineClicked(label))
    .on("mouseover", d => smallLineMouseOver(label))
    .on("mouseout", d => smallLineMouseOut(label))

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

  g.append("g")
    .classed("axis", true)
    .classed("x", true)
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(0).tickSize(0))

  g.append("g")
    .classed("axis", true)
    .classed("y", true)
    .call(d3.axisLeft(y).ticks(0).tickSize(0))

  g.append("g").append("path")
		.datum(data)
    .attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", d => line(d));

  g.append("text")
		.attr("class", "smalllinetext")             
		.attr("transform",
					"translate(" + (width/2) + " ," + 
												 (height + margin.top + 10) + ")")
		.style("text-anchor", "middle")
		.text(label);

  _smallLines.push({ svg: svg, data: data, label: label, x: x, y: y })
}
