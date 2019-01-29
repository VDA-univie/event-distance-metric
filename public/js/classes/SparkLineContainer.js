class SparkLineContainer {
  constructor(meta) {
    this.sparkline        = null
    this.label            = meta.label
    this.id               = meta.label
    this.semester         = meta.semester
    this.ects             = meta.ects
    this.studyid          = meta.studyid
    this.state            = meta.state
    this.peak             = meta.peak
    this.meansemesterects = meta.meansemesterects
    this.startsemester    = meta.startsemester
    this.meangrade        = meta.meangrade
    this.mediangrade      = meta.mediangrade
  }

  setSparkLine(sl) {
    this.sparkline = sl
  }

  appendTo(target) {
    var tcont = document.getElementById(target)
    tcont.appendChild(this.toTr())
  }

  toTr() {
    var out = document.createElement("tr")
    out.id = "sl" + this.label
    out.classList.add("sparkLineContainer", "sl" + this.label)
    out.appendChild(SparkLineContainer.createTd(this.id.split('-')[0], "id"))
    out.appendChild(SparkLineContainer.createTd("", "line"))
    out.appendChild(SparkLineContainer.createTd(this.studyid.split('-')[1], "studyid"))
    out.appendChild(SparkLineContainer.createTd(this.semester, "semester"))
    out.appendChild(SparkLineContainer.createTd(this.ects, "ects"))
    out.appendChild(SparkLineContainer.createTd(this.peak, "peak"))
    out.appendChild(SparkLineContainer.createTd(Math.round(this.meansemesterects*100)/100, "meansemesterects"))
    out.appendChild(SparkLineContainer.createTd(this.startsemester, "startsemester"))
    out.appendChild(SparkLineContainer.createTd(Math.round(this.meangrade*100)/100, "meangrade"))
    out.appendChild(SparkLineContainer.createTd(this.mediangrade, "mediangrade"))
    out.appendChild(SparkLineContainer.createTd(this.state, "state"))
    return out
  }

  static createTd(content, classname) {
    var out  = document.createElement("td")
    out.classList.add("sparkLineContainer", classname)
    out.appendChild( document.createTextNode(content) )
    return out
  }
}
