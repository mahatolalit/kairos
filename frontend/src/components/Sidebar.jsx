import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Check, CheckCheck, Image } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className={`h-full w-full lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 ${selectedUser ? "hidden lg:flex" : ""}`}>
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium block">Contacts</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
              {user.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center ring-2 ring-base-100 z-10">
                  {user.unreadCount > 4 ? "4+" : user.unreadCount}
                </span>
              )}
            </div>

            {/* User info */}
            <div className="block text-left min-w-0 flex-1">
              <div className="font-medium truncate">{user.fullName}</div>
              {user.lastMessage ? (
                <div className="text-sm text-zinc-400 truncate flex items-center gap-1">
                  {String(user.lastMessage.senderId) === String(authUser?._id) && (
                    <span className="shrink-0">
                      {user.lastMessage.isSeen ? (
                        <CheckCheck className="size-3.5 text-sky-400 drop-shadow-[0_0_2px_rgba(56,189,248,0.8)] stroke-[2.5]" />
                      ) : user.lastMessage.isDelivered ? (
                        <CheckCheck className="size-3.5 text-base-content/50 stroke-[2.5]" />
                      ) : (
                        <Check className="size-3.5 text-base-content/50 stroke-[2.5]" />
                      )}
                    </span>
                  )}
                  {user.lastMessage.image && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Image className="size-3" />
                      {!user.lastMessage.text && "Photo"}
                    </span>
                  )}
                  {user.lastMessage.text && (
                    <span className="truncate">{user.lastMessage.text}</span>
                  )}
                </div>
              ) : (
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "No messages yet"}
                </div>
              )}
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;