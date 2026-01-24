import { Suspense } from "react";
import AttendanceClient from "./AttendanceClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AttendanceClient />
    </Suspense>
  );
}
