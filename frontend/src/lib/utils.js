export function formatMessageTime(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatMessageDateHeader(dateStr) {
  if (!dateStr) return "";
  const messageDate = new Date(dateStr);
  if (isNaN(messageDate.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(messageDate, today)) {
    return "Today";
  } else if (isSameDay(messageDate, yesterday)) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: messageDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }
}