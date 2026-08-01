import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { Loader2, AlertCircle, Check, CheckCheck } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatMessageDateHeader } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    retrySendMessage,
    markMessagesAsSeen,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      markMessagesAsSeen(selectedUser._id);
    }

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, markMessagesAsSeen, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const renderStatusTicks = (message) => {
    if (message.status === "sending") {
      return (
        <span className="bg-primary-content/20 text-primary-content rounded-full p-0.5 flex items-center justify-center">
          <Loader2 className="size-3 animate-spin" />
        </span>
      );
    }
    if (message.status === "failed") {
      return (
        <button
          onClick={() => retrySendMessage(message)}
          className="flex items-center gap-1 text-white hover:text-white transition-colors cursor-pointer bg-red-600 px-1.5 py-0.5 rounded-full font-bold shadow-xs"
          title="Failed to deliver. Click to retry"
        >
          <AlertCircle className="size-3 text-white" />
          <span className="text-[9px] font-bold">Retry</span>
        </button>
      );
    }
    if (message.isSeen || message.status === "seen") {
      return (
        <span
          className="bg-primary-content text-emerald-600 font-black rounded-full px-1 py-0.5 flex items-center shadow-xs"
          title="Seen"
        >
          <CheckCheck className="size-3.5 stroke-[2.5]" />
        </span>
      );
    }
    if (message.isDelivered || message.status === "delivered") {
      return (
        <span
          className="bg-primary-content/90 text-primary font-extrabold rounded-full px-1 py-0.5 flex items-center shadow-xs"
          title="Delivered"
        >
          <CheckCheck className="size-3.5 stroke-[2.5]" />
        </span>
      );
    }
    return (
      <span
        className="bg-primary-content/90 text-primary font-extrabold rounded-full px-1 py-0.5 flex items-center shadow-xs"
        title="Sent to server"
      >
        <Check className="size-3.5 stroke-[2.5]" />
      </span>
    );
  };

  let lastDateHeader = "";

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {messages.map((message, index) => {
          const isSentByMe = message.senderId === authUser._id;
          const dateHeader = formatMessageDateHeader(message.createdAt);
          const showDateDivider = dateHeader && dateHeader !== lastDateHeader;
          if (showDateDivider) {
            lastDateHeader = dateHeader;
          }

          const prevMessage = messages[index - 1];
          const isSameSenderAsPrev =
            !showDateDivider && prevMessage && prevMessage.senderId === message.senderId;

          return (
            <div key={message.tempId || message._id} className={isSameSenderAsPrev ? "mt-0.5" : "mt-2"}>
              {showDateDivider && (
                <div className="flex justify-center my-3">
                  <span className="bg-base-300/80 text-base-content/80 text-xs px-3 py-1 rounded-full font-medium shadow-xs">
                    {dateHeader}
                  </span>
                </div>
              )}
              <div className={`chat ${isSentByMe ? "chat-end animate-chat-sender" : "chat-start animate-chat-receiver"} !py-0 min-h-0`}>
                <div className="chat-image avatar">
                  <div className={`size-8 rounded-full border ${isSameSenderAsPrev ? "opacity-0 invisible" : ""}`}>
                    <img
                      src={
                        isSentByMe
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>

                <div
                  className={`chat-bubble flex flex-col relative pb-5 min-w-[110px] max-w-[85%] sm:max-w-[70%] min-h-0 ${
                    isSentByMe
                      ? "chat-bubble-primary text-primary-content"
                      : "bg-base-200 text-base-content"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[220px] rounded-md mb-2 object-cover"
                      onLoad={() => {
                        if (index === messages.length - 1) {
                          messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                    />
                  )}
                  {message.text && (
                    <p className="break-words text-sm mb-1">{message.text}</p>
                  )}

                  <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px]">
                    <span className="opacity-75">{formatMessageTime(message.createdAt)}</span>
                    {isSentByMe && renderStatusTicks(message)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;