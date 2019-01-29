_lassoSelection = []

function drawScatterplot(data, target) { //{{{
  var margin = { top: 50, right: 20, bottom: 20, left: 50 }
                    
  var width = 650 - margin.right - margin.left,
      height = 650 - margin.top - margin.bottom
  
  var dataminX = d3.min(data.map(e => e.x)),
      dataminY = d3.min(data.map(e => e.y)),
      datamaxX = d3.max(data.map(e => e.x)),
      datamaxY = d3.max(data.map(e => e.y))
  
  var datalenmax = d3.max(data.map(e => e.value.length))

  var xScale = d3.scaleLinear()
    .range([0, width])
    .domain([dataminX, datamaxX])

  var yScale = d3.scaleLinear()
    .range([0, width])
    .domain([dataminY, datamaxY])
	
  //var colorScale = d3.scaleSequential(d3.interpolateWarm)
  
  var tooltip = d3.select(".tooltipland").append("div")
    .attr("class", "sptooltip")
    .style("opacity", 0);

	var svg = d3.select(target)
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
	var g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var circles = g.selectAll("circle")
      .data(data)
    .enter().append("circle")
      .attr("class", d => "dot c"+d.value)
      .attr("r", 6)
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("fill", "grey")//d => colorScale(d.value.length/datalenmax))
      .attr("label", d => d.value)
      .on("mouseover", d => scatterPlotMouseOver(d, tooltip))
      .on("mouseout", d => scatterPlotMouseOut(d, tooltip)) 
      .on("click", d => scatterPlotClick(d.value))

	g.append("g")
			.attr("class", "y axis")
			.call(d3.axisLeft(yScale))

	g.append("g")
			.attr("class", "x axis")
			.call(d3.axisBottom(xScale))
      .attr("transform", "translate(0," + height + ")")

	var lasso_start = function() {
			lasso.items()
					.classed("not_possible",true)
	}

	var lasso_draw = function() {
			// Style the possible dots
			lasso.possibleItems()
					.classed("not_possible",false)
					.classed("possible",true)

			// Style the not possible dot
			lasso.notPossibleItems()
					.classed("not_possible",true)
					.classed("possible",false)
	}

	var lasso_end = function() {
			lasso.items()
					.classed("not_possible",false)
					.classed("possible",false)

			scatterPlotLassoSelect(lasso.selectedItems())
	}

	var lasso = d3.lasso()
			.closePathSelect(true)
			.closePathDistance(100)
			.items(circles)
			.targetArea(svg)
			.on("start",lasso_start)
			.on("draw",lasso_draw)
			.on("end",lasso_end)

	svg.call(lasso)
  _scatterPlot = {
    svg: svg,
    data: data
  }
} //}}}
      
function scatterPlotMouseOver(d, tooltip) { //{{{
  addHighlight([d.value])
  tooltip.transition()
     .duration(200)
     .style("opacity", .9);
  tooltip.html(d.value) 
     .style("left", (event.clientX + 15) + "px")
     .style("top", (event.clientY - 10) + "px");
} //}}}

function scatterPlotMouseOut(d, tooltip) { //{{{
  removeHighlight([d.value])
  tooltip.transition()
    .duration(500)
    .style("opacity", 0);
} //}}}

function scatterPlotClick(id) { //{{{
  if(isHighlighted(id)) {
    removeDetails([id])
    removeHighlight([id], true)
  } else {
    addDetails([id])
    addHighlight([id], true)
  }
} //}}}

function scatterPlotLassoSelect(items) { //{{{
  if(items._groups[0].length) {
    if(_lassoSelection.length) { 
      removeHighlight(_lassoSelection, true)
      removeDetails(_lassoSelection)
    }
    _lassoSelection = []
    items._groups[0].forEach(e => {
      _lassoSelection.push(e.attributes["label"].value)
    })
    addHighlight(_lassoSelection, true)
    addDetails(_lassoSelection)
  } else {
    removeHighlight(_lassoSelection, true)
    removeDetails(_lassoSelection)
    _lassoSelection = []
  }
} //}}}

function highlightScatterPlot(id, isstatic = false) { //{{{
  _scatterPlot.svg.selectAll("circle")._groups[0].forEach(e => {
    if(e.attributes["label"])
      if(e.attributes["label"].value == id)
        e.classList.add(isstatic ? "selected" : "selectedvolatile")
  })
  d3.select(".dot.c"+id).moveToFront()
} //}}}

function unhighlightScatterPlot(id, isstatic = false) { //{{{
  _scatterPlot.svg.selectAll("circle")._groups[0].forEach(e => {
    if(e.attributes["label"])
      if(e.attributes["label"].value == id)
        e.classList.remove(isstatic ? "selected" : "selectedvolatile")
  })
} //}}}
