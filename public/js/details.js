_details = []

function addDetails(ids) {
  ids.forEach(id => {
    if(_details.indexOf(id) == -1) {
      _details.push(id)
      addDetailPath(id, ".dpaths")
    }
  })
}

function removeDetails(ids) {
  ids.forEach(id => {
    if(_details.indexOf(id) != -1) {
      _details.splice(
        _details.indexOf(id),
        1
      )
      removeDetailPath(id)
    }
  })
}
