# Valentine Wizard ❤️ (SaaS Edition)

Turn your love story into a digital experience.

## The SaaS Model
This version of the Valentine Wizard includes a tiered structure:

### 🆓 The Spark ($0)
- **Interactive Invitation:** The tapping heart game.
- **1 Day Countdown:** Purely for Feb 14th.
- **3 Secret Notes:** Essential messages.
- **Branding:** "Created with Valentine Wizard" watermark.

### 💖 The Romance ($4.99 One-time)
- **7 Day Countdown:** Start the celebration a week early.
- **Photo Gallery:** Upload your favorite memories.
- **10 Secret Notes:** More space for your words.
- **No Watermark:** A clean, professional look.

### 💎 The Sanctuary ($9.99 One-time)
- **14 Day Journey:** The ultimate countdown.
- **Secret Cinema:** Custom video integration.
- **Unlimited Everything:** No limits on notes or images.
- **Custom Passcodes:** Secure your cinema.

## TikTok Marketing Plan 🚀
1. **Hook:** "Low effort, high reward gift."
2. **Target:** Long distance couples and "forgot a gift" procrastinators.
3. **Sound:** Lo-fi / Trending romantic sounds.
4. **CTA:** "Free to start, link in bio."

## Setup
1. Copy `.env.example` to `.env.local` and add your Stripe keys.
2. **Crucial:** Enable **Vercel Blob** in your Vercel Dashboard (Storage tab) and add the `BLOB_READ_WRITE_TOKEN` to your environment variables. Also add a `SIGNING_SECRET` (any long random string) for secure uploads and payment verification.
3. `npm install`
4. `npm run dev`
