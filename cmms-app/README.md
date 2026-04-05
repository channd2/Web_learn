# 🔧 Home CMMS — Personal Maintenance Management System

A modern, mobile-friendly CMMS application to manage your home equipment maintenance.

**Features:**
- 📦 Asset management with meter readings, photos, documents
- 📋 Preventive maintenance (time-based + meter-based)
- 🔧 Work orders (PM-generated + ad-hoc)
- 💰 Parts tracking with costs
- 📊 Dashboard with KPIs
- 🔐 Single-user authentication
- 📱 Mobile-responsive design

---

## 🚀 Hosting Setup (Free)

### Step 1: Create Supabase Project (Database + Storage)

1. Go to https://supabase.com and create a free account
2. Click **New Project** and choose a name and password
3. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → click **Run**
4. Go to **Settings → API** and note your credentials:
   - **Project URL** → NEXT_PUBLIC_SUPABASE_URL
   - **anon public key** → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - **service_role secret** → SUPABASE_SERVICE_ROLE_KEY

### Step 2: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial Home CMMS"
git remote add origin https://github.com/YOUR_USERNAME/home-cmms.git
git push -u origin main
```

### Step 3: Deploy to Vercel (Free)

1. Go to https://vercel.com and sign up with GitHub
2. Click **Add New Project** → import your GitHub repo
3. Add these Environment Variables:

| Variable | Value |
|----------|-------|
| NEXT_PUBLIC_SUPABASE_URL | Your Supabase Project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Your anon public key |
| SUPABASE_SERVICE_ROLE_KEY | Your service_role secret key |
| ADMIN_USERNAME | Your login username |
| ADMIN_PASSWORD | Your login password |
| JWT_SECRET | Random 32+ char string (run: openssl rand -base64 32) |

4. Click **Deploy** — you'll get a URL like https://home-cmms.vercel.app

---

## 💻 Local Development

```bash
cd cmms-app
npm install
cp .env.local.example .env.local
# Fill in your values in .env.local
npm run dev
# Open http://localhost:3000
```

---

## 📱 How to Use

**Assets**: Register equipment with asset number, name, km reading, date of birth, and photo.

**PM Schedules**: Set up time-based (every X days) or meter-based (every X km) maintenance. Progress bar shows how close the next PM is.

**Work Orders**: 
- Generate from a PM with one click ⚡
- Or create ad-hoc for repairs
- Add parts and costs
- When complete, PM automatically resets

---

## 🏗️ Tech Stack

- Frontend: Next.js 16 + Tailwind CSS  
- Database: Supabase (PostgreSQL)
- Auth: JWT cookies
- Hosting: Vercel + Supabase (both FREE)

---

## 🔒 Security

- Change ADMIN_USERNAME and ADMIN_PASSWORD from defaults before deploying
- Generate a strong JWT_SECRET: `openssl rand -base64 32`
- SUPABASE_SERVICE_ROLE_KEY is only used server-side, never exposed to browser
