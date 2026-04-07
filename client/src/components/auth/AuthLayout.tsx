import React from 'react';
import BrandLogo from "../ui/BrandLogo";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 flex flex-col">
                <div className="text-center mb-10 animate-fade-in flex justify-center">
                    <div className="inline-flex items-center px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-[28px] shadow-[0_22px_55px_rgba(15,23,42,0.45)]">
                        <BrandLogo mode="full" />
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
