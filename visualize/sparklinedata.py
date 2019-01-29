def sparkline(path):
    sem = path.semester
    sem.sort()
    allsem = createSemesters(sem[0], sem[-1])
    for i, s in enumerate(allsem):
        out.append({'x': i, 'y': self.sects[s] if s in self.sects else 0})

def sparklinedata(paths):
    out = []
    for p in paths:
        out.append{
            'id': p.label,
            'label': p.label,
            'line': sparkline(p),
            'matnr': p.label.split('-')[0],
            'path': p.label,
            'semester': p.semester
        }
    return out
