import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const uploadImageToCloudinary = async (file) => {
  if (!file) return null;
  if (typeof file === "string" && file.startsWith("http")) return file;

  // Sanitize filename to prevent Cloudinary 'invalid public_id' error on non-ASCII/Unicode filenames
  let cleanFile = file;
  if (file instanceof File) {
    const ext = file.name.split(".").pop();
    const safeBaseName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^\w-]/g, "_")
      .replace(/^_+/, "");

    const safeFileName = `${safeBaseName || "image_" + Date.now()}.${ext || "png"}`;
    cleanFile = new File([file], safeFileName, { type: file.type || "image/png" });
  }

  const sigRes = await axiosInstance.get("/cloudinary/sign");
  const { signature, timestamp, apiKey, cloudName, uploadPreset, folder } = sigRes.data;

  const fd = new FormData();
  fd.append("file", cleanFile);
  fd.append("api_key", apiKey);
  fd.append("timestamp", timestamp);
  fd.append("signature", signature);
  fd.append("folder", folder);
  if (uploadPreset) {
    fd.append("upload_preset", uploadPreset);
  }

  const upRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: fd }
  );

  if (!upRes.ok) {
    const errorData = await upRes.json().catch(() => ({}));
    console.error("Cloudinary client upload error:", errorData);
    throw new Error(errorData.error?.message || "Cloudinary upload failed");
  }

  const upData = await upRes.json();
  return upData.secure_url;
};

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

    set({ messages: [...messages, tempMessage] });

    try {
      let imageUrl = null;
      if (messageData.file) {
        imageUrl = await uploadImageToCloudinary(messageData.file);
      }

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        text: messageData.text,
        image: imageUrl,
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
      let imageUrl = failedMessage.image;
      if (failedMessage.rawFile && typeof failedMessage.rawFile !== "string") {
        imageUrl = await uploadImageToCloudinary(failedMessage.rawFile);
      }

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        text: failedMessage.text,
        image: imageUrl,
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
      const { selectedUser, messages } = get();
      if (!selectedUser) return;

      const isMessageSentFromSelectedUser =
        String(newMessage.senderId) === String(selectedUser._id);
      if (!isMessageSentFromSelectedUser) return;

      const isAlreadyAdded = messages.some(
        (m) => String(m._id) === String(newMessage._id)
      );
      if (isAlreadyAdded) return;

      set({
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