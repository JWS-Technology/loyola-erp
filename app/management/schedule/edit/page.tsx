"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- Types ---
type Slot = {
    label: string;
    type: string;
    startTime: string;
    endTime: string;
    attendanceRequired: boolean;
};

type Template = { id: string; slotCount: number };

type ScheduleConfig = {
    weeklySchedule: Record<string, string>;
    overrides: Record<string, string>;
};

export default function EditSchedulePage() {
    const router = useRouter();

    // --- Main Page State ---
    const [loading, setLoading] = useState(true);
    const [savingSchedule, setSavingSchedule] = useState(false);
    const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
    const [config, setConfig] = useState<ScheduleConfig>({ weeklySchedule: {}, overrides: {} });

    // State for adding a new Override (Exception)
    const [newOverrideDate, setNewOverrideDate] = useState("");
    const [newOverrideTemplate, setNewOverrideTemplate] = useState("HOLIDAY");

    // --- Modal State (Create Template) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [newTemplateSlots, setNewTemplateSlots] = useState<Slot[]>([]);

    // State for the "Add Slot" form inside the modal
    const [currentSlot, setCurrentSlot] = useState<Slot>({
        label: "",
        type: "PERIOD",
        startTime: "",
        endTime: "",
        attendanceRequired: true,
    });

    // --- LOAD DATA ---
    async function loadData() {
        try {
            const res = await fetch("/api/timetable/master");
            const json = await res.json();
            if (json.success) {
                // 1. Extract Templates
                const templates = json.data.templates.map((t: any) => ({
                    id: t.id,
                    slotCount: t.slots.length
                }));
                setAvailableTemplates(templates);

                // 2. Load Config
                setConfig({
                    weeklySchedule: json.data.schedule.defaults || {},
                    overrides: json.data.schedule.overrides || {}
                });
            }
        } catch (err) {
            console.error(err);
            alert("Failed to load schedule data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    // =========================================================================
    // HANDLERS: MAIN SCHEDULE
    // =========================================================================

    const handleWeeklyChange = (dayKey: string, templateId: string) => {
        setConfig((prev) => ({
            ...prev,
            weeklySchedule: { ...prev.weeklySchedule, [dayKey]: templateId }
        }));
    };

    const addOverride = () => {
        if (!newOverrideDate) return alert("Please pick a date for the exception");
        setConfig((prev) => ({
            ...prev,
            overrides: { ...prev.overrides, [newOverrideDate]: newOverrideTemplate }
        }));
        setNewOverrideDate("");
    };

    const removeOverride = (dateKey: string) => {
        const newOverrides = { ...config.overrides };
        delete newOverrides[dateKey];
        setConfig((prev) => ({ ...prev, overrides: newOverrides }));
    };

    const saveSchedule = async () => {
        setSavingSchedule(true);
        try {
            const res = await fetch("/api/timetable/master", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });

            if (res.ok) {
                alert("✅ Schedule Updated Successfully!");
                router.refresh();
            } else {
                alert("❌ Failed to save schedule.");
            }
        } catch (err) {
            alert("Error saving schedule.");
        } finally {
            setSavingSchedule(false);
        }
    };

    // =========================================================================
    // HANDLERS: CREATE TEMPLATE MODAL
    // =========================================================================

    const handleAddSlotToTemplate = () => {
        if (!currentSlot.label || !currentSlot.startTime || !currentSlot.endTime) {
            return alert("Please fill label, start time, and end time.");
        }
        setNewTemplateSlots([...newTemplateSlots, currentSlot]);
        // Auto-setup next slot
        setCurrentSlot({
            label: "",
            type: "PERIOD",
            startTime: currentSlot.endTime,
            endTime: "",
            attendanceRequired: true,
        });
    };

    const removeSlotFromTemplate = (index: number) => {
        setNewTemplateSlots(newTemplateSlots.filter((_, i) => i !== index));
    };

    const saveNewTemplate = async () => {
        if (!newTemplateName) return alert("Enter a template name");
        if (newTemplateSlots.length === 0) return alert("Add at least one slot");

        setSavingTemplate(true);
        try {
            const res = await fetch("/api/timetable/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newTemplateName, slots: newTemplateSlots }),
            });

            const json = await res.json();
            if (json.success) {
                alert("Template Created!");
                setIsModalOpen(false);
                setNewTemplateName("");
                setNewTemplateSlots([]);
                loadData(); // Reload dropdowns
            } else {
                alert(json.error || "Failed to create template");
            }
        } catch (err) {
            alert("Error creating template");
        } finally {
            setSavingTemplate(false);
        }
    };

    // =========================================================================
    // RENDER
    // =========================================================================

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Configuration...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 relative">
            <div className="max-w-6xl mx-auto">

                {/* --- Header --- */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Schedule</h1>
                        <p className="text-gray-500">Configure weekly defaults and manage exceptions</p>
                    </div>
                    <div className="flex gap-3">
                        {/* Open Modal Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-5 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                            <span className="text-xl leading-none font-light text-blue-600">+</span> New Template
                        </button>
                        {/* Save Schedule Button */}
                        <button
                            onClick={saveSchedule}
                            disabled={savingSchedule}
                            className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow-lg disabled:opacity-50"
                        >
                            {savingSchedule ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* --- Main Grid --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left: Weekly Defaults */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            📅 Weekly Defaults
                        </h2>
                        <div className="space-y-4">
                            {[
                                { key: "1", label: "Monday" },
                                { key: "2", label: "Tuesday" },
                                { key: "3", label: "Wednesday" },
                                { key: "4", label: "Thursday" },
                                { key: "5", label: "Friday" },
                                { key: "6", label: "Saturday" },
                                { key: "0", label: "Sunday" },
                            ].map((day) => (
                                <div key={day.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700 w-32">{day.label}</span>
                                    <select
                                        value={config.weeklySchedule[day.key] || "HOLIDAY"}
                                        onChange={(e) => handleWeeklyChange(day.key, e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500"
                                    >
                                        {availableTemplates.map((t) => (
                                            <option key={t.id} value={t.id}>{t.id} ({t.slotCount} slots)</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Exceptions */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            🚨 Exceptions & Holidays
                        </h2>

                        {/* Add Exception Form */}
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                            <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Add New Exception</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="date"
                                    value={newOverrideDate}
                                    onChange={(e) => setNewOverrideDate(e.target.value)}
                                    className="flex-1 p-2 border border-blue-200 rounded-md text-sm"
                                />
                                <select
                                    value={newOverrideTemplate}
                                    onChange={(e) => setNewOverrideTemplate(e.target.value)}
                                    className="sm:w-1/3 p-2 border border-blue-200 rounded-md text-sm"
                                >
                                    {availableTemplates.map((t) => (
                                        <option key={t.id} value={t.id}>{t.id}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={addOverride}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-bold text-sm hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {Object.entries(config.overrides)
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map(([date, template]) => (
                                    <div key={date} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                                        <div>
                                            <p className="font-bold text-gray-800">{new Date(date).toDateString()}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${template === "HOLIDAY" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                                }`}>
                                                {template}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeOverride(date)}
                                            className="text-gray-400 hover:text-red-500 p-2 font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            {Object.keys(config.overrides).length === 0 && (
                                <p className="text-center text-gray-400 py-4">No exceptions set.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ================= MODAL OVERLAY ================= */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                                <h2 className="text-xl font-bold text-gray-800">Create New Timing Template</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl">×</button>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="p-6 overflow-y-auto flex-1">

                                {/* Name Input */}
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Template Name</label>
                                    <input
                                        type="text"
                                        placeholder='e.g., "HALF_DAY", "EXAM_MORNING"'
                                        value={newTemplateName}
                                        onChange={(e) => setNewTemplateName(e.target.value.toUpperCase())}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-bold text-gray-800"
                                    />
                                </div>

                                {/* Slots List */}
                                <div className="mb-6 space-y-3">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Timeline Preview</h3>
                                    {newTemplateSlots.length === 0 && (
                                        <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm">
                                            No slots added yet. Use the form below.
                                        </div>
                                    )}
                                    {newTemplateSlots.map((s, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded border border-blue-200">
                                                    {s.startTime} - {s.endTime}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-800 block text-sm">{s.label}</span>
                                                    <span className="text-xs text-gray-500 font-medium">{s.type}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => removeSlotFromTemplate(i)} className="text-red-400 hover:text-red-600 text-sm font-bold">
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Slot Form */}
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <h4 className="text-sm font-bold text-blue-900 mb-3">Add Time Slot</h4>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <input
                                            type="text"
                                            placeholder="Label (e.g. Period 1)"
                                            value={currentSlot.label}
                                            onChange={(e) => setCurrentSlot({ ...currentSlot, label: e.target.value })}
                                            className="p-2 rounded border text-black border-blue-200 text-sm"
                                        />
                                        <select
                                            value={currentSlot.type}
                                            onChange={(e) => setCurrentSlot({ ...currentSlot, type: e.target.value })}
                                            className="p-2 rounded border text-black border-blue-200 text-sm"
                                        >
                                            <option value="PERIOD">Period (Attendance Req)</option>
                                            <option value="BREAK">Break</option>
                                            <option value="EXAM">Exam</option>
                                            <option value="FREE">Free / Assembly</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="flex flex-col">
                                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">Start</label>
                                            <input
                                                type="time"
                                                value={currentSlot.startTime}
                                                onChange={(e) => setCurrentSlot({ ...currentSlot, startTime: e.target.value })}
                                                className="p-2 rounded border border-blue-200 text-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">End</label>
                                            <input
                                                type="time"
                                                value={currentSlot.endTime}
                                                onChange={(e) => setCurrentSlot({ ...currentSlot, endTime: e.target.value })}
                                                className="p-2 rounded border border-blue-200 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddSlotToTemplate}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors"
                                    >
                                        + Add Slot
                                    </button>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveNewTemplate}
                                    disabled={savingTemplate}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:opacity-50 text-sm shadow-sm"
                                >
                                    {savingTemplate ? "Creating..." : "Create Template"}
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}