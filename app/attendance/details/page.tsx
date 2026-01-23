"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CalendarDays, 
  Clock, 
  Users, 
  ChevronRight, 
  ArrowRight,
  GraduationCap,
  BookOpen,
  School
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for clean class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Dummy Data
const COURSES = [
  { id: "bca", name: "Bachelor of Computer Applications (BCA)" },
  { id: "bsc-cs", name: "BSc Computer Science" },
  { id: "msc-phy", name: "MSc Physics" },
  { id: "ba-eng", name: "BA English" },
  { id: "bcom", name: "Bachelor of Commerce (BCom)" },
];

const DUMMY_CLASSES = [
  { id: "class-1", name: "Section A" },
  { id: "class-2", name: "Section B" },
  { id: "class-3", name: "Section C" },
];

const YEARS = [
  { id: "1", label: "1st Year" },
  { id: "2", label: "2nd Year" },
  { id: "3", label: "3rd Year" },
];

export default function AttendanceDetailsPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    course: "",
    year: "",
    classId: "",
    date: new Date().toISOString().split("T")[0],
    hour: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/attendance/mark-attendance?course=${form.course}&class=${form.classId}&date=${form.date}&hour=${form.hour}&year=${form.year}`,
    );
  };

  const isFormValid = form.course && form.classId && form.date && form.hour && form.year;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Attendance Details
            </h1>
            <p className="text-sm text-gray-500">
              Select the details to proceed
            </p>
          </div>

          {/* Form Grid: 3-column layout */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* 1. Course Input (Full Width - col-span-3) */}
            <div className="col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">
                Course
              </label>
              <div className="relative group">
                <School className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <select
                  required
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Course (e.g. BCA)</option>
                  {COURSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* 2. Year Input (Span 1) */}
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">
                Year
              </label>
              <div className="relative group">
                <BookOpen className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <select
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-12 pr-2 py-3.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled>Year</option>
                  {YEARS.map((y) => (
                    <option key={y.id} value={y.id}>{y.id}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-2 top-3.5 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* 3. Class/Section Input (Span 2) */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">
                Class / Section
              </label>
              <div className="relative group">
                <Users className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <select
                  required
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Section</option>
                  {DUMMY_CLASSES.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* 4. Date Input (Span 2) */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">
                Date
              </label>
              <div className="relative group">
                <CalendarDays className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* 5. Hour Input (Span 1) */}
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">
                Hour
              </label>
              <div className="relative group">
                <Clock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="number"
                  min={1}
                  max={8}
                  required
                  placeholder="Hour"
                  value={form.hour}
                  onChange={(e) => setForm({ ...form, hour: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-12 pr-2 py-3.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full group relative flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white rounded-xl py-4 text-sm font-bold shadow-lg shadow-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

        </form>
      </motion.div>
    </div>
  );
}