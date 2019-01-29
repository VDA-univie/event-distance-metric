_heatmap = null
HLSTATIC = "#E9A125"
HLVOLATILE = "red"

function drawHeatmap(data, target, printtext = false, labels = null) { //{{{
  var margin = {top: 50, right: 20, bottom: 20, left: 50}
                    
  var width   = 650 - margin.right - margin.left,
      height  = 650 - margin.top - margin.bottom
	
	var datamin = d3.min(_.flatten(data).map(e => e.value)),
			datamax = d3.max(_.flatten(data).map(e => e.value)),
      datalabels = labels ? labels : _.uniq(data.map(e => e.x)).sort()

  var xScale = d3.scaleBand()
      .domain(datalabels)
      .rangeRound([0, width])

	var yScale = d3.scaleBand()
			.domain(datalabels)
      .rangeRound([0, height])

	var colorScale = d3.scaleSequential(d3.interpolateCubehelix("#08306b", "#f7fbff"))

  var tooltip = d3.select(".tooltipland").append("div")
    .attr("class", "hmtooltip")
    .style("opacity", 0);

	var svg = d3.select(target)
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	var cells = svg.selectAll('rect')
			.data(data)
			.enter().append('g')
      .attr('class', d => 'cell c' + d.x + ' c' + d.y)
  
  cells.append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('x', d => xScale(d.x))
      .attr('y', d => yScale(d.y))
      .attr('fill', d => colorScale(d.value/datamax))
      .on("mouseover", d => heatMapMouseOver(d,tooltip))
      .on("mouseout", d => heatMapMouseOut(d,tooltip))
      .on("click", d => heatMapClick(d))
 
  if(printtext) { //{{{
  cells.append('text')
      .attr('x', d => xScale(d.x)+xScale.bandwidth()/2)
      .attr('y', d => yScale(d.y)+yScale.bandwidth()/1.5)
      .attr('style', 'text-anchor: middle; alignment-baseline: middle;')
      .text(d => d.value)
  } //}}}

	svg.append("g") //{{{
			.attr("class", "y axis")
			.call(d3.axisLeft(yScale))

	svg.append("g")
			.attr("class", "x axis")
			.call(d3.axisTop(xScale))
			.selectAll('text')
			.style("text-anchor", "start")
			.attr("dx", ".8em")
			.attr("dy", ".5em")
			.attr("transform", "rotate(-65)") //}}}

  _heatmap = {
    svg     : svg,
    data    : data,
    xScale  : xScale,
    yScale  : yScale,
    tooltip : tooltip
  }
} //}}}

function heatMapMouseOver(d, tooltip) { //{{{
  tooltip.transition()
     .duration(200)
     .style("opacity", .9)
  tooltip.html(d.value + "<br/>" + d.x + " vs. " + d.y) 
     .style("left", (d3.event.pageX + 15) + "px")
     .style("top", (d3.event.pageY - 10) + "px")
  
  Array.from(document.getElementsByClassName("cell c" + d.x + " c" + d.y)).forEach(g => {
    g.childNodes[0].setAttribute("z-index", 5)
  })

  addHighlight([d.x, d.y])
} //}}}

function heatMapMouseOut(d, tooltip) { //{{{
  tooltip.transition()
    .duration(500)
    .style("opacity", 0)
  
  removeHighlight([d.x, d.y])
} //}}}

function heatMapClick(d) { //{{{
  if(isHighlighted(d.x) && isHighlighted(d.y)) { 
    removeDetails([d.x, d.y])
    removeHighlight([d.x, d.y], true)
  } else {
    addHighlight([d.x, d.y], true)
    addDetails([d.x, d.y])
  }
} //}}}

function highlightHeatMap(idpairs) { //{{{
  idpairs.forEach(e => {
    highlightHeatMapCell(e[0], e[1]) 
  })    
} //}}}

