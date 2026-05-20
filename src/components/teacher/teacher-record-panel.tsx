"use client";

import { useState } from "react";
import { GradeEditor, type GradeRow } from "@/components/teacher/grade-editor";
import { RecordAssignmentMarksForm } from "@/components/teacher/record-assignment-marks-form";
import { RecordAttendanceForm } from "@/components/teacher/record-attendance-form";
import type { TeacherClassOption } from "@/components/teacher/teacher-class-types";

const RECORD_TASKS = [
  { value: "attendance", label: "Attendance" },
  { value: "assignment-marks", label: "Assignment & marks" },
  { value: "update-marks", label: "Update existing marks" },
] as const;

type RecordTask = (typeof RECORD_TASKS)[number]["value"];

export function TeacherRecordPanel({
  classes,
  grades,
}: {
  classes: TeacherClassOption[];
  grades: GradeRow[];
}) {
  const [task, setTask] = useState<RecordTask>("attendance");

  const taskMeta = RECORD_TASKS.find((t) => t.value === task);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="record-task" className="mb-1.5 block text-sm font-medium text-slate-700">
          What do you want to record?
        </label>
        <select
          id="record-task"
          value={task}
          onChange={(e) => setTask(e.target.value as RecordTask)}
          className="w-full max-w-md rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-medium text-slate-900"
        >
          {RECORD_TASKS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {taskMeta ? (
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            {task === "attendance" &&
              "Tick students present for a class and date, then save once."}
            {task === "assignment-marks" &&
              "Choose assessment type, enter marks for the whole class list, then save."}
            {task === "update-marks" &&
              "Find and edit marks that were already saved."}
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-slate-50/80 p-4 sm:p-5">
        {task === "attendance" ? <RecordAttendanceForm classes={classes} /> : null}
        {task === "assignment-marks" ? (
          <RecordAssignmentMarksForm classes={classes} />
        ) : null}
        {task === "update-marks" ? <GradeEditor grades={grades} /> : null}
      </div>
    </div>
  );
}
