import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/verify-email?token=${token}`,
          { method: "GET" }
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Verification failed");
        }

        setStatus("success");
        setMessage("Your email has been verified successfully.");
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.message || "This verification link is invalid or expired."
        );
      }
    };
    verify();
  }, [token]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full bg-[#161b22] border border-gray-800 rounded-xl p-8 text-center shadow-xl">
        {status === "loading" && (
          <>
            <div className="animate-spin mx-auto mb-4 h-8 w-8 rounded-full border-2 border-gray-400 border-t-white" />
            <h2 className="text-white text-lg font-semibold">
              Verifying your email…
            </h2>
            <p className="text-gray-400 text-sm mt-2">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-green-400 text-xl font-semibold mb-2">
              ✅ Email verified
            </h2>
            <p className="text-gray-300 mb-6">
              Your account is now active. You can start using the platform.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg transition"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-red-400 text-xl font-semibold mb-2">
              ❌ Verification failed
            </h2>
            <p className="text-gray-300 mb-4">{message}</p>

            <button
              onClick={() => router.push("/resend-verification")}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
            >
              Resend verification email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
