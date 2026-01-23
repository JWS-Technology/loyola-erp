"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ChevronLeft,
  CheckCheck,
  Loader2,
  FileText
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-slate-200 text-slate-600",
    "bg-gray-200 text-gray-600",
    "bg-zinc-200 text-zinc-600",
    "bg-neutral-200 text-neutral-600",
    "bg-stone-200 text-stone-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const course = searchParams.get("course");
  const year = searchParams.get("year");
  const classId = searchParams.get("class");
  const date = searchParams.get("date");
  const hour = searchParams.get("hour");

  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "P").length;
    return { total, present, absent: total - present };
  }, [records]);

  useEffect(() => {
    if (!classId || !date || !hour) return;

    // ✅ ONLY CHANGE IS HERE
    fetch(
      `/api/data/student/get-student?class=${classId}&course=${course}&year=${year}`
    )
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.data || []);
        setRecords(
          (data.data || []).map((s: any) => ({
            student: s._id,
            status: "P",
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [classId, date, hour, course, year]);

  const toggleStatus = (studentId: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.student === studentId
          ? { ...r, status: r.status === "P" ? "A" : "P" }
          : r
      )
    );
  };

  const markAllPresent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: "P" })));
  };

  const getStatus = (studentId: string) =>
    records.find((r) => r.student === studentId)?.status;

  const submitAttendance = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course,
          year,
          class: classId,
          date,
          hour,
          records,
        }),
      });
      router.push("/attendance");
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans text-gray-900">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-4 py-4 border-b border-gray-100">
        <div className="max-w-2xl mx-auto flex items-center relative">
          <button
            onClick={() => router.back()}
            className="absolute left-0 p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="w-full text-center">
            <h1 className="text-lg font-bold text-gray-900">Attendance</h1>
            {/* Displaying the newly received data in the header for confirmation */}
            <div className="flex flex-col items-center justify-center gap-1 mt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                {course && <span className="uppercase">{course}</span>}
                {year && <span>• {year} Year</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Hour {hour}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-8">

        {/* Stats Dashboard */}
        <div className="grid grid-cols-3 gap-4">
          {/* Total Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute bottom-0 left-4 right-4 h-1 bg-gray-200 rounded-full" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</span>
            <span className="text-3xl font-bold text-gray-800">{stats.total}</span>
          </div>

          {/* Present Card */}
          <div className="bg-emerald-50/50 rounded-xl shadow-sm border border-emerald-100 p-4 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute bottom-0 left-4 right-4 h-1 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Present</span>
            <span className="text-3xl font-bold text-emerald-700">{stats.present}</span>
          </div>

          {/* Absent Card */}
          <div className="bg-rose-50/50 rounded-xl shadow-sm border border-rose-100 p-4 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute bottom-0 left-4 right-4 h-1 bg-rose-500 rounded-full" />
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Absent</span>
            <span className="text-3xl font-bold text-rose-700">{stats.absent}</span>
          </div>
        </div>

        {/* List Header */}
        <div className="flex items-end justify-between px-1">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Student List</h2>
          <button
            onClick={markAllPresent}
            className="group flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Present
          </button>
        </div>

        {/* Students List */}
        <div className="space-y-3">
          {students.map((s) => {
            const status = getStatus(s._id);
            const isPresent = status === "P";
            const initials = s.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2);

            return (
              <div
                key={s._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
                    getAvatarColor(s.name)
                  )}>
                    {initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{s.name}</h3>
                    {s.rollNo && (
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">ID: {s.rollNo}</p>
                    )}
                  </div>
                </div>

                {/* Custom Switch Toggle */}
                <button
                  onClick={() => toggleStatus(s._id)}
                  className={cn(
                    "relative w-24 h-8 rounded-full transition-colors duration-200 ease-in-out flex items-center px-1",
                    isPresent ? "bg-gray-100 border border-gray-200" : "bg-gray-100 border border-gray-200"
                  )}
                >
                  {/* Background Text Labels */}
                  <div className="absolute inset-0 flex justify-between items-center px-3 text-[9px] font-bold text-gray-400 uppercase select-none pointer-events-none">
                    <span className={cn(isPresent ? "opacity-100 text-gray-800" : "opacity-0")}>Present</span>
                    <span className={cn(!isPresent ? "opacity-100 text-gray-500" : "opacity-0")}>Absent</span>
                  </div>

                  {/* Sliding Thumb */}
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={cn(
                      "w-6 h-6 rounded-full shadow-md z-10",
                      isPresent ? "bg-white ml-auto" : "bg-white"
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>

      </main>

      {/* Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Summary</p>
            <p className="text-sm font-bold text-gray-900">{Math.round((stats.present / stats.total) * 100) || 0}% Attendance</p>
          </div>

          <button
            onClick={submitAttendance}
            disabled={submitting}
            className="bg-gray-900 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Submit
          </button>
        </div>
      </div>

    </div>
  );
}