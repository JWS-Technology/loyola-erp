import "dotenv/config";
import mongoose from "mongoose";

import Stream from "../models/stream.model";
import Course from "../models/course.model";
import ClassModel from "../models/class.model";

const MONGODB_URI = process.env.MONGODB_URI;

if (typeof MONGODB_URI !== "string") {
  throw new Error("❌ MONGODB_URI is not defined");
}

const DATA = {
  "Arts and Science": [
    "Bachelor of Arts - English",
    "Bachelor of Arts - Tamil",
    "Bachelor of Commerce - Commerce",
    "Bachelor of Commerce - Commerce (Computer Application)",
    "Bachelor of Science - Chemistry",
    "Bachelor of Science - Computer Science",
    "Bachelor of Science - Computer Science (Artificial Intelligence and Data Science)",
    "Bachelor of Commerce - Commerce (Accounting and Finance)",
    "Bachelor of Science - Mathematics",
    "Bachelor of Science - Physics",
  ],
  "Business Administration": [
    "Bachelor of Business Administration - Business Administration",
  ],
  "Computer Application": [
    "Bachelor of Computer Application - Computer Application",
  ],
};

async function seedAcademics() {
  await mongoose.connect(MONGODB_URI!);
  console.log("✅ MongoDB connected");

  await Promise.all([
    Stream.deleteMany({}),
    Course.deleteMany({}),
    ClassModel.deleteMany({}),
  ]);

  for (const [streamName, courses] of Object.entries(DATA)) {
    const stream = await Stream.create({ name: streamName });
    console.log(`🟢 Stream: ${streamName}`);

    for (const courseName of courses) {
      const course = await Course.create({
        name: courseName,
        streamId: stream._id,
        durationYears: 3,
      });

      for (let year = 1; year <= 3; year++) {
        await ClassModel.create({
          courseId: course._id,
          year,
          section: "A",
          name: `${courseName.split(" - ")[0]} ${year}A`,
        });
      }
    }
  }

  console.log("✅ Academic seeding completed");
  await mongoose.disconnect();
}

seedAcademics().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});
