import { useChatStore } from "../store/useChatStore";

const TypingIndicator = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="chat chat-start animate-chat-receiver !py-0 min-h-0 mt-2">
      <div className="chat-image avatar">
        <div className="size-8 rounded-full border">
          <img
            src={selectedUser?.profilePic || "/avatar.png"}
            alt="profile pic"
          />
        </div>
      </div>
      <div className="chat-bubble bg-base-200 flex items-center justify-center gap-1.5 min-w-0 px-4 py-3.5 min-h-0">
        <div className="w-1.5 h-1.5 bg-base-content/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1.5 h-1.5 bg-base-content/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1.5 h-1.5 bg-base-content/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
