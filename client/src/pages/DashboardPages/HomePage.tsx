import { MessageSquarePlus, Users } from "lucide-react";
import { useState } from "react";
import InviteModal from "../../components/chat/InviteModal";
import ConversationModal from "../../components/chat/ConversationModal";
import ChatArea from "../../components/chat/ChatArea";
import { useChatStore } from "../../store/chatStore";
import BrandLogo from "../../components/ui/BrandLogo";

const HomePage = () => {
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isNewConvoOpen, setIsNewConvoOpen] = useState(false);
    const { activeConversationId } = useChatStore();

    if (activeConversationId) {
        return <ChatArea />;
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0e1a] relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-indigo-600/[0.04] blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-600/[0.03] blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-6">
                <div className="relative w-44 h-44 mb-10">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-indigo-500/20 blur-2xl"></div>
                    <div className="relative w-full h-full rounded-full border border-indigo-500/20 bg-[#0c1020] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.08] to-transparent"></div>
                        <BrandLogo mode="icon" className="scale-[2.8] origin-center" />
                    </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                    Welcome to QuickTalk
                </h1>

                <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
                    Select a conversation from the left menu or start a new one to begin seamlessly connecting.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <button 
                        onClick={() => setIsNewConvoOpen(true)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <MessageSquarePlus className="w-5 h-5" />
                        New Conversation
                    </button>
                    <button 
                        onClick={() => setIsInviteOpen(true)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/[0.04] text-white font-semibold hover:bg-white/[0.08] border border-white/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Users className="w-5 h-5 text-slate-400" />
                        Invite Friends
                    </button>
                </div>
            </div>

            <button 
                onClick={() => setIsNewConvoOpen(true)}
                className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 hover:scale-105 transition-all duration-200 z-10 cursor-pointer hidden md:flex"
            >
                <MessageSquarePlus className="w-6 h-6" strokeWidth={2.5} />
            </button>

            <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
            <ConversationModal isOpen={isNewConvoOpen} onClose={() => setIsNewConvoOpen(false)} />
        </div>
    );
};

export default HomePage;
