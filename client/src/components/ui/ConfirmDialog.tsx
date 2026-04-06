type ConfirmDialogProps = {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: "danger" | "default";
}

const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    variant = "default",
}: ConfirmDialogProps) => {
    if (!open) return null;

    const confirmStyles = variant === "danger"
        ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
        : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-sm mx-4 rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl p-6 animate-slide-up relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">{message}</p>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/[0.08] transition-all duration-200 cursor-pointer"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${confirmStyles}`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
