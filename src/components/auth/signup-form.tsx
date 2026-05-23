"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildStudentEmail } from "@/lib/account-naming";
import { PasswordInput } from "@/components/ui/password-input";

type SchoolOption = {
  id: string;
  name: string;
  university: string | null;
  institutionLevel: "COLLEGE" | "SCHOOL";
  collegeCode: string | null;
  district: string;
  emailDomain: string;
};

export function SignupForm() {
  const router = useRouter();
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedSchool = schools.find((s) => s.id === schoolId);
  const isCollege = selectedSchool?.institutionLevel === "COLLEGE";

  const previewEmail =
    studentNumber.trim() && selectedSchool
      ? buildStudentEmail(studentNumber, {
          emailDomain: selectedSchool.emailDomain,
          institutionLevel: selectedSchool.institutionLevel,
        })
      : "";

  useEffect(() => {
    fetch("/api/auth/schools")
      .then((res) => res.json())
      .then((data) => {
        const list = (data.schools ?? []) as SchoolOption[];
        setSchools(list);
        if (list.length === 1) setSchoolId(list[0].id);
      })
      .catch(() => setError("Could not load institutions. Refresh the page."));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId,
        studentNumber,
        displayName,
        department: isCollege ? department : undefined,
        yearOfStudy: isCollege ? yearOfStudy : undefined,
        password,
        confirmPassword,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Sign-up failed");
      return;
    }

    router.push(data.redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="school" className="mb-1.5 block text-sm font-medium text-slate-700">
          Institution
        </label>
        <select
          id="school"
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
          required
        >
          <option value="">Select your college or school…</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
              {school.collegeCode ? ` (${school.collegeCode.toUpperCase()})` : ""} — {school.district}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="studentNumber" className="mb-1.5 block text-sm font-medium text-slate-700">
            Student ID (used to sign in)
          </label>
          <input
            id="studentNumber"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            placeholder={isCollege ? "e.g. 02250359.cst" : "e.g. 201.00310.11.0036"}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none ring-brand-600 focus:ring-2"
            required
          />
        </div>
        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Norzin Wangmo"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none ring-brand-600 focus:ring-2"
            required
          />
        </div>
      </div>

      {isCollege ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-slate-700">
              Department / programme
            </label>
            <input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Software Engineering"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="year" className="mb-1.5 block text-sm font-medium text-slate-700">
              Year of study
            </label>
            <input
              id="year"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              placeholder="e.g. Year 1"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm"
            />
          </div>
        </div>
      ) : null}

      {previewEmail ? (
        <p className="text-xs text-[var(--muted)]">
          Your institutional email will be: <strong className="text-slate-700">{previewEmail}</strong>{" "}
          (for records only — sign in with your <strong>student ID</strong>).
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-slate-700">
            Confirm password
          </label>
          <PasswordInput
            id="confirm"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            autoComplete="new-password"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading || schools.length === 0}
        className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create student account"}
      </button>

      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>

      <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        <strong>Lecturers, teachers, and administrators</strong> cannot self-register. Ask your school
        admin to create staff accounts with an institutional education email.
      </p>
    </form>
  );
}
