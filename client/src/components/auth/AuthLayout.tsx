import React from 'react';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 flex flex-col">
                <div className="text-center mb-10 animate-fade-in flex justify-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <svg 
                                className="w-6 h-6 text-white" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                                />
                            </svg>
                        </div>
                        <span className="text-white font-extrabold tracking-tight text-3xl">
                            QuickTalk
                        </span>
                    </div>
                </div>

                <div className="w-full drop-shadow-2xl">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;