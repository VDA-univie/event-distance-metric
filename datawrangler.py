import student

def aggregateStudents(exams, progresses):
    out = []
    matnrs = set(map(lambda x: x.matnr, progresses))
    for i, m in enumerate(matnrs):
        ex = [x for x in exams if x.matnr == m]
        pro = [x for x in progresses if x.matnr == m]
        out.append(Student(m, i, pro, ex))
    return out
