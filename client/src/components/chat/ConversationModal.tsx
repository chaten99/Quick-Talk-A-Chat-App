import { Search, X, MessageSquarePlus, Loader2, Users, Check, Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { chatApi } from "../../api/chatApi";
import { useFriendStore } from "../../store/friendStore";
import { useChatStore } from "../../store/chatStore";

type ConversationMode = "direct" | "group";

type ConversationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: ConversationMode;
};

const ConversationModal = ({ isOpen, onClose, defaultMode = "direct" }: ConversationModalProps) => {
    const { friends, getFriends, loading } = useFriendStore();
    const { upsertConversation, setActiveConversation } = useChatStore();
    const [mode, setMode] = useState<ConversationMode>(defaultMode);
    const [filter, setFilter] = useState("");
    const [creatingConversationId, setCreatingConversationId] = useState<string | null>(null);
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [groupAvatarFile, setGroupAvatarFile] = useState<File | null>(null);
    const [groupAvatarPreview, setGroupAvatarPreview] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && friends.length === 0) {
            void getFriends();
        }
    }, [isOpen, friends.length, getFriends]);

    useEffect(() => {
        if (isOpen) {
            setMode(defaultMode);
        }
    }, [defaultMode, isOpen]);

    const resetState = () => {
        setFilter("");
        setCreatingConversationId(null);
        setCreatingGroup(false);
        setGroupName("");
        setSelectedMemberIds([]);
        setGroupAvatarFile(null);
        setGroupAvatarPreview("");
        setMode(defaultMode);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    if (!isOpen) return null;

    const filteredFriends = friends.filter((friend) =>
        friend.username.toLowerCase().includes(filter.toLowerCase()) ||
        friend.email.toLowerCase().includes(filter.toLowerCase())
    );

    const handleSelectFriend = async (friendId: string) => {
        try {
            setCreatingConversationId(friendId);
            const conversation = await chatApi.getOrCreateConversation(friendId);
            upsertConversation(conversation);
            setActiveConversation(conversation._id);
            handleClose();
        } catch (error) {
            const apiError = error as AxiosError<{ message: string }>;
            toast.error(apiError.response?.data?.message || "Failed to start conversation");
        } finally {
            setCreatingConversationId(null);
        }
    };

    const handleAvatarFile = (file?: File | null) => {
        if (!file) {
            return;
        }

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, PNG, and WebP images are allowed");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setGroupAvatarPreview(reader.result?.toString() || "");
        });
        reader.readAsDataURL(file);
        setGroupAvatarFile(file);
    };

    const toggleMemberSelection = (friendId: string) => {
        setSelectedMemberIds((currentIds) =>
            currentIds.includes(friendId)
                ? currentIds.filter((id) => id !== friendId)
                : [...currentIds, friendId]
        );
    };

    const handleCreateGroup = async () => {
        try {
            setCreatingGroup(true);
            const conversation = await chatApi.createGroupConversation({
                groupName: groupName.trim(),
                memberIds: selectedMemberIds,
                avatar: groupAvatarFile
            });
            upsertConversation(conversation);
            setActiveConversation(conversation._id);
            handleClose();
        } catch (error) {
            const apiError = error as AxiosError<{ message: string }>;
            toast.error(apiError.response?.data?.message || "Failed to create group");
        } finally {
            setCreatingGroup(false);
        }
    };

    const canCreateGroup = groupName.trim() !== "" && selectedMemberIds.length >= 2 && !creatingGroup;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleClose}></div>

            <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[620px] max-h-[88vh] overflow-hidden animate-slide-up">
                <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none"></div>

                <div className="flex items-center justify-between p-5 border-b border-white/[0.06] relative z-10">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-0.5">
                            {mode === "group" ? "Create Group" : "New Conversation"}
                        </h2>
                        <p className="text-slate-400 text-xs">
                            {mode === "group" ? "Add a name, avatar, and members" : "Select a friend to start chatting"}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" strokeWidth={2} />
                    </button>
                </div>

                <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] relative z-10">
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#0b1020] p-1 border border-white/[0.05]">
                        <button
                            type="button"
                            onClick={() => setMode("direct")}
                            className={`h-10 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                mode === "direct"
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                            }`}
                        >
                            Direct
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("group")}
                            className={`h-10 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                mode === "group"
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                            }`}
                        >
                            Group
                        </button>
                    </div>
                </div>

                {mode === "group" && (
                    <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] relative z-10">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
                            >
                                {groupAvatarPreview ? (
                                    <img
                                        src={groupAvatarPreview}
                                        alt="Group avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <Camera className="w-5 h-5 mb-1" strokeWidth={1.8} />
                                        <span className="text-[10px] font-semibold">Avatar</span>
                                    </div>
                                )}
                            </button>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Group name"
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500/40 focus:bg-white/[0.06]"
                                />
                                <p className="text-[11px] text-slate-500 mt-2">
                                    Select at least 2 friends to create a group.
                                </p>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => handleAvatarFile(e.target.files?.[0] || null)}
                        />
                    </div>
                )}

                <div className="p-4 border-b border-white/[0.06] relative z-10">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={2} />
                        <input
                            type="text"
                            placeholder={mode === "group" ? "Search friends to add..." : "Search friends..."}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500/40 focus:bg-white/[0.06]"
                        />
                    </div>
                    {mode === "group" && (
                        <div className="flex items-center justify-between mt-3 px-1">
                            <p className="text-xs text-slate-400">
                                {selectedMemberIds.length} selected
                            </p>
                            <button
                                type="button"
                                onClick={() => setSelectedMemberIds([])}
                                className="text-xs font-medium text-slate-500 hover:text-white transition-colors cursor-pointer"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin relative z-10">
                    {loading && friends.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                    ) : filteredFriends.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                                {mode === "group" ? (
                                    <Users className="w-5 h-5 text-slate-500" />
                                ) : (
                                    <MessageSquarePlus className="w-5 h-5 text-slate-500" />
                                )}
                            </div>
                            <p className="text-slate-400 text-sm font-medium mb-1">No friends found</p>
                            <p className="text-slate-500 text-xs">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredFriends.map((friend) => {
                                const isSelected = selectedMemberIds.includes(friend._id);

                                return (
                                    <button
                                        key={friend._id}
                                        onClick={() => mode === "group" ? toggleMemberSelection(friend._id) : handleSelectFriend(friend._id)}
                                        disabled={creatingConversationId !== null || creatingGroup}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                                            mode === "group" && isSelected
                                                ? "bg-indigo-500/10 border border-indigo-500/20"
                                                : "hover:bg-white/[0.04] border border-transparent"
                                        }`}
                                    >
                                        <div className="relative">
                                            {friend.avatar ? (
                                                <img
                                                    src={friend.avatar}
                                                    alt={friend.username}
                                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10">
                                                    <span className="text-white font-semibold text-sm">
                                                        {friend.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0c1020] ${
                                                friend.is_online
                                                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                                                    : "bg-slate-600"
                                            }`}></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-semibold truncate group-hover:text-indigo-300 transition-colors">
                                                {friend.username}
                                            </p>
                                            <p className="text-slate-500 text-xs truncate">
                                                {friend.is_online ? "Online" : friend.email}
                                            </p>
                                        </div>
                                        {mode === "group" ? (
                                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                                isSelected
                                                    ? "bg-indigo-500 border-indigo-500 text-white"
                                                    : "border-white/[0.12] text-transparent"
                                            }`}>
                                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                            </div>
                                        ) : creatingConversationId === friend._id ? (
                                            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {mode === "group" && (
                    <div className="p-4 border-t border-white/[0.06] bg-[#0f1424] relative z-10">
                        <button
                            type="button"
                            onClick={handleCreateGroup}
                            disabled={!canCreateGroup}
                            className={`w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                                canCreateGroup
                                    ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 cursor-pointer"
                                    : "bg-white/[0.04] text-slate-500 cursor-not-allowed"
                            }`}
                        >
                            {creatingGroup ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Users className="w-4 h-4" strokeWidth={2.2} />
                            )}
                            {creatingGroup ? "Creating Group..." : "Create Group"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationModal;
