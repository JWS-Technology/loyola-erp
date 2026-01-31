import bcrypt from "bcryptjs";
import Student from "@/models/student.model";
import StudentAuth from "@/models/studentAuth.model";
import dbConnect from "@/config/dbConnect";

async function initStudentAuth() {
  await dbConnect();

  const students = await Student.find({
    email: { $exists: true },
    dateOfBirth: { $exists: true },
  });

  for (const student of students) {
    const exists = await StudentAuth.findOne({ studentId: student._id });
    if (exists) continue;

    const dob = new Date(student.dateOfBirth);
    const password = dob.toISOString().split("T")[0]; // YYYY-MM-DD

    const hash = await bcrypt.hash(password, 10);

    await StudentAuth.create({
      studentId: student._id,
      passwordHash: hash,
      mustChangePassword: true,
    });
  }

  console.log("Student auth initialized");
}

initStudentAuth();
