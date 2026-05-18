"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CsvImportForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    updated: number;
    total: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Select a CSV file");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/import", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Import failed");
      if (data.details) setResult({ created: 0, updated: 0, total: 0, errors: data.details });
      return;
    }

    setResult(data);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 p-4 text-sm">
        <p className="font-medium text-slate-900">CSV / Excel format</p>
        <p className="mt-1 text-[var(--muted)]">
          Upload a <strong>.csv</strong> file (export Excel spreadsheets to CSV). Required
          column: <code className="rounded bg-white px-1">studentId</code> (school student
          number). Optional: <code className="rounded bg-white px-1">className</code> (must match
          an existing class). Login emails are generated automatically.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-3 text-xs">
          studentId,className{"\n"}
          02250364.cst,Year 1 · Software Engineering — Programming Fundamentals
        </pre>
        <p className="mt-2 text-xs text-[var(--muted)]">Default password for new students: password123</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">CSV file</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? "Importing…" : "Upload & import"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {result ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm">
          <p className="font-medium text-slate-900">Import complete</p>
          <p className="mt-1 text-[var(--muted)]">
            {result.created} created · {result.updated} updated · {result.total} rows processed
          </p>
          {result.errors.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-amber-800">
              {result.errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
