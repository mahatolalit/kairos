import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, Check, CheckCheck } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import ImageViewer from "./ImageViewer";
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
    typingUsers,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      markMessagesAsSeen(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages, markMessagesAsSeen]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [messages, typingUsers]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const renderStatusTicks = (message) => {
    if (message.status === "sending") {
      return <Loader2 className="size-3 animate-spin opacity-50" />;
    }
    if (message.status === "failed") {
      return (
        <button
          onClick={() => retrySendMessage(message)}
          className="flex items-center text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          title="Failed to deliver. Click to retry"
        >
          <AlertCircle className="size-3.5" />
        </button>
      );
    }
    if (message.isSeen || message.status === "seen") {
      return (
        <CheckCheck 
          className="size-3.5 text-sky-400 drop-shadow-[0_0_3px_rgba(56,189,248,0.8)] stroke-[2.5]" 
          title="Seen" 
        />
      );
    }
    if (message.isDelivered || message.status === "delivered") {
      return (
        <CheckCheck 
          className="size-3.5 text-primary-content/50 stroke-[2.5]" 
          title="Delivered" 
        />
      );
    }
    return (
      <Check 
        className="size-3.5 text-primary-content/50 stroke-[2.5]" 
        title="Sent to server" 
      />
    );
  };

  let lastDateHeader = "";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatHeader />

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-0.5">
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
                      className="sm:max-w-[220px] rounded-md mb-2 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(message.image)}
                      onLoad={() => {
                        if (index === messages.length - 1 && scrollContainerRef.current) {
                          scrollContainerRef.current.scrollTo({
                            top: scrollContainerRef.current.scrollHeight,
                            behavior: "smooth",
                          });
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
        {selectedUser && typingUsers.includes(selectedUser._id) && (
          <TypingIndicator />
        )}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />

      {selectedImage && (
        <ImageViewer 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
};
export default ChatContainer;