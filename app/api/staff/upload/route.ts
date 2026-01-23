import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Staff from "@/models/staff.model";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { rows } = await req.json();

    let successCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    for (const [index, row] of rows.entries()) {
      try {
        // 1. Clean up Email (removes accidental spaces and makes lowercase)
        const rawEmail = row["Email"]?.trim().toLowerCase() || "";
        const cleanEmail = rawEmail.replace(/\s+/g, "");

        if (!cleanEmail) throw new Error("Email is missing");

        const normalizedData: any = {
          firstName: row["First_name"],
          lastName: row["Last_name"],
          fatherName: row["Father_name"],
          gender: row["Gender"],
          contact: row["Contact"]?.toString().trim(),
          email: cleanEmail,
          role: cleanEmail.includes("principal") ? "PRINCIPAL" : "STAFF",
        };

        // 2. Flexible Date Parsing (Handles DD.MM.YYYY and DD-MM-YYYY)
        if (row["Date_Of_Birth"]) {
          const dateStr = row["Date_Of_Birth"].toString().replace(/\./g, "-");
          const parts = dateStr.split("-");

          if (parts.length === 3) {
            const [day, month, year] = parts;
            // Ensure year is 4 digits
            const fullYear = year.length === 2 ? `19${year}` : year;
            normalizedData.dateOfBirth = new Date(
              `${fullYear}-${month}-${day}`,
            );
          }
        }

        // 3. Upsert to prevent duplicate crashes
        await Staff.findOneAndUpdate({ email: cleanEmail }, normalizedData, {
          upsert: true,
          new: true,
          runValidators: true,
        });

        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push({
          row: index + 1,
          email: row["Email"],
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      message: "Processing complete",
      successCount,
      failedCount,
      errors,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
