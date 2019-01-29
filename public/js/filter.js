var _filterids      = []
var _filtervals     = {}

function updateFilter(type, min, max) {
  var nufilter = []
  if(type != "status") {
    _filtervals[type].min = min
    _filtervals[type].max = max
  } else {
    _filtervals.state = min
  }
  var startsem = _filtervals.startsemestervals.slice(
    _filtervals.startsemester.min,
    _filtervals.startsemester.max+1
  )
  var statusfilter = _filtervals.state.length == 0 ? ["beendet", "offen"] : _filtervals.state
  _sparkcontainer.forEach(e => {
    if( _filtervals.ects.min              <= e.ects &&
        e.ects                            <= _filtervals.ects.max &&
        _filtervals.meangrade.min         <= e.meangrade &&
        e.meangrade                       <= _filtervals.meangrade.max &&
        _filtervals.meansemesterects.min  <= e.meansemesterects &&
        e.meansemesterects                <= _filtervals.meansemesterects.max &&
        _filtervals.mediangrade.min       <= e.mediangrade &&
        e.mediangrade                     <= _filtervals.mediangrade.max &&
        _filtervals.peak.min              <= e.peak &&
        e.peak                            <= _filtervals.peak.max &&
        _filtervals.semester.min          <= e.semester &&
        e.semester                        <= _filtervals.semester.max &&
        startsem.includes(e.startsemester) &&
        statusfilter.includes(e.state)
    )
      nufilter.push(e.label)
  })
  _filterids = nufilter
  _sparktable.draw()
}

function metaMinMax(meta) { //{{{
  var startsem = _.uniq(meta.map(e => e.startsemester)).sort()
  return {
    semester          : {
      min : _.min(meta.map(e => e.semester)),
      max : _.max(meta.map(e => e.semester))
    },
    ects              : {
      min : 0,
      max : _.max(meta.map(e => e.ects))+1
    },
    meangrade         : {
      min : 1,
      max : 5
      //min : Math.round(_.min(meta.map(e => e.meangrade))),
      //max : _.max(meta.map(e => e.meangrade))
    },
    meansemesterects  : {
      min : 0,
      //min : Math.round(_.min(meta.map(e => e.meansemesterects))),
      max : _.max(meta.map(e => e.meansemesterects))+1
    },
    peak              : {
      min : 0,
      //min : _.min(meta.map(e => e.peak)),
      max : _.max(meta.map(e => e.peak))
    },
    mediangrade       : {
      min : 1,
      max : 5
      //min : Math.round(_.min(meta.map(e => e.mediangrade))),
      //max : Math.round(_.max(meta.map(e => e.mediangrade)))
    },
    startsemestervals : startsem,
    startsemester     : {
      min : 0,
      max : startsem.length-1
    },
    state: []
  }
} //}}}
