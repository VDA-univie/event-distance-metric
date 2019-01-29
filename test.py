#!/usr/local/bin/python
import sys
import csv
import datetime
import random
from multiprocessing import Pool
from itertools import chain
from importlib import reload

import numpy as np

sys.path.append('classes')
sys.path.append('metrics')
import exam
import path
import progress
import student
import study
import abstract
import raph
import raphimproved
import emd
import energy
import dameraulevenshtein
import studywrangler

import raphsocketserver

def toDateTime(str):
    return datetime.date(*list(map(lambda x: int(x), str.split('-'))))

def aggregateStudentData(m, i, exams, progresses):
    ex = [x for x in exams if x.matnr == m]
    pro = [x for x in progresses if x.matnr == m]
    return (m, i, pro, ex)

def createStudent(m, i, pro, ex):
    return student.Student(m, i, pro, ex)

def createPathVariations(students, ipath, label, count, amount = [0.5, 0.4, 0.1], direction = 0):
    #paths = []
    studies = []
    testy = student.getStudentById(students, ipath.studentid)
    testystudy = next((x for x in testy.studies if x.id == ipath.studyid), None)
    firstsem = ipath.getFirstSemester()
    lastsem = study.changeSemester(ipath.getLastSemester(), 2)
    allsem = study.createSemesters(firstsem, lastsem)

    for c in range(count):
        #newsemester = [[] for a in range(len(ipath.semester)+len(amount)-1)]
        courses = []
        for i, sem in enumerate(ipath.semester):
            for course in sem:
                change = random.random()
                add = 0
                am = 0
                for j, x in enumerate(amount):
                    am += x
                    add = j
                    if change <= am:
                        break

                if direction == 0:
                    if random.random() <= 0.5:
                        add *= -1
                else:
                    add *= direction
                if add + i < 0:
                    add = 0
                pos = i + add
                course.semester = allsem[pos]
                courses.append(course)

        studies.append(study.Study(testystudy.studycode, testystudy.studentid,
                            testystudy.matnr, courses, testystudy.progress,
                            label + "-" + str(c)))
        #paths.append(path.Path(newsemester, label, testystudy.id, ipath.studentid, ipath.studycode, ipath.state))
    return studies


exams = []
with open('../data/allpruefungsleistungen.csv', newline='') as plcsv:
  plreader = csv.DictReader(plcsv, delimiter=';')
  for r in plreader:
    exams += [exam.Exam(r['matnr'], r['studyid'], r['courseid'], r['coursename'], \
        toDateTime(r['date']), r['semester'], r['ects'], r['grade'])]

progresses = []
with open('../data/allstudienstatus.csv', newline='') as svcsv:
    svreader = csv.DictReader(svcsv, delimiter=';')
    for i, r in enumerate(svreader):
        progresses += [progress.Progress(i, r['matnr'], r['studyid'], \
            toDateTime(r['start']), toDateTime(r['end']), \
            r['reason'], r['state'])]

matnrs = set(map(lambda x: x.matnr, progresses))
iter = []
for i, m in enumerate(matnrs):
    iter.append((m, i, exams, progresses))

if __name__ == '__main__':
    with Pool(5) as pool:
        studentdata = pool.starmap(aggregateStudentData, iter)
        students = pool.starmap(createStudent, studentdata)
#students = datawrangler.aggregateStudents(exams, progresses)
#print(students[0].studies[0].path.semester)

ids = ["2965-521", "4104-521", "4821-521", "4644-521"]
searchmatnrs = ["7e654dd40551ff1d91b3edcc7fe1ece2", "ac57ff0651c115e88366dd0565127ce9", \
    "f6f1cd4abf0f64d930cc049203d11933", "ee4c47eae82ea9c4652348d044c4d4ba"]

#a = student.filterStudyPaths(students, ["2009W", "2009W"])
a = student.filterStudyPaths(students, ["2011W", "2011W"], "2015S", [180,180], "beendet", "521")
a = student.filterStudyPaths(students, None, None, None, None, None, ids)
list(map(lambda x: [x.studyid, x.ects, x.getLength()], a))


reload(study)
sem = '2011W'
study.changeSemester(sem, 7)

s = [x for x in students if x.matnr in searchmatnrs]
a = [item.path for sublist in [x.studies for x in s] for item in sublist if item.studycode == "521"]
a
n = 1
a[n].label
testy = student.getStudentById(students, a[n].studyid)
testystudy = next((x for x in testy.studies if x.id == a[n].studyid), None)
testystudy.path
testystudy.path == a[n]

studies = student.extractStudies(students)
[x for x in studies if x.studycode == '521']

reload(exam)
#b = [item for sublist in [createPathVariations(students, b, "eins", 25) for b in a] for item in sublist]
genstudies = (createPathVariations(students, a[0], "0", 25)
    + createPathVariations(students, a[1], "1", 25)
    + createPathVariations(students, a[2], "2", 25)
    + createPathVariations(students, a[3], "3", 25))

