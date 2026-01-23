"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function page() {
  const router = useRouter();

  const [form, setForm] = useState({
    classId: "",
    date: "",
    hour: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    router.push(
      `/attendance/mark?class=${form.classId}&date=${form.date}&hour=${form.hour}`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        required
        onChange={(e) => setForm({ ...form, classId: e.target.value })}
      >
        <option value="">Select Class</option>
        {/* map classes */}
      </select>

      <input
        type="date"
        required
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />

      <input
        type="number"
        min={1}
        max={8}
        required
        placeholder="Hour"
        onChange={(e) => setForm({ ...form, hour: e.target.value })}
      />

      <button type="submit">Next</button>
    </form>
  );
}
