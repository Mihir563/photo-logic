// components/ChatBubble.tsx
"use client";
import React from "react";

interface InquiryDetails {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  date: string;
  message: string;
}

interface ChatBubbleProps {
  content: string;
  isCurrentUser: boolean;
}

const InquiryBubble = ({ details }: { details: InquiryDetails }) => (
  <div className="text-left space-y-1">
    <div className="font-semibold text-sm">📩 Inquiry Details:</div>
    <div>Name: {details.name}</div>
    <div>Email: {details.email}</div>
    <div>Phone: {details.phone}</div>
    <div>Event Type: {details.eventType}</div>
    <div>Date: {details.date}</div>
    <div>Message: {details.message}</div>
  </div>
);

const ChatBubble: React.FC<ChatBubbleProps> = ({ content, isCurrentUser }) => {
  let parsedContent;

  try {
    parsedContent = JSON.parse(content);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    parsedContent = null;
  }

  return (
    <div
      className={`rounded-xl p-3 text-sm w-fit max-w-xs shadow whitespace-pre-wrap ${
        isCurrentUser
          ? "ml-auto bg-blue-100 text-right"
          : "mr-auto bg-gray-100 text-left"
      }`}
    >
      {parsedContent?.type === "inquiry" && parsedContent.details ? (
        <InquiryBubble details={parsedContent.details} />
      ) : (
        content
      )}
    </div>
  );
};

export default ChatBubble;
