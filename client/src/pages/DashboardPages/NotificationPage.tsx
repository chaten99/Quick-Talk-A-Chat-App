import { Bell } from "lucide-react";

const NotificationPage = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0e1a] relative overflow-hidden hidden md:flex">
            <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-indigo-600/[0.04] blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-600/[0.03] blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-6">
                <div className="relative w-44 h-44 mb-10">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-indigo-500/20 blur-2xl"></div>
                    <div className="relative w-full h-full rounded-full border border-indigo-500/20 bg-[#0c1020] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.08] to-transparent"></div>
                        <Bell className="w-16 h-16 text-indigo-300/80" strokeWidth={1.2} />
                    </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                    Notifications
                </h1>

                <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
                    Manage your friend requests and stay updated. Browse your notifications on the left panel.
                </p>
            </div>
        </div>
    );
};

export default NotificationPage;
