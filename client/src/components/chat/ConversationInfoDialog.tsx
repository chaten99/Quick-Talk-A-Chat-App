import { UserMinus, UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { useFriendStore } from "../../store/friendStore";
import type { User } from "../../types/authTypes";
import type { ChatUser, Conversation } from "../../types/chatTypes";

type ConversationInfoDialogProps = {
  open: boolean;
  conversation: Conversation | null;
  currentUser: User | null;
  onClose: () => void;
};

type AddMemberModalProps = {
  open: boolean;
  friends: ChatUser[];
  onAdd: (userIds: string[]) => void;
  onClose: () => void;
};

const AddMemberModal = ({
  open,
  friends,
  onAdd,
  onClose,
}: AddMemberModalProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm mx-4 rounded-3xl bg-[#0b1020] border border-white/10 shadow-2xl p-6 animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] h-[120px] bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <h3 className="text-lg font-bold text-white mb-4">Add Members</h3>

          <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-1 scrollbar-thin">
            {friends.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
                No friends available to add.
              </p>
            ) : (
              friends.map((f) => (
                <label
                  key={f._id}
                  className="flex items-center gap-3 cursor-pointer p-2.5 rounded-2xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.06]"
                >
                  <input
                    type="checkbox"
                    className="accent-indigo-500 w-4 h-4 rounded border-white/10 bg-slate-900 cursor-pointer"
                    checked={selected.includes(f._id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(f._id)
                          ? prev.filter((id) => id !== f._id)
                          : [...prev, f._id],
                      )
                    }
                  />
                  {f.avatar ? (
                    <img
                      src={f.avatar}
                      alt={f.username}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white/5"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-600/80 flex items-center justify-center ring-2 ring-white/5">
                      <span className="text-white text-xs font-bold">
                        {f.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-white text-sm font-medium">
                    {f.username}
                  </span>
                </label>
              ))
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-300 text-sm font-semibold hover:bg-white/[0.08] hover:text-white transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onAdd(selected);
                setSelected([]);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-indigo-600 cursor-pointer"
              disabled={selected.length === 0}
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const getAvatarLetter = (label?: string) => {
  return (label || "C").charAt(0).toUpperCase();
};

const formatLastSeen = (dateString?: string) => {
  if (!dateString) {
    return "Offline";
  }

  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return `Last seen today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return `Last seen yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  return `Last seen ${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const getMemberStatus = (member: ChatUser, currentUserId?: string) => {
  if (member._id === currentUserId) {
    return "You";
  }

  if (member.is_online) {
    return "Online";
  }

  return formatLastSeen(member.last_seen);
};

const ConversationInfoDialog = ({
  open,
  conversation,
  currentUser,
  onClose,
}: ConversationInfoDialogProps) => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { friends, getFriends } = useFriendStore();
  const { addGroupMembers, removeGroupMember } = useChatStore();

  useEffect(() => {
    if (open && friends.length === 0) {
      void getFriends();
    }
  }, [open, friends.length, getFriends]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !addModalOpen && !removingId) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, addModalOpen, removingId]);

  const groupMembers = useMemo(() => {
    if (!conversation?.is_group) return [];

    const ids = new Set<string>();
    const arr: ChatUser[] = [];

    if (currentUser?.id) {
      ids.add(currentUser.id);
      arr.push({
        _id: currentUser.id,
        username: currentUser.username || "You",
        email: currentUser.email,
        avatar: currentUser.avatar,
        is_online: true,
      });
    }

    (conversation.members || []).forEach((m) => {
      if (!ids.has(m._id)) {
        arr.push(m);
        ids.add(m._id);
      }
    });

    return arr.sort((a, b) => {
      if (a._id === currentUser?.id) return -1;
      if (b._id === currentUser?.id) return 1;
      if (a.is_online && !b.is_online) return -1;
      if (!a.is_online && b.is_online) return 1;
      return a.username.localeCompare(b.username);
    });
  }, [conversation, currentUser]);

  const isAdmin = useMemo(() => {
    if (!conversation?.is_group || !currentUser?.id) return false;
    return groupMembers[0]?._id === currentUser.id;
  }, [conversation, currentUser, groupMembers]);

  const friendsToAdd: ChatUser[] = useMemo(() => {
    if (!conversation?.is_group) return [];
    const memberIds = new Set(groupMembers.map((m) => m._id));
    return friends.filter((f) => !memberIds.has(f._id));
  }, [conversation, groupMembers, friends]);

  const handleAddMembers = async (ids: string[]) => {
    if (!conversation?._id) return;
    try {
      await addGroupMembers(conversation._id, ids);
      setAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add members:", error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!conversation?._id) return;
    try {
      await removeGroupMember(conversation._id, userId);
      setRemovingId(null);
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  if (!open || !conversation) {
    return null;
  }

  const handleClickAvatar = (avatar: string | undefined) => {
    if (avatar) {
      window.open(avatar, "_blank");
    }
  };

  const isGroupConversation = conversation.is_group;
  const directFriend = conversation.friend;
  const memberCount =
    conversation.member_count ||
    groupMembers.length ||
    (conversation.members?.length || 0) + 1;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md px-4 py-6 flex items-center justify-center animate-fade-in"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl max-h-[90vh] rounded-[32px] border border-white/10 bg-[#0b1020]/95 shadow-2xl overflow-hidden animate-slide-up flex flex-col"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] h-[180px] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 shrink-0 flex items-center justify-end px-5 py-4 border-b border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all duration-200 cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={2.2} />
            </button>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto px-5 py-5 scrollbar-thin">
            <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.02] px-5 py-8">
              <div className="flex flex-col items-center text-center">
                {isGroupConversation ? (
                  conversation.group_avatar ? (
                    <img
                      src={conversation.group_avatar}
                      alt={conversation.group_name}
                      onClick={() =>
                        handleClickAvatar(conversation.group_avatar)
                      }
                      className="w-28 h-28 rounded-full object-cover ring-4 ring-white/10 shadow-2xl cursor-pointer hover:ring-indigo-500/50 transition-all"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500/80 to-indigo-600/80 flex items-center justify-center ring-4 ring-white/10 shadow-2xl">
                      <span className="text-white text-4xl font-bold">
                        {getAvatarLetter(conversation.group_name)}
                      </span>
                    </div>
                  )
                ) : directFriend?.avatar ? (
                  <img
                    src={directFriend.avatar}
                    alt={directFriend.username}
                    onClick={() => handleClickAvatar(directFriend.avatar)}
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-white/10 shadow-2xl cursor-pointer hover:ring-indigo-500/50 transition-all"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-600/80 flex items-center justify-center ring-4 ring-white/10 shadow-2xl">
                    <span className="text-white text-4xl font-bold">
                      {getAvatarLetter(directFriend?.username)}
                    </span>
                  </div>
                )}

                <h4 className="mt-5 text-2xl font-bold text-white tracking-tight">
                  {isGroupConversation
                    ? conversation.group_name || "Group Chat"
                    : directFriend?.username || "Conversation"}
                </h4>
                <p className="mt-1.5 text-sm font-medium text-slate-400 bg-white/5 px-4 py-1 rounded-full">
                  {isGroupConversation ? (
                    `${memberCount} members`
                  ) : directFriend?.is_online ? (
                    <span className="text-emerald-400">Online</span>
                  ) : (
                    formatLastSeen(directFriend?.last_seen)
                  )}
                </p>
              </div>
            </div>

            {isGroupConversation && (
              <div className="mt-4 space-y-4">
                <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-base font-bold text-white">
                          Group Members
                        </h5>
                        <p className="text-xs text-slate-400">
                          {memberCount} participants
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => setAddModalOpen(true)}
                        className="px-3 py-2 rounded-xl bg-indigo-600 text-white flex items-center gap-2 text-sm font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" /> Add
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin">
                    {groupMembers.map((member) => (
                      <div
                        key={member._id}
                        className="group flex items-center justify-between gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
                      >
                        <div
                          className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer"
                          onClick={() => handleClickAvatar(member.avatar)}
                        >
                          <div className="relative shrink-0">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.username}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center ring-2 ring-white/5 border border-white/10">
                                <span className="text-white font-bold text-lg">
                                  {getAvatarLetter(member.username)}
                                </span>
                              </div>
                            )}
                            {member._id !== currentUser?.id &&
                              member.is_online && (
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0f1528]"></div>
                              )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-semibold text-white truncate flex items-center gap-2">
                              {member.username}
                              {member._id === currentUser?.id && (
                                <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] uppercase tracking-wider text-slate-300">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[13px] text-slate-400 truncate mt-0.5">
                              {member.email ||
                                getMemberStatus(member, currentUser?.id)}
                            </p>
                          </div>
                        </div>

                        {isAdmin && member._id !== currentUser?.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRemovingId(member._id);
                            }}
                            className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                            title="Remove from group"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddMemberModal
        open={addModalOpen}
        friends={friendsToAdd}
        onAdd={handleAddMembers}
        onClose={() => setAddModalOpen(false)}
      />

      {removingId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs mx-4 rounded-2xl bg-[#0b1020] border border-white/10 shadow-2xl p-6 animate-slide-up relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-2">
                Remove Member
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to remove this member from the group?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setRemovingId(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-300 text-sm font-semibold hover:bg-white/[0.08] hover:text-white transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => removingId && handleRemoveMember(removingId)}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-all cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConversationInfoDialog;