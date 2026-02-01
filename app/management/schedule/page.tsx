"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "./calendar-custom.css"; // We will add custom styles below

// --- Types ---
type Slot = {
    l: string; // Label
    t: string; // Type (P=Period, B=Break)
    s: string; // Start Time
    e: string; // End Time
};

type Template = {
    id: string; // "REGULAR", "FRIDAY", "HOLIDAY"
    slots: Slot[];
};

type ScheduleData = {
    templates: Template[];
    schedule: {
        defaults: Record<string, string>; // "1": "REGULAR"
        overrides: Record<string, string>; // "2026-02-14": "HOLIDAY"
    };
};

export default function ScheduleDashboard() {
    const [data, setData] = useState<ScheduleData | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ Switch to Date Object for full calendar support
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // --- Fetch Data ---
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/timetable/master");
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Schedule...</div>;
    if (!data) return <div className="p-10 text-center text-red-500">Failed to load schedule.</div>;

    // --- Logic: Determine Template for Selected Date ---

    // 1. Format date to YYYY-MM-DD (Local Time) to match DB keys
    const dateKey = _formatDateKey(selectedDate);
    const dayOfWeek = selectedDate.getDay().toString(); // 0=Sun, 1=Mon...

    // 2. CHECK PRIORITY: Override > Default > Holiday
    const overrideTemplate = data.schedule.overrides[dateKey];
    const defaultTemplate = data.schedule.defaults[dayOfWeek];

    const templateId = overrideTemplate || defaultTemplate || "HOLIDAY";

    // 3. Find the actual template data
    const activeTemplate = data.templates.find((t) => t.id === templateId);

    // 4. Status Helpers
    const isOverride = !!overrideTemplate;
    const isHoliday = templateId === "HOLIDAY";

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">College Timetable</h1>
                    <p className="text-gray-500">View daily schedules and exceptions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- LEFT COL: Calendar JS --- */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Select Date</h3>

                            <Calendar
                                onChange={(val) => setSelectedDate(val as Date)}
                                value={selectedDate}
                                className="w-full border-none rounded-lg font-sans text-sm"
                                tileClassName={({ date, view }) => {
                                    // Highlight Logic
                                    if (view === 'month') {
                                        const dKey = _formatDateKey(date);
                                        const ovr = data.schedule.overrides[dKey];
                                        if (ovr === 'HOLIDAY') return 'react-calendar__tile--holiday';
                                        if (ovr) return 'react-calendar__tile--exception';
                                    }
                                    return null;
                                }}
                                tileContent={({ date, view }) => {
                                    // Add dots for overrides
                                    if (view === 'month') {
                                        const dKey = _formatDateKey(date);
                                        if (data.schedule.overrides[dKey]) {
                                            return <div className="h-1.5 w-1.5 bg-red-500 rounded-full mx-auto mt-1"></div>;
                                        }
                                    }
                                    return null;
                                }}
                            />

                            <div className="mt-4 flex gap-4 text-xs text-gray-500 justify-center">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div> Exception
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-900"></div> Selected
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COL: Timeline --- */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[500px]">

                            {/* Status Header */}
                            <div className={`px-8 py-6 border-b border-gray-100 flex justify-between items-center ${isOverride ? "bg-yellow-50" : "bg-white"}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            {selectedDate.toDateString()}
                                        </span>
                                        {isOverride && (
                                            <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-200 uppercase">
                                                Override Active
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-blue-900">
                                        {templateId.replace("_", " ")}
                                    </h2>
                                </div>

                                {isHoliday ? (
                                    <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                                    </div>
                                ) : (
                                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                )}
                            </div>

                            {/* Timeline Content */}
                            <div className="p-8">
                                {!activeTemplate || activeTemplate.slots.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-4xl">😴</span>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">No classes scheduled</h3>
                                        <p className="text-gray-500">Enjoy your day off!</p>
                                    </div>
                                ) : (
                                    <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                                        {activeTemplate.slots.map((slot, index) => {
                                            const isBreak = slot.t === "B";

                                            return (
                                                <div key={index} className="relative pl-8 group">
                                                    {/* Dot */}
                                                    <div
                                                        className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all group-hover:scale-125 ${isBreak ? "bg-orange-400" : "bg-blue-900"
                                                            }`}
                                                    ></div>

                                                    {/* Slot Card */}
                                                    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl transition-all ${isBreak ? "bg-orange-50 border border-orange-100" : "hover:bg-gray-50"
                                                        }`}>
                                                        <div>
                                                            <p className={`font-bold text-lg ${isBreak ? "text-orange-800" : "text-gray-800"}`}>
                                                                {slot.l}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mt-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                                {_formatTime(slot.s)} - {_formatTime(slot.e)}
                                                            </div>
                                                        </div>

                                                        {/* Badge */}
                                                        <div className="mt-3 sm:mt-0">
                                                            {isBreak ? (
                                                                <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">Break</span>
                                                            ) : (
                                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Period</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper: 13:40 -> 01:40 PM
function _formatTime(time24: string) {
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

// Helper: Date Object -> "YYYY-MM-DD" (Local Time safe)
function _formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}