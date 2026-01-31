import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";

import Stream from "@/models/stream.model";
import Course from "@/models/course.model";
import ClassModel from "@/models/class.model";
import Student from "@/models/student.model";

/* ------------------ helpers ------------------ */

function normalizeYear(input: string): number {
  if (!input) throw new Error("Year is missing");

  const map: Record<string, number> = {
    I: 1,
    II: 2,
    III: 3,
  };

  const value = input.trim().toUpperCase();

  if (map[value]) return map[value];

  const num = Number(value);
  if (!Number.isNaN(num)) return num;

  throw new Error(`Invalid year value: ${input}`);
}

function parseDate(input: string): Date {
  if (!input) throw new Error("Date of birth missing");

  // Expected: DD.MM.YYYY
  const parts = input.split(".");
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${input}`);
  }

  const [dd, mm, yyyy] = parts.map(Number);

  if (!dd || !mm || !yyyy) {
    throw new Error(`Invalid date values: ${input}`);
  }

  // 🔥 CREATE DATE IN UTC (NO TIMEZONE SHIFT)
  return new Date(Date.UTC(yyyy, mm - 1, dd));
}

function normalizeRow(row: any) {
  return {
    firstName: row["first name"]?.trim(),
    lastName: row["last name"]?.trim() || "",
    gender: row["gender"]?.trim(),
    dateOfBirth: parseDate(row["date_of_birth"]),
    fatherName: row["Father's Name"]?.trim(),
    contact: row["Contact"]?.trim(),
    email: row["email"]?.trim(),
    stream: row["stream"]?.trim(),
    course: row["course"]?.trim(),
    year: normalizeYear(row["year"]),
    section: row["section"]?.trim(),
  };
}

/* ------------------ API ------------------ */

export async function POST(req: Request) {
  await dbConnect();

  const { rows } = await req.json();

  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let inserted = 0;
  let failed = 0;
  const errors: any[] = [];

  for (const rawRow of rows) {
    try {
      const data = normalizeRow(rawRow);

      if (!data.firstName || !data.gender || !data.stream || !data.course) {
        throw new Error("Required fields missing");
      }

      const stream = await Stream.findOne({ name: data.stream });
      if (!stream) throw new Error(`Stream not found: ${data.stream}`);

      const course = await Course.findOne({
        name: data.course,
        streamId: stream._id,
      });
      if (!course) throw new Error(`Course not found: ${data.course}`);

      const classDoc = await ClassModel.findOne({
        courseId: course._id,
        year: data.year,
        section: data.section,
      });
      if (!classDoc) {
        throw new Error(`Class not found: Year ${data.year}${data.section}`);
      }

      await Student.create({
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        fatherName: data.fatherName,
        contact: data.contact,
        email: data.email,
        streamId: stream._id,
        courseId: course._id,
        classId: classDoc._id,
      });

      inserted++;
    } catch (err: any) {
      failed++;
      errors.push({
        row: rawRow,
        error: err.message,
      });
    }
  }

  return NextResponse.json({
    inserted,
    failed,
    errors, // keep for debugging / admin UI
  });
}
