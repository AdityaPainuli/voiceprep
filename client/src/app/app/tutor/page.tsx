import TutorClient from "@/app/tutor/tutorClient";
import { Suspense } from "react";


export default function TutorPage() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading tutor…</div>}>
      <TutorClient />
    </Suspense>
  );
}
