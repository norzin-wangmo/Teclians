"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type GradeRow = {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  studentName: string;
  className: string;
};

export function GradeEditor({ grades }: { grades: GradeRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [score, setScore] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function startEdit(grade: GradeRow) {
    setEditingId(grade.id);
    setTitle(grade.title);
    setScore(String(grade.score));
    setMessage("");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setLoading(true);
    setMessage("");

    const res = await fetch(`/api/grades/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, score: Number(score), maxScore: 100 }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? "Update failed");
      return;
    }

    setMessage("Mark updated.");
    setEditingId(null);
    router.refresh();
  }

  if (grades.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No marks to update yet.</p>;
  }

  return (
    <div className="space-y-3">
      {editingId ? (
        <form
          onSubmit={handleUpdate}
          className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-sm"
        >
          <p className="font-medium text-slate-900">Update mark</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2"
              required
            />
            <input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2"
              required
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <ul className="divide-y divide-[var(--border)]">
        {grades.map((grade) => (
          <li key={grade.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
            <div>
              <p className="font-medium text-slate-900">{grade.title}</p>
              <p className="text-[var(--muted)]">
                {grade.studentName} · {grade.className}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">
                {grade.score}/{grade.maxScore}
              </span>
              <button
                type="button"
                onClick={() => startEdit(grade)}
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                Update
              </button>
            </div>
          </li>
        ))}
      </ul>
      {message ? <p className="text-sm text-teal-700">{message}</p> : null}
    </div>
  );
}
