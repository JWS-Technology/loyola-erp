"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, UserCheck, UserMinus, Search,
    GraduationCap, School, BookOpen, CalendarDays, Loader2, Calendar
} from "lucide-react";
import axios from "axios";

type Course = {
    _id: string;
    name: string;
    durationYears: number;
};

type Section = {
    _id: string;
    name: string;
};

export default function ManagementDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [sections, setSections] = useState<Section[]>([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [summary, setSummary] = useState({ present: 0, absent: 0 });
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchTodaySummary();
    }, [selectedDate]);

    useEffect(() => {
        if (selectedCourse) {
            const course = courses.find((c: any) => c._id === selectedCourse);
            const duration = course?.durationYears || 3;
            const years = Array.from({ length: duration }, (_, i) => (i + 1).toString());
            setAvailableYears(years);
            setSelectedYear("");
            setSelectedClass("");
        } else {
            setAvailableYears([]);
        }
    }, [selectedCourse, courses]);

    useEffect(() => {
        if (selectedCourse && selectedYear) {
            fetchSections();
        } else {
            setSections([]);
        }
    }, [selectedCourse, selectedYear]);

    const fetchTodaySummary = async () => {
        try {
            const res = await axios.get(`/api/attendance/get-attendance?date=${selectedDate}`);
            const result = res.data;

            let p = 0, a = 0;
            // Updated to handle "P" and "A" status from your JSON
            result.data?.forEach((doc: any) => {
                doc.records?.forEach((r: any) => {
                    if (r.status === "P" || r.status === "present") p++;
                    else if (r.status === "A" || r.status === "absent") a++;
                });
            });
            setSummary({ present: p, absent: a });
        } catch (err) {
            console.error("Summary fetch error", err);
        }
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
    console.log(attendanceData)
    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />

            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Live System
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Management Portal</h1>
                        <p className="text-slate-500 font-medium text-lg italic">Loyola College, Mettala ERP Monitoring</p>
                    </div>

                    <div className="relative group flex items-center gap-4 bg-white px-6 py-4 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/40 hover:border-indigo-300 transition-all cursor-pointer">
                        <CalendarDays className="w-6 h-6 text-indigo-600" />
                        <div className="flex flex-col">
                            <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Selected Date</span>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-slate-900 font-black text-base cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* --- ANALYTICS SUMMARY --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: "Total Strength Marked", value: summary.present + summary.absent, icon: Users, bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
                        { label: "Students Present", value: summary.present, icon: UserCheck, bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
                        { label: "Students Absent", value: summary.absent, icon: UserMinus, bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
                    ].map((card, i) => (
                        <motion.div
                            key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className={`bg-white p-8 rounded-[2.5rem] border-b-4 ${card.border} shadow-xl shadow-slate-200/30 flex items-center justify-between group hover:translate-y-[-4px] transition-transform`}
                        >
                            <div className="space-y-2">
                                <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.25em]">{card.label}</p>
                                <p className={`text-6xl font-black ${card.text} tracking-tighter`}>{card.value}</p>
                            </div>
                            <div className={`p-6 rounded-3xl ${card.bg} ${card.text} group-hover:scale-110 transition-transform`}>
                                <card.icon size={36} strokeWidth={2.5} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* --- DYNAMIC FILTER TOOLBAR --- */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                        <div className="md:col-span-4 space-y-3">
                            <label className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Department / Course</label>
                            <div className="relative group">
                                <School className="absolute left-5 top-5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <select
                                    className="w-full appearance-none bg-slate-50 border-2 border-slate-100 text-slate-900 text-sm font-bold rounded-2xl pl-14 pr-6 py-5 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-inner"
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

                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Year</label>
                            <div className="relative group">
                                <BookOpen className="absolute left-5 top-5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <select
                                    className="w-full appearance-none bg-slate-50 border-2 border-slate-100 text-slate-900 text-sm font-bold rounded-2xl pl-14 pr-6 py-5 focus:bg-white focus:border-indigo-500 outline-none transition-all disabled:opacity-40"
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

                        <div className="md:col-span-3 space-y-3">
                            <label className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Section</label>
                            <div className="relative group">
                                <Users className="absolute left-5 top-5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <select
                                    className="w-full appearance-none bg-slate-50 border-2 border-slate-100 text-slate-900 text-sm font-bold rounded-2xl pl-14 pr-6 py-5 focus:bg-white focus:border-indigo-500 outline-none transition-all disabled:opacity-40"
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
                                className="w-full h-[60px] bg-slate-900 hover:bg-black text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-300 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 tracking-widest"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Search size={22} />}
                                GENERATE REPORT
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- REPORT VIEW --- */}
                <AnimatePresence mode="wait">
                    {attendanceData.length > 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 pb-20">
                            {attendanceData.map((session: any, idx) => (
                                <div key={idx} className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden group">
                                    <div className="bg-slate-900 px-12 py-8 flex justify-between items-center group-hover:bg-black transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="bg-indigo-500 p-4 rounded-2xl text-white shadow-lg shadow-indigo-500/40">
                                                <GraduationCap size={28} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white text-2xl uppercase tracking-tighter">Period {session.hour}</h3>
                                                <p className="text-indigo-300 text-xs font-black tracking-[0.3em] mt-1 uppercase">{session.class?.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-500 text-[0.6rem] font-black uppercase tracking-[0.3em] mb-2">Faculty In-Charge</p>
                                            <p className="text-white font-black text-lg underline decoration-indigo-500 decoration-4 underline-offset-4">{session.staffId?.name || "Verified Faculty"}</p>
                                        </div>
                                    </div>

                                    <div className="p-12">
                                        <div className="flex items-center gap-4 mb-10 border-l-8 border-rose-500 pl-6">
                                            <h4 className="text-slate-900 font-black text-3xl tracking-tight">Absentees List</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {/* cross-referencing status 'A' from your record */}
                                            {session.records?.filter((r: any) => r.status === "A" || r.status === "absent").map((r: any) => (
                                                <motion.div
                                                    key={r.student?._id || r._id}
                                                    whileHover={{ y: -5 }}
                                                    className="p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-rose-200 hover:bg-rose-50 transition-all flex flex-col justify-center min-h-[100px]"
                                                >
                                                    <p className="text-slate-900 font-black text-xl leading-none tracking-tight">{r.student?._id || "Student Name"}</p>
                                                    <p className="text-[0.7rem] font-black text-slate-400 mt-3 uppercase tracking-widest">{r.student?.rollNo || "No Roll No"}</p>
                                                </motion.div>
                                            ))}
                                            {session.records?.filter((r: any) => r.status === "A" || r.status === "absent").length === 0 && (
                                                <div className="col-span-full py-10 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 flex flex-col items-center justify-center gap-2">
                                                    <UserCheck className="text-emerald-500 w-10 h-10" />
                                                    <p className="text-emerald-800 font-black text-xl tracking-tight uppercase">Perfect Attendance Recorded!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        selectedClass && !loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                                <Calendar className="mx-auto w-20 h-20 text-slate-100 mb-6" />
                                <p className="text-slate-400 font-black text-3xl tracking-tight uppercase">No Data Found</p>
                                <p className="text-slate-400 font-bold mt-3">There are no attendance records for the selected parameters.</p>
                            </motion.div>
                        )
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}