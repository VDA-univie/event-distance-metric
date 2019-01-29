class DetailPathContainer {
  constructor(meta) {
    this.detailpath       = null
    this.label            = meta.label
    this.id               = meta.label.split('-')[0]
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

  setDetailPath(sl) {
    this.detailpath = sl
  }

  appendTo(target) {
    $(target).append(this.toDiv())
  }

  toDiv() {
    var out = $("<div />", { id: "dp" + this.label, class: "detailPathContainer row dp" + this.label })
    var p = $("<div />", { class: "detailpath svg col dp"+this.label })
    var o = $("<div />", { class: "detailpath details col dp"+this.label })
    o.append(DetailPathContainer.createSpan(this.id, "id", "ID:"))
    o.append(DetailPathContainer.createSpan(this.studyid, "studyid", "StudyID:"))
    o.append(DetailPathContainer.createSpan(this.semester, "semester", "No. Semester:"))
    o.append(DetailPathContainer.createSpan(this.ects, "ects", "ECTS:"))
    o.append(DetailPathContainer.createSpan(this.peak, "peak", "Max ECTS in one Semester:"))
    o.append(DetailPathContainer.createSpan(Math.round(this.meansemesterects*100)/100, "meansemesterects", "Mean ECTS/ Semester:"))
    o.append(DetailPathContainer.createSpan(this.startsemester, "startsemester", "First Semester:"))
    o.append(DetailPathContainer.createSpan(Math.round(this.meangrade*100)/100, "meangrade", "Mean Grade:"))
    o.append(DetailPathContainer.createSpan(this.mediangrade, "mediangrade", "Median Grade:"))
    o.append(DetailPathContainer.createSpan(this.state, "state", "Status:"))
    out.append(p).append(o)
    return out
  }

  static createSpan(content, classname, text) {
    var out  = $("<div />", { class: "detailpath meta "+classname })
    out.append($("<span />", { text: text, class: classname+" text" }))
    out.append($("<span />", { text: content, class: classname+" content"}))
    return out
  }
}
