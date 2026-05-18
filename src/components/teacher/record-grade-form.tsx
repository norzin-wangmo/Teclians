"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Student = { id: string; name: string };
type ClassOption = { id: string; name: string; students: Student[] };

export function RecordGradeForm({ classes }: { classes: ClassOption[] }) {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [studentId, setStudentId] = useState(classes[0]?.students[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [score, setScore] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedClass = classes.find((c) => c.id === classId);
  const students = selectedClass?.students ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        studentId,
        title,
        score: Number(score),
        maxScore: 100,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? "Failed to record grade");
      return;
    }

    setMessage("Grade recorded successfully.");
    setTitle("");
    setScore("");
    router.refresh();
  }

  if (classes.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No classes assigned.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Class</label>
        <select
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            const next = classes.find((c) => c.id === e.target.value);
            setStudentId(next?.students[0]?.id ?? "");
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
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Student</label>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Assessment</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Unit Test 2"
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Score (out of 100)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
          required
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Record grade"}
        </button>
        {message ? <p className="mt-2 text-sm text-teal-700">{message}</p> : null}
      </div>
    </form>
  );
}
