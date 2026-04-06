import { Users, MessageSquare } from "lucide-react";
import { useFriendStore } from "../../store/friendStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FriendsPage = () => {
    const { friends, getFriends } = useFriendStore();
    const navigate = useNavigate();

    useEffect(() => {
        getFriends();
    }, [getFriends]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0e1a] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-indigo-600/[0.04] blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-600/[0.03] blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-6">
                <div className="relative w-44 h-44 mb-10">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-indigo-500/20 blur-2xl"></div>
                    <div className="relative w-full h-full rounded-full border border-indigo-500/20 bg-[#0c1020] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.08] to-transparent"></div>
                        <Users className="w-16 h-16 text-indigo-300/80" strokeWidth={1.2} />
                    </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                    Your Friends
                </h1>

                <p className="text-slate-400 text-base leading-relaxed mb-3 max-w-sm">
                    {friends.length > 0
                        ? `You have ${friends.length} friend${friends.length > 1 ? "s" : ""}. Select a friend from the sidebar to start chatting.`
                        : "Your friends list is empty. Add friends to start connecting and chatting."
                    }
                </p>

                <p className="text-slate-600 text-sm mb-10">
                    Browse your friends on the left panel
                </p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/add-friend")}
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 cursor-pointer"
                    >
                        Add Friends
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white/[0.05] border border-white/10 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:bg-white/[0.08] hover:border-white/15 cursor-pointer"
                    >
                        <MessageSquare className="w-4 h-4" strokeWidth={2} />
                        Messages
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FriendsPage;
