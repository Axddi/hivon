# 📝 Hivon Blog Platform

A full-stack blog application with authentication, role-based access, and AI-powered summaries.

---

## 🚀 Live Demo
👉 https://hivon-lime.vercel.app/


## ✨ Features

- 🔐 Authentication (Login / Signup)
- 👤 Role-based access (User / Admin)
- 📝 Create, Edit, Delete posts
- 📰 Feed-style homepage (like Twitter)
- 💬 Comments system
- 🤖 AI-generated summaries (stored in DB)
- 🖼️ Image support in posts

---

## 🧠 AI Integration

- AI summaries are generated using an external API
- Summaries are created **only once during post creation**
- Stored in database to avoid repeated API calls

---

## 🏗️ Tech Stack

- **Frontend:** Next.js (App Router), React
- **Backend:** Supabase (Auth + Database)
- **Database:** PostgreSQL (via Supabase)
- **AI:** External LLM API (Gemini / Groq / etc.)
- **Deployment:** Vercel

---

## 🗄️ Database Schema

### users
- id (uuid)
- email (text)
- role (text)

### posts
- id (uuid)
- title (text)
- body (text)
- summary (text)
- image_url (text)
- author_id (uuid)

### comments
- id (uuid)
- content (text)
- post_id (uuid)
- user_id (uuid)

---

## 🔐 Role-Based Access

| Role  | Permissions |
|-------|-----------|
| User  | Create, comment |
| Admin | Create, edit, delete any post |
| Viewer | Read-only |

---

## ⚙️ Setup Instructions

```bash
git clone <repo>
cd project
npm install
npm run dev