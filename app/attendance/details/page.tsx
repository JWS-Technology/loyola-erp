"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
    CalendarDays,
    Clock,
    Users,
    ChevronRight,
    ArrowRight,
    GraduationCap,
    BookOpen,
    School,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for clean class merging
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Dummy Sections (UNCHANGED)
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

type Course = {
    _id: string;
    name: string;
};

export default function AttendanceDetailsPage() {
    const router = useRouter();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    const [sections, setSections] = useState<any[]>([]);
    const [loadingSections, setLoadingSections] = useState(false);

    const [form, setForm] = useState({
        courseId: "",
        year: "",
        classId: "",
        date: new Date().toISOString().split("T")[0],
        hour: "",
    });

    // ✅ FORCE TODAY'S DATE ON LOAD (nothing else touched)
    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setForm((prev) => ({ ...prev, date: today }));
    }, []);

    // FETCH COURSES
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get("/api/data/course/get-course");
                setCourses(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch courses", err);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, []);

    // FETCH SECTIONS ON COURSE / YEAR CHANGE
    useEffect(() => {
        if (!form.courseId || !form.year) return;

        const fetchSections = async () => {
            setLoadingSections(true);
            try {
                const res = await axios.get(
                    `/api/data/class/get-section?courseId=${form.courseId}&year=${form.year}`
                );
                setSections(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch sections", err);
            } finally {
                setLoadingSections(false);
            }
        };

        fetchSections();
    }, [form.courseId, form.year]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(
            `/attendance/mark-attendance?courseId=${form.courseId}&classId=${form.classId}&date=${form.date}&hour=${form.hour}&year=${form.year}`
        );
    };

    const isFormValid =
        form.courseId && form.classId && form.date && form.hour && form.year;


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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

                    <div className="grid grid-cols-3 gap-4">
                        {/* Course */}
                        <div className="col-span-3 space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">
                                Course
                            </label>
                            <div className="relative group">
                                <School className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <select
                                    required
                                    value={form.courseId}
                                    onChange={(e) =>
                                        setForm({ ...form, courseId: e.target.value })
                                    }
                                    disabled={loadingCourses}
                                >

                                    {loadingCourses && (
                                        <option value="" disabled>
                                            Loading courses...
                                        </option>
                                    )}
                                    {courses.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
                            </div>
                        </div>

                        {/* Year */}
                        <div className="col-span-1 space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">
                                Year
                            </label>
                            <div className="relative group">
                                <BookOpen className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <select
                                    required
                                    value={form.year}
                                    onChange={(e) =>
                                        setForm({ ...form, year: e.target.value })
                                    }
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-12 pr-2 py-3.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                                >
                                    <option value="" disabled>Year</option>
                                    {YEARS.map((y) => (
                                        <option key={y.id} value={y.id}>
                                            {y.id}
                                        </option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-2 top-3.5 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
                            </div>
                        </div>

                        {/* Section */}
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">
                                Class / Section
                            </label>
                            <div className="relative group">
                                <Users className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <select
                                    required
                                    value={form.classId}
                                    onChange={(e) =>
                                        setForm({ ...form, classId: e.target.value })
                                    }
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                                >
                                    <option value="" disabled>
                                        {loadingSections ? "Loading sections..." : "Select Section"}
                                    </option>
                                    {sections.map((cls) => (
                                        <option key={cls._id} value={cls._id}>
                                            {cls.section ?? cls.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
                            </div>
                        </div>

                        {/* Date */}
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">
                                Date
                            </label>
                            <div className="relative group">
                                <CalendarDays className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    // disabled
                                    type="date"
                                    required
                                    value={form.date}
                                    onChange={(e) =>
                                        setForm({ ...form, date: e.target.value })
                                    }
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Hour */}
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
                                    onChange={(e) =>
                                        setForm({ ...form, hour: e.target.value })
                                    }
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-12 pr-2 py-3.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
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
