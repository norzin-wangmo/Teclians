"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StudentManager } from "@/components/teacher/student-manager";
import type { StudentRecord } from "@/lib/students";

type ClassOption = { id: string; name: string };

function sortStudents(students: StudentRecord[]) {
  return [...students].sort((a, b) => {
    const year = (a.yearOfStudy ?? "").localeCompare(b.yearOfStudy ?? "");
    if (year !== 0) return year;
    const dept = (a.department ?? "").localeCompare(b.department ?? "");
    if (dept !== 0) return dept;
    return a.name.localeCompare(b.name);
  });
}

export function AdminStudentsByClass({
  classes,
  students,
  schoolEmailDomain,
  institutionLevel,
}: {
  classes: ClassOption[];
  students: StudentRecord[];
  schoolEmailDomain: string;
  institutionLevel: "COLLEGE" | "SCHOOL";
}) {
  const [classId, setClassId] = useState("");
  const [query, setQuery] = useState("");

  const classStudents = useMemo(() => {
    if (!classId) return [];
    const list = students.filter((s) => s.classIds.includes(classId));
    return sortStudents(list);
  }, [students, classId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classStudents;
    return classStudents.filter(
      (s) =>
        s.studentNumber.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.department?.toLowerCase().includes(q) ?? false) ||
        (s.yearOfStudy?.toLowerCase().includes(q) ?? false),
    );
  }, [classStudents, query]);

  const selectedClass = classes.find((c) => c.id === classId);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Select a <strong>class</strong> first to view and manage students enrolled in that class.
        Students are sorted by year of study, then department, then name.
      </div>

      <div>
        <label htmlFor="admin-class-pick" className="mb-1.5 block text-sm font-medium text-slate-700">
          Class
        </label>
        <select
          id="admin-class-pick"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            setQuery("");
          }}
          className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-medium"
        >
          <option value="">Choose a class…</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {!classId ? (
        <p className="text-sm text-[var(--muted)]">
          Pick a class from the dropdown to see student details.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {selectedClass?.name} — {filtered.length} student
              {filtered.length === 1 ? "" : "s"}
            </h3>
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in this class…"
                className="w-full rounded-lg border border-[var(--border)] bg-white py-2 pl-9 pr-3 text-sm outline-none ring-blue-500 focus:ring-2"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No students enrolled in this class.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
              {filtered.map((student) => (
                <li key={student.id} className="px-4 py-3 text-sm">
                  <p className="font-semibold text-slate-900">{student.name}</p>
                  {(student.department || student.yearOfStudy) && (
                    <p className="text-xs text-slate-700">
                      {[student.yearOfStudy, student.department].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="font-mono text-xs text-slate-700">ID: {student.studentNumber}</p>
                  <p className="text-xs text-[var(--muted)]">{student.email}</p>
                </li>
              ))}
            </ul>
          )}

          <StudentManager
            classes={classes}
            students={classStudents}
            schoolEmailDomain={schoolEmailDomain}
            institutionLevel={institutionLevel}
            canDelete
          />
        </>
      )}
    </div>
  );
}
