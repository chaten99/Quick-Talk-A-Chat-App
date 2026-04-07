import { Search, UserPlus, Clock, UserCheck, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useFriendStore } from "../../store/friendStore";
import useDebounce from "../../hooks/useDebounce";
import { toast } from "react-toastify";

const AddFriendPage = () => {
    const { searchResults, searching, searchUsers, loadMoreSearch, sendRequest, cancelRequest, clearSearch, friends, pendingRequests, getPendingRequests } = useFriendStore();
    const [query, setQuery] = useState("");
    const [sentRequests, setSentRequests] = useState<Record<string, string>>({});
    const debouncedQuery = useDebounce(query, 400);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getPendingRequests();
    }, [getPendingRequests]);

    useEffect(() => {
        if (debouncedQuery.trim().length > 0) {
            searchUsers(debouncedQuery);
        } else {
            clearSearch();
        }
    }, [debouncedQuery, searchUsers, clearSearch]);

    const getRequestStatus = (userId: string) => {
        if (friends.some((f) => f._id === userId)) return "friends";
        if (sentRequests[userId]) return "sent";
        if (pendingRequests.some((r) => r.sender_id._id === userId)) return "received";
        return "none";
    };

    const handleSend = async (receiverId: string) => {
        const res = await sendRequest(receiverId);
        if (res.success) {
            setSentRequests((prev) => ({ ...prev, [receiverId]: "pending" }));
            toast.success("Friend request sent");
        } else {
            toast.error(res.message);
        }
    };

    const handleCancel = async (receiverId: string) => {
        const requestId = sentRequests[receiverId];
        if (!requestId) return;
        const res = await cancelRequest(requestId);
        if (res.success) {
            setSentRequests((prev) => {
                const copy = { ...prev };
                delete copy[receiverId];
                return copy;
            });
            toast.success("Request cancelled");
        } else {
            toast.error(res.message);
        }
    };

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
            if (debouncedQuery.trim().length > 0) {
                loadMoreSearch(debouncedQuery);
            }
        }
    }, [loadMoreSearch, debouncedQuery]);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener("scroll", handleScroll);
            return () => el.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll]);

    return (
        <div className="flex-1 flex flex-col bg-[#0a0e1a] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-indigo-600/[0.04] blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-600/[0.03] blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="px-8 pt-8 pb-6 border-b border-white/[0.06]">
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Add Friends</h1>
                    <p className="text-slate-500 text-sm mb-5">Search by username, email, or phone number</p>

                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500/40 focus:bg-white/[0.06]"
                        />
                        {searching && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" />
                        )}
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
                    {!debouncedQuery.trim() ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="relative w-32 h-32 mb-8">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-indigo-500/15 blur-xl"></div>
                                <div className="relative w-full h-full rounded-full border border-white/[0.06] bg-[#0c1020] flex items-center justify-center">
                                    <UserPlus className="w-12 h-12 text-indigo-300/60" strokeWidth={1.2} />
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Find people to connect with</p>
                            <p className="text-slate-600 text-xs">Start typing to search by username, email, or phone</p>
                        </div>
                    ) : searching && searchResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                    ) : searchResults.length === 0 && debouncedQuery.trim() ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                                <Search className="w-7 h-7 text-slate-600" strokeWidth={1.5} />
                            </div>
                            <p className="text-slate-400 text-sm font-medium mb-1">No users found</p>
                            <p className="text-slate-600 text-xs">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                            {searchResults.map((result) => {
                                const status = getRequestStatus(result._id);
                                return (
                                    <div
                                        key={result._id}
                                        className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-300 text-center relative group"
                                    >
                                        {result.avatar ? (
                                            <img
                                                src={result.avatar}
                                                alt={result.username}
                                                className="w-20 h-20 rounded-full object-cover ring-4 ring-white/5 group-hover:ring-indigo-500/20 transition-all shadow-xl"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-4 ring-white/5 group-hover:ring-indigo-500/20 transition-all shadow-xl">
                                                <span className="text-white font-bold text-2xl">
                                                    {result.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}

                                        <div className="w-full">
                                            <p className="text-white text-lg font-bold truncate mb-1">{result.username}</p>
                                            <p className="text-slate-400 text-sm truncate mb-4">{result.email}</p>
                                        </div>

                                        <div className="w-full mt-auto">
                                            {status === "friends" ? (
                                                <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-semibold border border-emerald-500/20">
                                                    <UserCheck className="w-4 h-4" strokeWidth={2} />
                                                    Friends
                                                </div>
                                            ) : status === "sent" ? (
                                                <button
                                                    onClick={() => handleCancel(result._id)}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-sm font-semibold hover:bg-red-500/10 hover:text-red-400 border border-amber-500/20 hover:border-red-500/20 transition-all duration-200 cursor-pointer group/btn"
                                                >
                                                    <Clock className="w-4 h-4 group-hover/btn:hidden" strokeWidth={2} />
                                                    <span className="group-hover/btn:hidden">Pending</span>
                                                    <span className="hidden group-hover/btn:flex text-red-400">Cancel</span>
                                                </button>
                                            ) : status === "received" ? (
                                                <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 text-sm font-semibold border border-indigo-500/20">
                                                    <Clock className="w-4 h-4" strokeWidth={2} />
                                                    Requested
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleSend(result._id)}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors duration-200 shadow-md shadow-indigo-500/20 cursor-pointer"
                                                >
                                                    <UserPlus className="w-4 h-4" strokeWidth={2} />
                                                    Add Friend
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddFriendPage;
