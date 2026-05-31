"use client";

import { Loader2, MessageCircle, Send, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";

import { sendMessageAction } from "@/lib/social/message-actions";
import type {
  ChatMessageSummary,
  ChatUserSummary,
} from "@/lib/social/messages";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type ChatViewProps = {
  currentUserId: string | null;
  initialMessages: ChatMessageSummary[];
  selectedUser: ChatUserSummary | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatMessageTime(date: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function EmptyConversation({ name }: { name: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-cyan-500/15">
        <MessageCircle className="size-8 text-cyan-300" />
      </div>
      <h3 className="mb-3 text-lg font-medium text-slate-200">
        Start your conversation with {name}
      </h3>
      <p className="max-w-md text-sm leading-6 text-slate-400">
        This is the beginning of your conversation. Send a message to start
        chatting.
      </p>
    </div>
  );
}

function NoConversationPlaceholder({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="flex min-h-[620px] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-cyan-500/15">
        <MessageCircle className="size-10 text-cyan-300" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-slate-200">
        {signedIn ? "Select a conversation" : "Sign in to chat"}
      </h3>
      <p className="max-w-md text-sm leading-6 text-slate-400">
        {signedIn
          ? "Choose a user from the chat sidebar to start chatting or continue a conversation."
          : "Your PawMeet conversations will appear here after you sign in."}
      </p>
    </div>
  );
}

export function ChatView({
  currentUserId,
  initialMessages,
  selectedUser,
}: ChatViewProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedUser || !currentUserId) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/messages/${selectedUser.id}`);

        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as {
          messages?: ChatMessageSummary[];
        };

        if (result.messages) {
          setMessages(result.messages);
        }
      } catch {
        // Keep the currently rendered conversation if polling fails.
      }
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [currentUserId, selectedUser]);

  function handleSendMessage() {
    const trimmedText = text.trim();

    if (!selectedUser || !currentUserId || !trimmedText || isPending) {
      return;
    }

    startTransition(async () => {
      const optimisticMessage: ChatMessageSummary = {
        createdAt: new Date().toISOString(),
        id: `optimistic-${Date.now()}`,
        image: null,
        read: false,
        receiverId: selectedUser.id,
        senderId: currentUserId,
        text: trimmedText,
      };

      setText("");
      setMessages((currentMessages) => [...currentMessages, optimisticMessage]);

      try {
        const result = await sendMessageAction({
          receiverId: selectedUser.id,
          text: trimmedText,
        });

        if (result.error || !result.message) {
          setMessages((currentMessages) =>
            currentMessages.filter(
              (message) => message.id !== optimisticMessage.id,
            ),
          );
          toast.error(result.error ?? "Message could not be sent.");
          return;
        }

        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === optimisticMessage.id ? result.message! : message,
          ),
        );
      } catch {
        setMessages((currentMessages) =>
          currentMessages.filter(
            (message) => message.id !== optimisticMessage.id,
          ),
        );
        toast.error("Something went wrong while sending your message.");
      }
    });
  }

  if (!selectedUser || !currentUserId) {
    return <NoConversationPlaceholder signedIn={Boolean(currentUserId)} />;
  }

  return (
    <div className="flex min-h-[620px] flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-950/40 shadow-2xl shadow-cyan-950/20 backdrop-blur-md">
      <div className="flex min-h-20 items-center justify-between gap-3 border-b border-slate-700/70 bg-slate-900/40 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-11">
            <AvatarImage
              src={selectedUser.image ?? undefined}
              alt={selectedUser.name}
            />
            <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-100">
              {selectedUser.name}
            </h2>
            <p className="truncate text-xs text-slate-500">
              {selectedUser.dogName ?? "Dog name not set"}
            </p>
          </div>
        </div>

        <Link
          aria-label="Close conversation"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900/60 text-slate-300 transition-colors hover:border-cyan-400/70 hover:text-white"
          href="/messages"
        >
          <X className="size-4" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {messages.length > 0 ? (
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.map((message) => {
              const isMine = message.senderId === currentUserId;

              return (
                <div
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  key={message.id}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-lg ${
                      isMine
                        ? "rounded-br-md bg-cyan-600 text-white shadow-cyan-950/30"
                        : "rounded-bl-md bg-slate-800 text-slate-200 shadow-slate-950/30"
                    }`}
                  >
                    {message.text ? (
                      <p className="whitespace-pre-wrap leading-6">
                        {message.text}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs opacity-70">
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : (
          <EmptyConversation name={selectedUser.name} />
        )}
      </div>

      <div className="border-t border-slate-700/70 bg-slate-950/60 p-4">
        <form
          className="mx-auto flex max-w-3xl gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            className="min-h-11 flex-1 rounded-lg border border-slate-700/70 bg-slate-900/60 px-4 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            maxLength={2000}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type your message..."
            value={text}
          />
          <button
            aria-label="Send message"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-cyan-500 text-white shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
            disabled={!text.trim() || isPending}
            type="submit"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
