"use client";

import { useEffect } from "react";

export function WarmupProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/health`).catch(() => {
            // intentionally ignore
        });
    }, []);

    return children;
}
 