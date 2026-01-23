"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function page() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const classId = searchParams.get("class");
  const date = searchParams.get("date");
  const hour = searchParams.get("hour");

  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!classId || !date || !hour) {
      router.replace("/attendance/details");
      return;
    }

    fetch(`/api/students?class=${classId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.data);

        setRecords(
          data.data.map((s: any) => ({
            student: s._id,
            status: "P",
          })),
        );
      });
  }, [classId, date, hour]);

  const toggleStatus = (studentId: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.student === studentId
          ? { ...r, status: r.status === "P" ? "A" : "P" }
          : r,
      ),
    );
  };

  const submitAttendance = async () => {
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class: classId,
        date,
        hour,
        records,
      }),
    });

    router.push("/attendance");
  };

  return (
    <div>
      <h2>Mark Attendance</h2>

      {students.map((s) => (
        <div key={s._id}>
          <span>{s.name}</span>
          <button onClick={() => toggleStatus(s._id)}>
            {records.find((r) => r.student === s._id)?.status}
          </button>
        </div>
      ))}

      <button onClick={submitAttendance}>Submit</button>
    </div>
  );
}