function highlightHeatMapCell(x, y) { //{{{
  var value = _distanceMatrix.getValue(x, y)
  
  d3.selectAll(".cell.c" + x + ".c" + y)
    .classed("hmselected", true)

  /*
  _heatmap.svg.append("rect")
    .attr("class", "hmhighlight " + x + " " + y)
    .attr("width", _heatmap.xScale.bandwidth())
    .attr("height", _heatmap.yScale.bandwidth())
    .attr("x", _heatmap.xScale(x))
    .attr("y", _heatmap.yScale(y))
    .attr("stroke", "green")
    .attr("stroke-width", 2)
    .attr("fill-opacity", 0)
    .on("mouseover", d => heatMapMouseOver({value: value, x: x, y: y}, _heatmap.tooltip))
    .on("mouseout", d => heatMapMouseOut({value: value, x: x, y: y}, _heatmap.tooltip))
    .on("click", d => heatMapClick({value: value, x: x, y: y}))

  _heatmap.svg.append("rect")
    .attr("class", "hmhighlight " + y + " " + x)
    .attr("width", _heatmap.xScale.bandwidth())
    .attr("height", _heatmap.yScale.bandwidth())
    .attr("x", _heatmap.xScale(y))
    .attr("y", _heatmap.yScale(x))
    .attr("stroke", "green")
    .attr("stroke-width", 2)
    .attr("fill-opacity", 0)
    .on("mouseover", d => heatMapMouseOver({value: value, x: x, y: y}, _heatmap.tooltip))
    .on("mouseout", d => heatMapMouseOut({value: value, x: x, y: y}, _heatmap.tooltip))
    .on("click", d => heatMapClick({value: value, x: x, y: y}))*/
}  //}}}

function unhighlightHeatMap(idpairs) { //{{{
  idpairs.forEach(e =>
    unhighlightHeatMapCell(e[0], e[1])
  )
} //}}}

function unhighlightHeatMapCell(x, y) { //{{{
  d3.selectAll(".cell.c" + x + ".c" + y)
    .classed("hmselected", false)

  /*_heatmap.svg.selectAll(".hmhighlight")._groups[0].forEach(e => {
    if(e.classList.contains(x))
      if(e.classList.contains(y))
        e.remove()
  })*/
} //}}}

