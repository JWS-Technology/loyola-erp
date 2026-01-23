"use client";

import { useState } from "react";
import Papa from "papaparse";

type Row = Record<string, string>;

export default function StudentUploadPage() {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(false);

    const onFileChange = (file: File) => {
        Papa.parse<Row>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                setRows(result.data);
            },
        });
    };

    const onSave = async () => {
        setLoading(true);

        const res = await fetch("/api/students/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows }),
        });

        const data = await res.json();
        setLoading(false);

        alert(
            `Inserted: ${data.inserted}\nFailed: ${data.failed}`
        );
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Upload Students (CSV)</h1>

            <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files && onFileChange(e.target.files[0])}
            />

            {rows.length > 0 && (
                <>
                    <div className="mt-4 max-h-96 overflow-auto border">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    {Object.keys(rows[0]).map((key) => (
                                        <th key={key} className="border px-2 py-1 text-left">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} className="border px-2 py-1">
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        onClick={onSave}
                        disabled={loading}
                        className="mt-4 px-4 py-2 bg-black text-white"
                    >
                        {loading ? "Saving..." : "Save to Database"}
                    </button>
                </>
            )}
        </div>
    );
}
