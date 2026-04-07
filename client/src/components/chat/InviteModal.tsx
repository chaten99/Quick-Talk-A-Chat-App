import { Copy, Check, Link2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

type InviteModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const InviteModal = ({ isOpen, onClose }: InviteModalProps) => {
    const [copied, setCopied] = useState(false);
    const appUrl = window.location.origin;

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(appUrl)
            .then(() => {
                setCopied(true);
                toast.success("Link copied to clipboard!");
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {
                toast.error("Failed to copy link");
            });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-[400px] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-slide-up p-6">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <button 
                        onClick={onClose}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" strokeWidth={2} />
                    </button>

                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-5 rotate-3 shadow-lg shadow-indigo-500/10">
                        <Link2 className="w-8 h-8 text-indigo-400 -rotate-3" strokeWidth={2} />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Invite Friends</h2>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        Share this link with your friends so they can join you on QuickTalk.
                    </p>

                    <div className="w-full flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex-1 px-3 py-2 text-sm text-slate-300 truncate text-left select-all bg-transparent outline-none">
                            {appUrl}
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-all duration-300 cursor-pointer ${
                                copied 
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                    : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20"
                            }`}
                        >
                            {copied ? <Check className="w-5 h-5" strokeWidth={2.5} /> : <Copy className="w-4 h-4 ml-0.5" strokeWidth={2} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