function highlightHeatMapRow(id, green = false) { //{{{
  /*var pointsX = ""
  pointsX +=  _heatmap.xScale(_heatmap.xScale.domain()[0])
    + "," +   _heatmap.yScale(id)-1)
    + " " +   _heatmap.xScale.bandwidth() + 
              _heatmap.xScale(_heatmap.xScale.domain()[_heatmap.xScale.domain().length-1]))
    + "," +   _heatmap.yScale(id)-1)
    + " " +   _heatmap.xScale.bandwidth() + 
              _heatmap.xScale(_heatmap.xScale.domain()[_heatmap.xScale.domain().length-1]))
    + "," +   _heatmap.yScale(id) + _heatmap.yScale.bandwidth() + 1
  */
  _heatmap.svg.append("line")
    .attr("class", "hmrowhighlight " + id)
    .attr("x1", _heatmap.xScale(_heatmap.xScale.domain()[0]))
    .attr("y1", _heatmap.yScale(id)-1)
    .attr("x2", _heatmap.xScale.bandwidth() + 
      _heatmap.xScale(_heatmap.xScale.domain()[_heatmap.xScale.domain().length-1]))
    .attr("y2", _heatmap.yScale(id)-1)
    .attr("stroke", green ? HLSTATIC : HLVOLATILE)
    .attr("stroke-width", 2)
  _heatmap.svg.append("line")
    .attr("class", "hmrowhighlight " + id)
    .attr("x1", _heatmap.xScale(_heatmap.xScale.domain()[0]))
    .attr("y1", _heatmap.yScale(id) + _heatmap.yScale.bandwidth() + 1 )
    .attr("x2", _heatmap.xScale.bandwidth() + 
      _heatmap.xScale(_heatmap.xScale.domain()[_heatmap.xScale.domain().length-1]))
    .attr("y2", _heatmap.yScale(id) + _heatmap.yScale.bandwidth() + 1)
    .attr("stroke", green ? HLSTATIC : HLVOLATILE)
    .attr("stroke-width", 2)
  _heatmap.svg.append("line")
    .attr("class", "hmrowhighlight " + id)
    .attr("x1", _heatmap.xScale(_heatmap.xScale.domain()[0]))
    .attr("y1", _heatmap.yScale(id) - 2 )
    .attr("x2", _heatmap.xScale(_heatmap.xScale.domain()[0]))
    .attr("y2", _heatmap.yScale(id) + _heatmap.yScale.bandwidth() + 2 )
    .attr("stroke", green ? HLSTATIC : HLVOLATILE)
    .attr("stroke-width", 2)
  _heatmap.svg.append("line")
    .attr("class", "hmrowhighlight " + id)
    .attr("x1", _heatmap.xScale.bandwidth() + 
      _heatmap.xScale(_heatmap.xScale.domain()[_heatmap.xScale.domain().length-1]))
    .attr("y1", _heatmap.yScale(id) - 2)
    .attr("x2", _heatmap.xScale.bandwidth() + 
      _heatmap.xScale(_heatmap.xScale.domain()[_heatmap.xScale.domain().length-1]))
    .attr("y2", _heatmap.yScale(id) + _heatmap.yScale.bandwidth() + 2)
    .attr("stroke", green ? HLSTATIC : HLVOLATILE)
    .attr("stroke-width", 2)
  
  _heatmap.svg.append("line")
    .attr("class", "hmrowhighlight " + id)
    .attr("y1", _heatmap.yScale(_heatmap.yScale.domain()[0]))
    .attr("x1", _heatmap.xScale(id)-1)
    .attr("y2", _heatmap.yScale.bandwidth() + 
      _heatmap.yScale(_heatmap.yScale.domain()[_heatmap.yScale.domain().length-1]))
    .attr("x2", _heatmap.xScale(id)-1)
    .attr("stroke", green ? HLSTATIC : HLVOLATILE)
    .attr("stroke-width", 2)
  _heatmap.svg.append("line")
    .attr("class", "hmrowhighlight " + id)
    .attr("y1", _heatmap.yScale(_heatmap.yScale.domain()[0]))
    .attr("x1", _heatmap.xScale(id) + _heatmap.xScale.bandwidth() + 1 )
    .attr("y2", _heatmap.yScale.bandwidth() + 
      _heatmap.yScale(_heatmap.yScale.domain()[_heatmap.yScale.domain().length-1]))
    .attr("x2", _heatmap.xScale(id) + _heatmap.xScale.bandwidth() + 1)
    .attr("stroke", green ? HLSTATIC : HLVOLATILE)
    .attr("stroke-width", 2)
  _heatmap.svg.append("line")
    .attr("class", "hmrowhighlight " + id)
    .attr("y1", _heatmap.yScale(_heatmap.yScale.domain()[0]))
    .attr("x1", _heatmap.xScale(id) - 2 )
    .attr("y2", _heatmap.yScale(_heatmap.yScale.domain()[0]))
    .attr("x2", _heatmap.xScale(id) + _heatmap.xScale.bandwidth() + 2 )
    .attr("stroke", green ? HLSTATIC : HLVOLATILE)
    .attr("stroke-width", 2)
  _heatmap.svg.append("line")
    .attr("class", "hmrowhighlight " + id)
    .attr("y1", _heatmap.yScale.bandwidth() + 
      _heatmap.yScale(_heatmap.yScale.domain()[_heatmap.yScale.domain().length-1]))
    .attr("x1", _heatmap.xScale(id) - 2)
    .attr("y2", _heatmap.yScale.bandwidth() + 
      _heatmap.yScale(_heatmap.yScale.domain()[_heatmap.yScale.domain().length-1]))
    .attr("x2", _heatmap.xScale(id) + _heatmap.xScale.bandwidth() + 2)
    .attr("stroke", green ? HLSTATIC : HLVOLATILE)
    .attr("stroke-width", 2)

  d3.selectAll(".cell.c"+id).moveToFront()
  d3.selectAll(".cell.hmselected").moveToFront()
  d3.selectAll("line.hmrowhighlight").moveToFront()
} //}}}

function unhighlightHeatMapRow(id) { //{{{
  _heatmap.svg.selectAll(".hmrowhighlight")._groups[0].forEach(e => {
    if(e.classList.contains(id))
      e.remove()
  })
} //}}}
