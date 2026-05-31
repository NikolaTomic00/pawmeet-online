# PawMeet Social App

https://pawmeet.vercel.app

PawMeet is a full-stack social networking application built for pet owners and animal lovers. The app gives users a focused place to create a profile, share posts with images, interact through likes and comments, follow other users, receive notifications, and exchange direct messages.

I built this project to practice and demonstrate production-oriented full-stack development with modern React, Next.js App Router, authentication, relational data modeling, server actions, media uploads, and responsive UI design.

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44.7-C5F74F?style=for-the-badge&logo=drizzle&logoColor=111827)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Uploads-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

## What I Built

- A responsive social feed where users can create text and image posts.
- Authenticated user accounts with Clerk and database profile synchronization.
- User profiles with editable bio, location, pet name, breed, avatar, and profile photo gallery.
- Social interactions including likes, comments, follows, and post deletion.
- Notification system for likes, comments, and follows.
- Direct messaging experience with chat contacts, unread message counts, and conversation read state.
- Secure image upload flow through a server-side Cloudinary signing route.
- Relational PostgreSQL schema with Drizzle ORM, indexes, unique constraints, cascade deletes, and data integrity checks.
- Responsive layout with desktop sidebars, mobile navigation, dark UI styling, and a custom PawMeet favicon.

## How I Built It

The application uses the Next.js App Router as the main architecture. Server components load authenticated user data, feed posts, profile data, notifications, and chat state before rendering each route. Client components are used where interaction is needed, such as creating posts, uploading images, liking posts, writing comments, editing profiles, following users, and sending messages.

Authentication is handled with Clerk. After sign-in, the app synchronizes the Clerk user into the local database so the rest of the social features can rely on an internal user model. This makes it possible to connect posts, comments, likes, follows, messages, notifications, and profile photos through relational foreign keys.

Database access is implemented with Drizzle ORM on top of PostgreSQL. The schema includes users, posts, profile photos, comments, likes, follows, notifications, and messages. I added indexes for common lookup patterns such as feed loading, unread counts, user relationships, and message threads. The schema also includes unique constraints to prevent duplicate likes or follows, plus checks that prevent self-following and self-messaging.

Media uploads are routed through a protected Next.js API endpoint. The server creates a Cloudinary signature, uploads the image, stores the returned URL and metadata, and associates the image with either a feed post or a profile photo.

## Core Features

### Feed

Users can publish posts with text, images, or both. Feed posts include author details, profile links, timestamps, image rendering, like counts, comments, and delete controls for the post owner.

### Profiles

Each user has a profile page with editable personal and pet information. Users can upload multiple profile photos, delete their own profile photos, and display their profile gallery in both the profile page and sidebar.

### Social Graph

Users can follow and unfollow other users. Follow relationships are stored with a unique database constraint to prevent duplicates and are used to power profile stats and sidebar suggestions.

### Notifications

The app creates notifications when users like posts, comment on posts, or follow another user. Notification counts are surfaced in the navigation and marked as read when the notifications page is visited.

### Messaging

Users can open conversations with other profiles, send direct messages, load message history, and see unread message counts. Message records support text and image-ready structure, with database checks ensuring that a message contains content.

## Project Structure

```txt
app/
  page.tsx                         Main feed route
  profile/[userId]/page.tsx        Public/editable profile route
  messages/page.tsx                Direct messaging route
  notifications/page.tsx           Notifications route
  api/uploads/cloudinary/route.ts  Signed media upload endpoint
  api/messages/[userId]/route.ts   Conversation fetch endpoint

components/
  feed/                            Post composer, post cards, likes, comments
  profile/                         Profile editor and profile display helpers
  sidebar/                         Left/right desktop sidebars and follow button
  chat/                            Inbox, chat tabs, conversation UI
  notifications/                   Notification list UI
  navigation/                      Desktop and mobile navigation
  ui/                              Reusable UI primitives

db/
  schema.ts                        Drizzle schema, relations, indexes, types

lib/
  auth/                            Clerk-to-database user sync
  social/                          Server actions and database queries
  cloudinary.ts                    Cloudinary signing and delete helpers
```

## Data Model

The database is designed around a social product domain:

- `users`: local application profile synchronized from Clerk.
- `posts`: feed content with optional image attachment.
- `profile_photos`: user gallery images with Cloudinary metadata.
- `comments`: comments connected to posts and authors.
- `likes`: unique user-to-post reactions.
- `follows`: unique follower/following relationships.
- `notifications`: like, comment, and follow events.
- `messages`: direct user-to-user messages with read status.

This structure keeps the app normalized and allows the UI to load related data efficiently through Drizzle relations.

## Result

The result is a working full-stack social app that demonstrates:

- End-to-end feature development from database schema to UI.
- Authenticated user flows with protected actions.
- Relational data modeling for real social app behavior.
- Server-side validation and cache revalidation after mutations.
- Responsive, polished UI built around practical user workflows.
- Media handling with secure server-side Cloudinary integration.
