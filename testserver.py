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
    studies = []
    testy = student.getStudentById(students, ipath.studentid)
    testystudy = next((x for x in testy.studies if x.id == ipath.studyid), None)
    firstsem = ipath.getFirstSemester()
    lastsem = study.changeSemester(ipath.getLastSemester(), 2)
    allsem = study.createSemesters(firstsem, lastsem)

    for c in range(count):
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
                            label + '-' + str(c)))
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

ids = ["2965-521", "4104-521", "4821-521", "4644-521"]
searchmatnrs = ["7e654dd40551ff1d91b3edcc7fe1ece2", "ac57ff0651c115e88366dd0565127ce9", \
    "f6f1cd4abf0f64d930cc049203d11933", "ee4c47eae82ea9c4652348d044c4d4ba"]

a = student.filterStudyPaths(students, None, None, None, None, None, ids)
list(map(lambda x: [x.studyid, x.ects, x.getLength()], a))

s = [x for x in students if x.matnr in searchmatnrs]
a = [item.path for sublist in [x.studies for x in s] for item in sublist if item.studycode == "521"]

genstudies = (createPathVariations(students, a[0], "0", 25)
    + createPathVariations(students, a[1], "1", 25)
    + createPathVariations(students, a[2], "2", 25)
    + createPathVariations(students, a[3], "3", 25))

studies = [x for x in student.extractStudies(students) if x.studycode == '521']

sdw = studywrangler.StudyWrangler(studies)
server = raphsocketserver.RaphSocketServer(sdw)
server.start_server()
