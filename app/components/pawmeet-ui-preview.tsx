import Image from "next/image";
import {
  Bell,
  Dog,
  ImageIcon,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  PawPrint,
  Search,
  Send,
  User,
  Volume2,
} from "lucide-react";
import { BorderAnimatedContainer } from "./border-animated-container";

const contacts = [
  {
    name: "Mila & Luna",
    breed: "Golden Retriever",
    location: "Novi Beograd",
    online: true,
  },
  {
    name: "Nikola & Rex",
    breed: "German Shepherd",
    location: "Vracar",
    online: false,
  },
  {
    name: "Ana & Koko",
    breed: "Poodle",
    location: "Zemun",
    online: true,
  },
];

const messages = [
  {
    id: 1,
    align: "start",
    text: "Hey! Luna is free for a walk around 18:00.",
    time: "17:42",
  },
  {
    id: 2,
    align: "end",
    text: "Perfect, Rex loves the riverside route.",
    time: "17:44",
  },
  {
    id: 3,
    align: "start",
    text: "Great, see you near the dog park.",
    time: "17:45",
  },
];

export function PawMeetUiPreview() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center gap-5 lg:grid-cols-[1fr_360px]">
      <section className="h-[760px] min-h-0">
        <BorderAnimatedContainer>
          <aside className="hidden w-80 flex-col bg-slate-800/50 backdrop-blur-sm md:flex">
            <ProfileHeader />
            <div className="tabs tabs-boxed m-2 bg-transparent p-2">
              <button className="tab bg-cyan-500/20 text-cyan-400">
                Chats
              </button>
              <button className="tab text-slate-400">Contacts</button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {contacts.map((contact) => (
                <ContactCard key={contact.name} {...contact} />
              ))}
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col bg-slate-900/50 backdrop-blur-sm">
            <ChatHeader />
            <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat ${
                      message.align === "end" ? "chat-end" : "chat-start"
                    }`}
                  >
                    <div
                      className={`chat-bubble relative ${
                        message.align === "end"
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs opacity-75">
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <MessageComposer />
          </section>
        </BorderAnimatedContainer>
      </section>

      <aside className="hidden lg:block">
        <AuthPanel />
      </aside>
    </main>
  );
}

function ProfileHeader() {
  return (
    <div className="border-b border-slate-700/50 p-6">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="avatar online">
            <div className="size-14 rounded-full">
              <Image
                src="/avatar.png"
                alt="PawMeet profile"
                width={56}
                height={56}
              />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium text-slate-200">
              PawMeet Social
            </h3>
            <p className="text-xs text-slate-400">Online</p>
            <div className="mt-2 flex flex-col gap-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Dog className="size-3.5" />
                Buddy
              </span>
              <span className="flex items-center gap-1">
                <PawPrint className="size-3.5" />
                Labrador
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                Dorcol
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Volume2 className="size-5" />
          <Bell className="size-5" />
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  name,
  breed,
  location,
  online,
}: {
  name: string;
  breed: string;
  location: string;
  online: boolean;
}) {
  return (
    <button className="w-full rounded-lg bg-cyan-500/10 p-4 text-left transition-colors hover:bg-cyan-500/20">
      <div className="flex items-center gap-3">
        <div className={`avatar ${online ? "online" : "offline"}`}>
          <div className="size-12 rounded-full">
            <Image src="/avatar.png" alt={name} width={48} height={48} />
          </div>
        </div>
        <div className="min-w-0">
          <h4 className="truncate font-medium text-slate-200">{name}</h4>
          <div className="mt-1 space-y-0.5 text-xs text-slate-400">
            <p className="flex items-center gap-1">
              <PawPrint className="size-3" />
              {breed}
            </p>
            <p className="flex items-center gap-1">
              <MapPin className="size-3" />
              {location}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

function ChatHeader() {
  return (
    <div className="flex max-h-[84px] flex-1 items-center justify-between border-b border-slate-700/50 bg-slate-800/50 px-4 py-4 sm:px-6">
      <div className="flex items-center space-x-3">
        <div className="avatar online">
          <div className="w-12 rounded-full">
            <Image
              src="/avatar.png"
              alt="Mila and Luna"
              width={48}
              height={48}
            />
          </div>
        </div>
        <div>
          <h3 className="font-medium text-slate-200">Mila & Luna</h3>
          <p className="text-sm text-slate-400">Online</p>
        </div>
      </div>
      <Search className="size-5 cursor-pointer text-slate-400 transition-colors hover:text-slate-200" />
    </div>
  );
}

function MessageComposer() {
  return (
    <form className="border-t border-slate-700/50 p-4">
      <div className="mx-auto flex max-w-3xl gap-3 sm:gap-4">
        <input
          className="min-w-0 flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-slate-200 placeholder-slate-400"
          placeholder="Type a message..."
        />
        <button
          className="rounded-lg bg-slate-800/50 px-4 text-slate-400 transition-colors hover:text-slate-200"
          type="button"
        >
          <ImageIcon className="size-5" />
        </button>
        <button className="rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2 font-medium text-white transition-all hover:from-cyan-600 hover:to-cyan-700">
          <Send className="size-5" />
        </button>
      </div>
    </form>
  );
}

function AuthPanel() {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-sm">
      <div className="mb-8 text-center">
        <MessageCircle className="mx-auto mb-4 size-12 text-slate-400" />
        <h2 className="mb-2 text-2xl font-bold text-slate-200">
          Welcome Back
        </h2>
        <p className="text-slate-400">Login to access your account</p>
      </div>

      <form className="space-y-5">
        <div>
          <label className="auth-input-label">Email</label>
          <div className="relative">
            <Mail className="auth-input-icon" />
            <input
              className="input"
              placeholder="you@pawmeet.app"
              type="email"
            />
          </div>
        </div>

        <div>
          <label className="auth-input-label">Password</label>
          <div className="relative">
            <Lock className="auth-input-icon" />
            <input className="input" placeholder="Password" type="password" />
          </div>
        </div>

        <div>
          <label className="auth-input-label">Dog Name</label>
          <div className="relative">
            <User className="auth-input-icon" />
            <input className="input" placeholder="Buddy" />
          </div>
        </div>

        <button className="auth-btn">Continue</button>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <span className="auth-badge">Free</span>
        <span className="auth-badge">Easy Setup</span>
        <span className="auth-badge">Private</span>
      </div>

      <div className="mt-6 text-center">
        <a className="auth-link" href="#">
          Create a new account
        </a>
      </div>
    </div>
  );
}
