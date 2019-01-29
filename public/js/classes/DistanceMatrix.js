class DistanceMatrix {
  constructor(data) {
    this.data = {}
    this.labels = _.uniq(data.map(e => e.x)).sort()

    this.labels.forEach(e => this.createDataRow(e, data))
  }
  
  createDataRow(id, din) {
    var xs = din.filter(e => e.x == id)
    var row = {}
    xs.forEach(e => row[e.y] = e.value)
    this.data[id] = row
  }

  getValue(x, y) {
    return this.data[x][y]
  }
}
