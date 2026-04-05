import { Plus, Lock } from "lucide-react";

const HomePage = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0e1a] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-indigo-600/[0.04] blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-600/[0.03] blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-6">
                <div className="relative w-44 h-44 mb-10">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-indigo-500/20 blur-2xl"></div>
                    <div className="relative w-full h-full rounded-full border border-indigo-500/20 bg-[#0c1020] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.08] to-transparent"></div>
                        <div className="relative flex items-center justify-center">
                            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" className="text-indigo-300/80">
                                <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round"/>
                                <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.6"/>
                                <path d="M12 6L12.5 9.5L16 9L13.5 11L16 12L12.5 12.5L13 16L11 13.5L9 16L9.5 12.5L6 12L9 11L7 9L10.5 9.5L12 6Z" fill="currentColor" fillOpacity="0.3"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                    Your Digital Space
                </h1>

                <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
                    Connect with your world instantly. Select a chat to start messaging or start a new conversation to curate your day.
                </p>

                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 cursor-pointer">
                        New Conversation
                    </button>
                    <button className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white/[0.05] border border-white/10 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:bg-white/[0.08] hover:border-white/15 cursor-pointer">
                        Invite Friends
                    </button>
                </div>
            </div>

            <div className="absolute bottom-6 flex items-center gap-2 text-slate-600 text-xs font-medium tracking-widest uppercase">
                <Lock className="w-3 h-3" strokeWidth={2.5} />
                Secure End-to-End Encrypted
            </div>

            <button className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/25 hover:border-indigo-500/30 transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/10">
                <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default HomePage;