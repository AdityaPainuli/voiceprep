import { Suspense } from "react";
import DemoClient from "./DemoClient";

export default function DemoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">Loading Demo...</div>}>
            <DemoClient />
        </Suspense>
    );
}
