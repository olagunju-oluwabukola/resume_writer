# ResumeRX - Integration Guide

This guide explains how to set up the optional backend and AI features for ResumeRX.

## Features Overview

### ✅ Currently Working (No Setup Required)
- **Dashboard** with stats and mock data
- **AI Resume Analysis** with mock recommendations (works without API key)
- **All Pages** - My Resumes, Cover Letters, Applications, Job Tracker, Analytics, Settings
- **Responsive Design** - Works on desktop, tablet, and mobile

### 🔧 Optional Integrations (Free Tier Available)

## Option 1: AI Resume Analysis (Recommended First)

### Using Groq API (Free Tier)

Groq provides free access to powerful AI models. The application already has Groq integration built-in!

#### Setup Steps:

1. **Get Free API Key**
   - Go to https://console.groq.com
   - Sign up (free account)
   - Create an API key
   - Copy the key

2. **Add to Project**
   - In the Manus UI, go to Settings → Secrets
   - Add new secret: `VITE_GROQ_API_KEY`
   - Paste your Groq API key
   - Save

3. **Test It**
   - Go to Dashboard
   - Click "AI Tailor My Resume" button
   - The AI will analyze your resume against the job description

#### What It Does
- Analyzes resume against job descriptions
- Provides match score (0-100%)
- Recommends what to keep, modify, or remove
- Generates personalized cover letters

#### Free Tier Limits
- 30 requests per minute
- Sufficient for personal use
- No credit card required

---

## Option 2: Backend & Data Persistence (Optional)

### Using Supabase (Free Tier)

Supabase provides a free PostgreSQL database with real-time capabilities.

#### Setup Steps:

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up (free tier available)
   - Create a new project
   - Wait for project to initialize

2. **Get API Keys**
   - In Supabase dashboard, go to Settings → API
   - Copy: `Project URL` and `anon public key`

3. **Add to Project**
   - In Manus UI, go to Settings → Secrets
   - Add: `VITE_SUPABASE_URL` = Project URL
   - Add: `VITE_SUPABASE_ANON_KEY` = anon public key
   - Save

4. **Create Database Tables** (Optional)
   - In Supabase SQL Editor, run:

```sql
-- Resumes table
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  content TEXT,
  status TEXT DEFAULT 'ready',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cover Letters table
CREATE TABLE cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Job Applications table
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  date_applied DATE NOT NULL,
  status TEXT DEFAULT 'applied',
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
```

#### What It Does
- Saves your data persistently
- Syncs across devices
- Real-time updates
- Secure authentication

#### Free Tier Limits
- 500 MB database
- 2 GB bandwidth/month
- Sufficient for personal use

---

## Quick Start (No Setup Required)

The application works **immediately** without any setup:

1. **Install & Run**
   ```bash
   cd resumerx
   pnpm install
   pnpm run dev
   ```

2. **Use Mock Data**
   - All features work with sample data
   - AI analysis uses intelligent fallback
   - Perfect for testing

3. **Add API Keys Later**
   - No rush to set up integrations
   - Add keys anytime via Manus Settings
   - Changes take effect immediately

---

## Environment Variables Reference

```
VITE_SUPABASE_URL          - Your Supabase project URL
VITE_SUPABASE_ANON_KEY     - Supabase anonymous key
VITE_GROQ_API_KEY          - Groq API key for AI analysis
```

---

## Troubleshooting

### AI Analysis Not Working
- Check if `VITE_GROQ_API_KEY` is set correctly
- Verify API key is active at https://console.groq.com
- Check browser console for errors
- Fallback to mock analysis works automatically

### Supabase Connection Issues
- Verify URL and key are correct
- Check Supabase project is active
- Ensure RLS policies are set up
- Application continues to work with mock data

### Rate Limiting
- Groq: 30 requests/minute
- Supabase: Free tier has generous limits
- Contact support if you hit limits

---

## Cost Analysis

| Service | Free Tier | Cost |
|---------|-----------|------|
| Groq AI | 30 req/min | Free |
| Supabase | 500MB DB | Free |
| ResumeRX | All features | Free |
| **Total** | **Full app** | **$0** |

---

## Next Steps

1. **Start Using** - The app works right now with mock data
2. **Add Groq** (5 min) - Get real AI analysis
3. **Add Supabase** (10 min) - Persistent data storage
4. **Deploy** - Share with friends!

---

## Support

- **Groq Docs**: https://console.groq.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **ResumeRX Issues**: Check browser console for errors

Enjoy building your career toolkit! 🚀
