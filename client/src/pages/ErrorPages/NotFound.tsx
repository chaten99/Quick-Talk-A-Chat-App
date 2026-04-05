import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="relative min-h-screen w-full bg-[#030014] flex items-center justify-center overflow-hidden selection:bg-indigo-500/30">
            
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none select-none z-0 w-full">
                <h1 className="text-[25vw] font-black text-white/[0.02] tracking-tighter leading-none">
                    404
                </h1>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl w-full px-6 text-center">
                
                <div className="relative flex items-center justify-center w-24 h-24 mb-10 group animate-[bounce_4s_infinite]">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl transition-all duration-500 group-hover:bg-indigo-500/40 group-hover:blur-2xl"></div>
                    <div className="relative flex items-center justify-center w-full h-full rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent"></div>
                        <svg className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                    <span className="flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">System Error</span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-6 tracking-tight">
                    Page Not Found
                </h2>
                
                <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-lg leading-relaxed font-medium">
                    The frequency you are trying to tune into does not exist. The signal has been lost to the digital void.
                </p>
                
                <Link 
                    to="/" 
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]"
                >
                    <div className="absolute inset-0 bg-white"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-indigo-100 to-purple-100 transition-opacity duration-300"></div>
                    
                    <span className="relative flex items-center gap-2 text-slate-950 font-bold text-base">
                        Return to QuickTalk
                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                </Link>

            </div>
        </div>
    );
};

export default NotFound;