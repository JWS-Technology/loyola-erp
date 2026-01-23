"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  Clock,
  ChevronLeft,
  CheckCheck,
  Loader2,
  FileText,
  X,
  User,
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

  // URL Params
  const course = searchParams.get("course");
  const year = searchParams.get("year");
  const classId = searchParams.get("class");
  const date = searchParams.get("date");
  const hour = searchParams.get("hour");

  // State
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Derived Stats
  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "P").length;
    return { total, present, absent: total - present };
  }, [records]);

  // Fetch Students
  useEffect(() => {
    if (!classId || !date || !hour) return;

    axios
      .get(
        `/api/data/student/get-student?class=${classId}&course=${course}&year=${year}`
      )
      .then((res) => {
        const data = res.data?.data || [];
        setStudents(data);
        // Default everyone to 'P'
        setRecords(
          data.map((s: any) => ({
            student: s._id,
            status: "P",
          }))
        );
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [classId, date, hour, course, year]);

  // Handlers
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

  // --- SUBMIT LOGIC ---
  const submitAttendance = async () => {
    if (submitting) return;
    
    // Safety check
    if (!classId || !date || !hour) {
      alert("Missing required class details.");
      return;
    }

    setSubmitting(true);

    try {
      // Payload matching Backend Schema strictly
      const payload = {
        course,
        year,
        class: classId,     // Backend expects 'class' field
        date: date,         // Date string
        hour: Number(hour), // Backend expects Number
        records: records,
      };

      await axios.post("/api/attendance/mark-attendance", payload);

      // Success
      router.push("/attendance"); // Or wherever you want to redirect
    } catch (err: any) {
      console.error(err);
      
      // Handle Duplicate Error (409)
      if (err.response && err.response.status === 409) {
        alert("Attendance for this hour has already been marked.");
      } else {
        alert("Failed to submit attendance. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
            <div className="flex flex-col items-center justify-center gap-1 mt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                {course && <span className="uppercase">{course}</span>}
                {year && <span>• {year} Year</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {date}
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Hour {hour}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex flex-col items-center w-1/3 border-r border-gray-100">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              Total
            </span>
            <span className="text-xl font-bold text-gray-900">
              {stats.total}
            </span>
          </div>
          <div className="flex flex-col items-center w-1/3 border-r border-gray-100">
            <span className="text-xs text-green-500 font-medium uppercase tracking-wider">
              Present
            </span>
            <span className="text-xl font-bold text-green-600">
              {stats.present}
            </span>
          </div>
          <div className="flex flex-col items-center w-1/3">
            <span className="text-xs text-red-500 font-medium uppercase tracking-wider">
              Absent
            </span>
            <span className="text-xl font-bold text-red-600">
              {stats.absent}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-2xl mx-auto px-4 mt-6 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-500">Student List</h2>
        <button
          onClick={markAllPresent}
          className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition"
        >
          Mark All Present
        </button>
      </div>

      {/* Student List */}
      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-3">
        <AnimatePresence>
          {students.map((student) => {
            const isPresent = getStatus(student._id) === "P";

            return (
              <motion.div
                key={student._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => toggleStatus(student._id)}
                className={cn(
                  "relative overflow-hidden cursor-pointer group rounded-xl border p-4 transition-all duration-200",
                  isPresent
                    ? "bg-white border-gray-100 shadow-sm hover:border-green-200"
                    : "bg-red-50/50 border-red-100 shadow-none"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors",
                      isPresent
                        ? getAvatarColor(student.name)
                        : "bg-red-100 text-red-600"
                    )}
                  >
                    {student.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3
                      className={cn(
                        "font-semibold text-sm transition-colors",
                        isPresent ? "text-gray-900" : "text-red-700"
                      )}
                    >
                      {student.name}
                    </h3>
                    <p
                      className={cn(
                        "text-xs mt-0.5",
                        isPresent ? "text-gray-500" : "text-red-400"
                      )}
                    >
                      {student.regno || "No Reg No"}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                      isPresent
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    )}
                  >
                    {isPresent ? (
                      <CheckCheck className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Submit Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-30">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={submitAttendance}
            disabled={submitting || students.length === 0}
            className={cn(
              "w-full py-3.5 rounded-xl text-white font-semibold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
              submitting
                ? "bg-gray-300 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Submit Attendance
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}