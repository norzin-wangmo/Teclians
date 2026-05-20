"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ASSESSMENT_TYPES, buildAssessmentTitle } from "@/lib/assessment-types";
import type { TeacherClassOption } from "@/components/teacher/teacher-class-types";

export function RecordAssignmentMarksForm({ classes }: { classes: TeacherClassOption[] }) {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [assessmentType, setAssessmentType] = useState<string>(ASSESSMENT_TYPES[0].value);
  const [assessmentName, setAssessmentName] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedClass = classes.find((c) => c.id === classId);
  const students = selectedClass?.students ?? [];
  const title = buildAssessmentTitle(assessmentType, assessmentName);

  function setScore(studentId: string, value: string) {
    setScores((prev) => ({ ...prev, [studentId]: value }));
  }

  function fillAllScores(value: string) {
    const next: Record<string, string> = {};
    for (const s of students) next[s.id] = value;
    setScores(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setMessage("Enter an assessment name.");
      return;
    }

    const max = Number(maxScore);
    if (Number.isNaN(max) || max <= 0) {
      setMessage("Enter a valid maximum score.");
      return;
    }

    const records = students
      .map((s) => {
        const raw = scores[s.id]?.trim();
        if (raw === "" || raw === undefined) return null;
        const score = Number(raw);
        if (Number.isNaN(score) || score < 0 || score > max) return null;
        return { studentId: s.id, score };
      })
      .filter((r): r is { studentId: string; score: number } => r !== null);

    if (records.length === 0) {
      setMessage("Enter at least one student score.");
      return;
    }

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, title, maxScore: max, records }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? "Failed to save marks");
      return;
    }

    setMessage(`Saved ${data.saved ?? records.length} marks for “${title}”.`);
    setScores({});
    setAssessmentName("");
    router.refresh();
  }

  if (classes.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No classes assigned.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Class</label>
          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setScores({});
            }}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Assessment type
          </label>
          <select
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
          >
            {ASSESSMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
            <option value="">Other (name only)</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Assessment name
          </label>
          <input
            type="text"
            value={assessmentName}
            onChange={(e) => setAssessmentName(e.target.value)}
            placeholder="e.g. Assignment 2, Quiz 1"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Out of</label>
          <input
            type="number"
            min={1}
            max={1000}
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      {title ? (
        <p className="text-sm text-slate-700">
          Saving as: <strong>{title}</strong>
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--muted)]">
          Enter marks for each student (leave blank to skip).
        </p>
        <button
          type="button"
          onClick={() => fillAllScores("")}
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          Clear all
        </button>
      </div>

      {students.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No students enrolled in this class.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
          {students.map((student) => (
            <li
              key={student.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{student.name}</p>
                {student.studentNumber ? (
                  <p className="font-mono text-xs text-[var(--muted)]">{student.studentNumber}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={Number(maxScore) || 100}
                  value={scores[student.id] ?? ""}
                  onChange={(e) => setScore(student.id, e.target.value)}
                  placeholder="—"
                  className="w-20 rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-right text-sm"
                  aria-label={`Score for ${student.name}`}
                />
                <span className="text-xs text-[var(--muted)]">/ {maxScore || 100}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div>
        <button
          type="submit"
          disabled={loading || students.length === 0}
          className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save marks"}
        </button>
        {message ? (
          <p
            className={`mt-2 text-sm ${message.includes("Saved") ? "text-teal-700" : "text-red-600"}`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
