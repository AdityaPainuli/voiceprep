import { Suspense } from "react";
import TutorClient from "./tutorClient";

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading tutor…</div>}>
      <TutorClient />
    </Suspense>
  );
}