a[0].label = "0"
a[1].label = "1"
a[2].label = "2"
a[3].label = "3"
b = study.getAllPaths(genstudies)
b[0] = a[0]
b[25] = a[1]
b[50] = a[2]
b[75] = a[3]
print(b[0])
print(students[0].studies[0])

import emd
import energy
a.sort(key=lambda x: x.getFirstSemester(), reverse=False)
print(len(a))
metric = raph.RaphMetric(b)
emd = emd.EarthMoversMetric(b)
energy = energy.EnergyDistanceMetric(b)
dlev = dameraulevenshtein.DamerauLevenshteinMetric(b)

distanceMatrix, names = metric.calculateDistance()
names
print(distanceMatrix)

reload(raph)
metric2 = raphimproved.RaphMetricImproved(b)
rdistanceMatrix, rnames = metric2.calculateDistance()
rnames
print(rdistanceMatrix)


emdistanceMatrix, emnames = emd.calculateDistance()
emnames
print(emdistanceMatrix)
endistanceMatrix, ennames = energy.calculateDistance()
ennames
print(endistanceMatrix)
dlevdistanceMatrix, dlevnames = dlev.calculateDistance()
dlevnames
print(dlevdistanceMatrix)
#distanceDict = metric.calculateDistanceDict()
#print(distanceDict)
reload(dameraulevenshtein)
print(metric.allCourseNames)
distance = metric.calculatePathDistance(a[0], a[1])
x = student.getStudentById(students, metric.paths[0].label)
print(a[0])
print(a[1])
print(distance)
dist2 = metric.calculatePathDistance(a[1],a[0])
dist3 = metric.calculatePathDistance(a[2],a[1])
print([dist2, dist3])

np.save("./raphdist", distanceMatrix)
np.save("./raphimdist", rdistanceMatrix)
np.save("./emdist", emdistanceMatrix)
np.save("./endist", endistanceMatrix)
np.save("./dlevdist", dlevdistanceMatrix)
np.save("./labels", names)

reload(study)
sdw = studywrangler.StudyWrangler(genstudies)
sdw.studies[0].exams[0].__dict__
sdw.get_all_line_data()

import userpath
reload(userpath)
reload(raphimproved)
inputpaths = [
    "abcd",
    "abc-d",
    "abd-c",
    "acd-b",
    "bcd-a",
    "ab-cd",
    "ac-bd",
    "ad-bc",
    "bc-ad",
    "bd-ac",
    "cd-ab",
    "a-bcd",
    "b-acd",
    "c-abd",
    "d-abc",
    "ab-c-d",
    "ab-d-c",
    "ac-b-d",
    "ac-d-b",
    "ad-b-c",
    "ad-c-b",
    "bc-a-d",
    "bc-d-a",
    "bd-a-c",
    "bd-c-a",
    "cd-a-b",
    "cd-b-a",
    "a-bc-d",
    "a-bd-c",
    "a-cd-b",
    "b-ac-d",
    "b-ad-c",
    "b-cd-a",
    "c-ab-d",
    "c-ad-b",
    "c-bd-a",
    "d-ab-c",
    "d-ac-b",
    "d-bc-a",
    "a-b-cd",
    "a-c-bd",
    "a-d-bc",
    "b-a-cd",
    "b-c-ad",
    "b-d-ac",
    "c-a-bd",
    "c-b-ad",
    "c-d-ab",
    "a-b-c-d",
    "a-b-d-c",
    "a-c-b-d",
    "a-c-d-b",
    "a-d-b-c",
    "a-d-c-b",
    "b-a-c-d",
    "b-a-d-c",
    "b-c-a-d",
    "b-c-d-a",
    "b-d-a-c",
    "b-d-c-a",
    "c-a-b-d",
    "c-a-d-b",
    "c-b-a-d",
    "c-b-d-a",
    "c-d-a-b",
    "c-d-b-a",
    "d-a-b-c",
    "d-a-c-b",
    "d-b-a-c",
    "d-b-c-a",
    "d-c-a-b",
    "d-c-b-a"
    ]
inputpaths = ["Z-Y-X", "X-YZ", "XYZ", "XY-Z", "X-Y-Z"]
reload()
inputpaths = ["ABC-DEF-GHI-JKL", "AB-CD-EF-GH-IJ-KL"]
inputpaths = ["A-BC-DEF-G", "DFG-AE-C-B"]

paths = student.extractPaths(userpath.create_user_students(inputpaths))
userpaths_metric = raphimproved.RaphMetricImproved(paths)
userpaths_distance, upnames = userpaths_metric.calculateDistance()
userpaths_distance
upnames
head = ",".join(upnames)
head
n,m = userpaths_distance.shape
i_lower = np.tril_indices(n, -1)
userpaths_distance[i_lower] = userpaths_distance.T[i_lower]
np.savetxt("userpath.csv", userpaths_distance, fmt="%1.4f", delimiter=',', header=head)

tnam = ['a', 'b', 'c']
test = np.array([[1,2,3],[4,5,6],[7,8,9]])
print(np.insert(test, 0, tnam, axis=1))
print(test[np.triu_indices_from(test,1)])
