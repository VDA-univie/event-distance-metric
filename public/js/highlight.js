_highlightedPaths = { //{{{
  volatile: [],
  static: [],
  pairs: []
}

_highlightedCourses = {
  volatile: [],
  static: []
} //}}}

function addHighlight(ids, isstatic = false) { //{{{
  ids.forEach(id => {
    if(isstatic) {
      if(!_highlightedPaths.static.includes(id)) {
        _highlightedPaths.static.push(id)
        highlightSmallLine(id, true)
        highlightScatterPlot(id, true)
        if(_highlightedPaths.static.length > 1) {
          unhighlightHeatMapRow(_highlightedPaths.static[0])
          highlightHeatMap(_highlightedPaths.pairs = generateHighlightPairs(_highlightedPaths.static))
        } else if(_highlightedPaths.static.length == 1) {
          highlightHeatMapRow(id, true)
        }
      } 
    } else {
      if(!_highlightedPaths.volatile.includes(id)) {
        _highlightedPaths.volatile.push(id)
        highlightSmallLine(id)
        highlightHeatMapRow(id)
        highlightScatterPlot(id)
      }
    }
  })
} //}}}

function removeHighlight(ids, isstatic = false) { //{{{
  ids.forEach(id => {
    if(isstatic) {
      if(_highlightedPaths.static.includes(id)) {
        _highlightedPaths.static.splice(
          _highlightedPaths.static.indexOf(id), 
          1
        )
        unhighlightSmallLine(id, true)
        unhighlightScatterPlot(id, true)
        var temp = []
        _highlightedPaths.pairs.forEach(e => {
          if(e.includes(id)) {
            unhighlightHeatMap([e])
          } else temp.push(e)
        })
        _highlightedPaths.pairs = temp
        if(_highlightedPaths.static.length == 1) 
          highlightHeatMapRow(_highlightedPaths.static[0], true)
        else 
          unhighlightHeatMapRow(id)
      } 
    } else {
      if(_highlightedPaths.volatile.includes(id)) {
        _highlightedPaths.volatile.splice(
          _highlightedPaths.volatile.indexOf(id), 
          1
        )
        unhighlightSmallLine(id)
        unhighlightScatterPlot(id)
        unhighlightHeatMapRow(id)
        if(_highlightedPaths.static.length == 1) 
          highlightHeatMapRow(_highlightedPaths.static[0], true)
      }
    }
  })
} //}}}

function addCourseHighlight(id, isstatic = false) { //{{{
  if(isstatic) {
    if(!_highlightedCourses.static.includes(id)) {
      _highlightedCourses.static.push(id)
      highlightCourse(id, isstatic)
    }
  } else {
    if(!_highlightedCourses.volatile.includes(id)) {
      _highlightedCourses.volatile.push(id)
      highlightCourse(id, isstatic)
    }
  }
} //}}}

function removeCourseHighlight(id, isstatic = false) { //{{{
  if(isstatic) {
    if(_highlightedCourses.static.includes(id)) {
      _highlightedCourses.static.splice(
        _highlightedCourses.static.indexOf(id), 
        1
      )
      unhighlightCourse(id, isstatic)
    } 
  } else {
    if(_highlightedCourses.volatile.includes(id)) {
      _highlightedCourses.volatile.splice(
        _highlightedCourses.volatile.indexOf(id), 
        1
      )
      unhighlightCourse(id, isstatic)
    }
  }
} //}}}

function isHighlighted(id) { //{{{
  return _highlightedPaths.static.includes(id)
} //}}}

function isCourseHighlighted(id) { //{{{
  return _highlightedCourses.static.includes(id)
} //}}}

function generateHighlightPairs(ids) { //{{{
  var i = 0
  var pairs = []
  for(; i < ids.length; ++i) 
    for(var j = ids.length-1; j > i; --j) 
      pairs.push([ids[i], ids[j]])
  return pairs
} //}}}

//code for function searchForArray from https://stackoverflow.com/a/19543566/4354066 //{{{
function searchForArray(haystack, needle){
  var i, j, current;
  for(i = 0; i < haystack.length; ++i){
    if(needle.length === haystack[i].length){
      current = haystack[i];
      for(j = 0; j < needle.length && needle[j] === current[j]; ++j);
      if(j === needle.length)
        return i;
    }
  }
  return -1;
} //}}}

function resetAllHighlights() { //{{{
  _highlightedPaths = {
    volatile: [],
    static: [],
    pairs: []
  }

  _highlightedCourses = {
    volatile: [],
    static: []
  }
} //}}}
