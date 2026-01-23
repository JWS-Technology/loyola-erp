"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type Row = Record<string, string>;

export default function StaffUploadPage() {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<{ success: number; failed: number } | null>(null);
    const [errorLog, setErrorLog] = useState<{ row: number; email: string; error: string }[]>([]);
    const onFileChange = (file: File) => {
        Papa.parse<Row>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                setRows(result.data);
                setStats(null); // Reset stats on new file
            },
        });
    };

    const onSave = async () => {
        setLoading(true);
        setErrorLog([]); // Clear previous errors
        try {
            const res = await fetch("/api/staff/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rows }),
            });

            const data = await res.json();
            setStats({ success: data.successCount, failed: data.failedCount });

            if (data.failedCount > 0) {
                setErrorLog(data.errors); // Capture the errors from the backend
            }
        } catch (error) {
            alert("An error occurred during upload.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Staff Onboarding</h1>
                    <p className="text-slate-500 mt-1">Upload CSV to register college staff and faculty members.</p>
                </div>
                {rows.length > 0 && (
                    <button
                        onClick={onSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 transition-all shadow-sm"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {loading ? "Processing..." : "Confirm & Save"}
                    </button>
                )}
            </div>
            {errorLog.length > 0 && (
                <div className="mt-6 bg-rose-50 border border-rose-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-rose-100 border-b border-rose-200 flex items-center gap-2">
                        <AlertCircle className="text-rose-600 w-5 h-5" />
                        <h2 className="text-sm font-bold text-rose-800 uppercase">Failure Report ({errorLog.length})</h2>
                    </div>
                    <div className="p-4">
                        <ul className="space-y-2">
                            {errorLog.map((err, idx) => (
                                <li key={idx} className="text-sm text-rose-700 flex flex-col sm:flex-row sm:gap-4">
                                    <span className="font-bold whitespace-nowrap">Row {err.row}:</span>
                                    <span className="italic">"{err.email || 'No Email'}"</span>
                                    <span className="text-rose-900">— {err.error}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                        <div className="bg-emerald-500 p-2 rounded-lg text-white"><CheckCircle2 size={20} /></div>
                        <div>
                            <p className="text-sm text-emerald-600 font-medium">Successfully Imported</p>
                            <p className="text-2xl font-bold text-emerald-900">{stats.success}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
                        <div className="bg-rose-500 p-2 rounded-lg text-white"><AlertCircle size={20} /></div>
                        <div>
                            <p className="text-sm text-rose-600 font-medium">Failed Rows</p>
                            <p className="text-2xl font-bold text-rose-900">{stats.failed}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* File Input Design */}
            <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center bg-slate-50 hover:bg-slate-100 transition-colors group">
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => e.target.files && onFileChange(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="text-indigo-600 w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">Staff CSV (Max 5MB)</p>
                </div>
            </div>

            {/* Data Preview Table */}
            {rows.length > 0 && (
                <div className="mt-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Previewing {rows.length} Rows</span>
                    </div>
                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white shadow-sm z-10">
                                <tr>
                                    {Object.keys(rows[0]).map((key) => (
                                        <th key={key} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase border-b">
                                            {key.replace(/_/g, " ")}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}