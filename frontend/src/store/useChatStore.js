import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { showNotification } from "../lib/utils";


export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  markMessagesAsSeen: async (userId) => {
    try {
      await axiosInstance.put(`/messages/mark-seen/${userId}`);
      set((state) => {
        const newUsers = state.users.map((u) =>
          u._id === userId ? { ...u, unreadCount: 0 } : u
        );
        return { users: newUsers };
      });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;
    if (!selectedUser || !authUser) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const imagePreview =
      messageData.preview ||
      (typeof messageData.file === "string" ? messageData.file : null);

    const tempMessage = {
      _id: tempId,
      tempId: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text || "",
      image: imagePreview,
      createdAt: new Date().toISOString(),
      status: "sending",
      isDelivered: false,
      isSeen: false,
      rawFile: messageData.file || null,
      rawPreview: imagePreview,
    };

    set((state) => {
      const newUsers = [...state.users];
      const userIndex = newUsers.findIndex((u) => u._id === selectedUser._id);
      if (userIndex > -1) {
        const [user] = newUsers.splice(userIndex, 1);
        newUsers.unshift(user);
      }
      return { messages: [...state.messages, tempMessage], users: newUsers };
    });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        text: messageData.text,
        image: imagePreview,
      });

      const updatedMessages = get().messages.map((msg) =>
        msg._id === tempId || msg.tempId === tempId
          ? {
              ...msg,
              _id: res.data._id,
              createdAt: res.data.createdAt || msg.createdAt,
              isDelivered: res.data.isDelivered,
              isSeen: res.data.isSeen,
              status: res.data.isSeen ? "seen" : res.data.isDelivered ? "delivered" : "sent",
              // Preserve existing preview image to prevent DOM image reload flicker
              image: msg.image || res.data.image,
            }
          : msg
      );
      set({ messages: updatedMessages });
    } catch (error) {
      console.error("SendMessage error:", error);
      const failedMessages = get().messages.map((msg) =>
        msg._id === tempId || msg.tempId === tempId ? { ...msg, status: "failed" } : msg
      );
      set({ messages: failedMessages });
      toast.error(error.message || "Message failed to send");
    }
  },

  retrySendMessage: async (failedMessage) => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const targetId = failedMessage._id || failedMessage.tempId;

    set({
      messages: get().messages.map((msg) =>
        msg._id === targetId || msg.tempId === targetId ? { ...msg, status: "sending" } : msg
      ),
    });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        text: failedMessage.text,
        image: failedMessage.rawPreview || failedMessage.image,
      });

      set({
        messages: get().messages.map((msg) =>
          msg._id === targetId || msg.tempId === targetId
            ? {
                ...msg,
                _id: res.data._id,
                createdAt: res.data.createdAt || msg.createdAt,
                isDelivered: res.data.isDelivered,
                isSeen: res.data.isSeen,
                status: res.data.isSeen ? "seen" : res.data.isDelivered ? "delivered" : "sent",
                image: msg.image || res.data.image,
              }
            : msg
        ),
      });
    } catch (error) {
      console.error("RetrySendMessage error:", error);
      set({
        messages: get().messages.map((msg) =>
          msg._id === targetId || msg.tempId === targetId ? { ...msg, status: "failed" } : msg
        ),
      });
      toast.error("Retry failed");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Clean up any old listeners to prevent duplicates
    socket.off("newMessage");
    socket.off("messagesSeen");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, users } = get();

      // Rearrange users so the sender moves to the top
      let newUsers = [...users];
      const userIndex = newUsers.findIndex((u) => u._id === newMessage.senderId);
      if (userIndex > -1) {
        const [user] = newUsers.splice(userIndex, 1);
        newUsers.unshift(user);
      }

      const isMessageSentFromSelectedUser =
        selectedUser && String(newMessage.senderId) === String(selectedUser._id);

      if (!isMessageSentFromSelectedUser) {
        const sender = users.find((u) => String(u._id) === String(newMessage.senderId));
        if (sender) {
          sender.unreadCount = (sender.unreadCount || 0) + 1;
        }
        set({ users: newUsers });

        if (sender) {
          toast(`New message from ${sender.fullName}`, { icon: "💬" });
          showNotification(`New message from ${sender.fullName}`, {
            body: newMessage.text || "Sent an attachment",
            icon: sender.profilePic || "/avatar.png"
          });
        } else {
          toast("New message received", { icon: "💬" });
          showNotification("New message received", {
            body: newMessage.text || "Sent an attachment"
          });
        }
        return;
      }

      const isAlreadyAdded = messages.some(
        (m) => String(m._id) === String(newMessage._id)
      );
      if (isAlreadyAdded) {
        set({ users: newUsers });
        return;
      }

      set({
        users: newUsers,
        messages: [...messages, newMessage],
      });

      get().markMessagesAsSeen(selectedUser._id);
    });

    socket.on("messagesSeen", ({ senderId, receiverId }) => {
      const authUser = useAuthStore.getState().authUser;
      const { selectedUser, messages } = get();
      if (
        selectedUser &&
        (String(selectedUser._id) === String(senderId) || String(selectedUser._id) === String(receiverId))
      ) {
        set({
          messages: messages.map((msg) =>
            String(msg.senderId) === String(authUser?._id)
              ? { ...msg, isSeen: true, isDelivered: true, status: "seen" }
              : msg
          ),
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("messagesSeen");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));