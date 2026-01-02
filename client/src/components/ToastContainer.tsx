import { Toast } from "@/hooks/useVoiceAgent";

export const ToastContainer = ({ toasts }: { toasts: Toast[] }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg text-white
            transition-all duration-300
            ${
              toast.type === "success"
                ? "bg-green-600"
                : toast.type === "error"
                ? "bg-red-600"
                : toast.type === "warning"
                ? "bg-yellow-500 text-black"
                : "bg-blue-600"
            }
          `}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
