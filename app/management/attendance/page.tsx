"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, UserCheck, UserMinus, Search,
    GraduationCap, School, BookOpen, CalendarDays, Loader2, Calendar
} from "lucide-react";
import axios from "axios";

export default function ManagementDashboard() {
    // API Data States
    const [courses, setCourses] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [sections, setSections] = useState([]);

    // Selection States
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    // Defaulting to today's date in YYYY-MM-DD format
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Analytics States
    const [summary, setSummary] = useState({ present: 0, absent: 0 });
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Initial Load: Fetch Today's Global Summary & All Courses
    useEffect(() => {
        fetchCourses();
        fetchTodaySummary();
    }, [selectedDate]); // Refresh summary if date changes

    // 2. Determine available years for selected course
    useEffect(() => {
        if (selectedCourse) {
            const course = courses.find(c => c._id === selectedCourse);
            const duration = course?.durationYears || 3;
            const years = Array.from({ length: duration }, (_, i) => (i + 1).toString());
            setAvailableYears(years);
            setSelectedYear("");
            setSelectedClass("");
        } else {
            setAvailableYears([]);
        }
    }, [selectedCourse, courses]);

    // 3. Fetch dynamic sections (Classes)
    useEffect(() => {
        if (selectedCourse && selectedYear) {
            fetchSections();
        } else {
            setSections([]);
        }
    }, [selectedCourse, selectedYear]);

    const fetchTodaySummary = async () => {
        const res = await axios.get(`/api/attendance/get-attendance?date=${selectedDate}`);
        const result = res.data;

        let p = 0, a = 0;
        result.data?.forEach((doc: any) => {
            doc.records.forEach((r: any) => {
                if (r.status === "present" || r.status === "P") p++;
                else a++;
            });
        });
        setSummary({ present: p, absent: a });
    };

    const fetchCourses = async () => {
        const res = await axios.get("/api/data/course/get-course");
        setCourses(res.data.data || []);
    };

    const fetchSections = async () => {
        const res = await axios.get(`/api/data/class/get-section?courseId=${selectedCourse}&year=${selectedYear}`);
        setSections(res.data.data || []);
    };

    const viewAttendance = async () => {
        if (!selectedClass) return;
        setLoading(true);
        try {
            const res = await axios.get(`/api/attendance/get-attendance?class=${selectedClass}&date=${selectedDate}`);
            setAttendanceData(res.data.data || []);
        } catch (error) {
            console.error("View Attendance Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight text-visible">Management Portal</h1>
                        <p className="text-slate-600 font-semibold mt-1 text-lg">Loyola College ERP Monitoring</p>
                    </div>

                    {/* Interactive Date Picker */}
                    <div className="relative group flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-indigo-200 transition-all cursor-pointer">
                        <CalendarDays className="w-6 h-6 text-indigo-600" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-none outline-none text-slate-900 font-black text-base cursor-pointer"
                        />
                    </div>
                </div>

                {/* --- ANALYTICS SUMMARY --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Daily Total Count", value: summary.present + summary.absent, icon: Users, bg: "bg-indigo-50", text: "text-indigo-600" },
                        { label: "Students Present", value: summary.present, icon: UserCheck, bg: "bg-emerald-50", text: "text-emerald-600" },
                        { label: "Students Absent", value: summary.absent, icon: UserMinus, bg: "bg-rose-50", text: "text-rose-600" },
                    ].map((card, i) => (
                        <motion.div
                            key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center justify-between"
                        >
                            <div className="space-y-1">
                                <p className="text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.2em]">{card.label}</p>
                                <p className={`text-5xl font-black ${card.text}`}>{card.value}</p>
                            </div>
                            <div className={`p-5 rounded-3xl ${card.bg} ${card.text}`}>
                                <card.icon size={32} strokeWidth={2.5} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* --- DYNAMIC FILTER TOOLBAR --- */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        <div className="md:col-span-4 space-y-2.5">
                            <label className="text-[0.7rem] font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
                            <div className="relative group">
                                <School className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <select
                                    className="w-full appearance-none bg-slate-50 border-2 border-slate-100 text-slate-900 text-sm font-bold rounded-2xl pl-12 pr-4 py-4 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    <option value="">Choose Course...</option>
                                    {courses.map((c: any) => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2.5">
                            <label className="text-[0.7rem] font-black text-slate-500 uppercase tracking-widest ml-1">Year</label>
                            <div className="relative">
                                <BookOpen className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                <select
                                    className="w-full appearance-none bg-slate-50 border-2 border-slate-100 text-slate-900 text-sm font-bold rounded-2xl pl-12 pr-4 py-4 focus:bg-white focus:border-indigo-500 outline-none transition-all disabled:opacity-40"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    disabled={!selectedCourse}
                                >
                                    <option value="">Year</option>
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>{year} Year</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-3 space-y-2.5">
                            <label className="text-[0.7rem] font-black text-slate-500 uppercase tracking-widest ml-1">Section</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                <select
                                    className="w-full appearance-none bg-slate-50 border-2 border-slate-100 text-slate-900 text-sm font-bold rounded-2xl pl-12 pr-4 py-4 focus:bg-white focus:border-indigo-500 outline-none transition-all disabled:opacity-40"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    disabled={!selectedYear}
                                >
                                    <option value="">Select Section</option>
                                    {sections.map((cl: any) => (
                                        <option key={cl._id} value={cl._id}>{cl.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-3">
                            <button
                                onClick={viewAttendance}
                                disabled={loading || !selectedClass}
                                className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl py-4 text-sm font-black shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                                GENERATE REPORT
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- REPORT VIEW --- */}
                <AnimatePresence mode="wait">
                    {attendanceData.length > 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 pb-10">
                            {attendanceData.map((session: any, idx) => (
                                <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                                    <div className="bg-slate-900 px-10 py-6 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-indigo-500 p-2.5 rounded-xl text-white">
                                                <GraduationCap size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white text-xl uppercase tracking-tight">Period {session.hour}</h3>
                                                <p className="text-indigo-300 text-xs font-bold tracking-widest uppercase">{session.class?.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400 text-[0.6rem] font-black uppercase tracking-[0.2em] mb-1">Faculty In-Charge</p>
                                            <p className="text-white font-black text-base">{session.staffId?.name || "Dr. Staff Name"}</p>
                                        </div>
                                    </div>

                                    <div className="p-10">
                                        <div className="flex items-center gap-3 mb-8 border-l-4 border-rose-500 pl-4">
                                            <h4 className="text-slate-900 font-black text-2xl tracking-tight">Absentees List</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                            {session.records.filter((r: any) => r.status === "absent" || r.status === "A").map((r: any) => (
                                                <div key={r.student._id} className="p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] hover:border-rose-200 hover:bg-rose-50 transition-all">
                                                    <p className="text-slate-900 font-black text-lg leading-tight">{r.student.name}</p>
                                                    <p className="text-xs font-black text-slate-400 mt-2 uppercase tracking-widest">{r.student.rollNo}</p>
                                                </div>
                                            ))}
                                            {session.records.filter((r: any) => r.status === "absent" || r.status === "A").length === 0 && (
                                                <p className="text-slate-500 font-bold italic py-4 flex items-center gap-2">
                                                    <UserCheck className="text-emerald-500" /> Full Attendance Recorded.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        selectedClass && !loading && (
                            <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                <Calendar className="mx-auto w-16 h-16 text-slate-200 mb-4" />
                                <p className="text-slate-500 font-black text-2xl tracking-tight">No attendance records found for this date.</p>
                                <p className="text-slate-400 font-medium mt-2">Try selecting another class or check the academic date.</p>
                            </div>
                        )
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}