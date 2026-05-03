# FitStart App — Complete Documentation

**Version:** May 2026  
**Comprehensive Feature Guide & User Journey**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Journey: Auth Flow](#user-journey-auth-flow)
3. [Bottom Navigation (4 Tabs)](#bottom-navigation-4-tabs)
4. [Three Plan Types](#three-plan-types)
5. [All Pages](#all-pages)
6. [Key Features](#key-features)

---

## Overview

**FitStart** is a comprehensive fitness app that combines:
- ✅ Custom workout plan generation (Gym, Home, Personal)
- ✅ Real-time progress tracking (steps, calories, heart rate, weight)
- ✅ AI-powered nutrition coaching & food logging
- ✅ Apple HealthKit integration
- ✅ Interactive exercise library with GIFs

**Tech Stack:** React, Capacitor (iOS), Supabase, Claude AI

---

## User Journey: Auth Flow

### Step-by-Step User Experience

```
┌─────────────────────────────────────────────────────────┐
│  1️⃣  APP LOADS                                          │
│  • RootRedirect checks localStorage['user']             │
│  • If user exists → jump to Dashboard ✓                 │
│  • If no user → continue to step 2                      │
└─────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  2️⃣  CHECK ONBOARDING STATUS                           │
│  • localStorage['onboarding_done'] flag                 │
│  • If FALSE → show 3-slide Onboarding carousel          │
│  • Can skip onboarding (skip button)                    │
│  • If TRUE → go to Landing page                         │
└─────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  3️⃣  ONBOARDING PAGE (/onboarding)                      │
│  Slide 1: "Track Workouts"                             │
│  Slide 2: "Build Your Plan"                            │
│  Slide 3: "See Progress" + Login/Register links        │
│                                                          │
│  Actions:                                               │
│  • [Skip] → goes to /register                           │
│  • [Next] on last slide → /register                    │
│  • [Log in] → /login                                    │
└─────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  4️⃣  REGISTER or LOGIN                                  │
│                                                          │
│  REGISTER PAGE (/register)                              │
│  • Full name input                                      │
│  • Email input                                          │
│  • Password input (with strength indicator)             │
│  • Confirm password                                     │
│  • Validation: email format, passwords match            │
│  • Supabase auth.signUp() call                         │
│  • Save user to localStorage                            │
│  → Routes to /browse (Browse Programs)                  │
│                                                          │
│  OR LOG IN PAGE (/login)                               │
│  • Email input                                          │
│  • Password input                                       │
│  • Show/hide password toggle                            │
│  • Supabase auth.signInWithPassword() call             │
│  • Save user to localStorage                            │
│  → Routes to /dashboard (Dashboard)                     │
└─────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  5️⃣  BROWSE PROGRAMS PAGE (/browse)                    │
│  Three plan type cards:                                 │
│  • Evdə Məşq  → /home-setup                            │
│  • Zalda Məşq → /create-plan (planType: 'gym')         │
│  • Şəxsi Plan → /personal-plan                         │
│                                                          │
│  Card design (Claude Design system):                    │
│  • Oswald bold title, meta row (duration/freq/level)   │
│  • Feature checklist (4 items per card)                │
│  • "ƏN POPULYAR" badge on Zalda Məşq                   │
│  • CTA button per card                                  │
└─────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  6️⃣  PLAN SETUP                                         │
│                                                          │
│  HOME FLOW:                                             │
│  /home-setup → /create-plan (home) → /generating       │
│                                                          │
│  GYM FLOW:                                              │
│  /create-plan (gym) → /generating                       │
│                                                          │
│  PERSONAL FLOW:                                         │
│  /personal-plan (manual entry) → /dashboard            │
└─────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  7️⃣  GENERATION PAGE (/generating) [Home & Gym only]    │
│  • 8-step animated progress ring                        │
│  • Claude AI generates 4-week JSON plan                 │
│  • Saves to Supabase custom_plans + purchases           │
│  → /dashboard                                            │
└─────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  8️⃣  DASHBOARD (/dashboard) ✅                          │
│  • Active program card with [Start] button              │
│  • Today's health stats (4 widgets)                     │
│  • BottomNav ENABLED (4 tabs)                           │
└─────────────────────────────────────────────────────────┘
```

---

## Bottom Navigation (4 Tabs)

Fixed footer navigation bar shown on all authenticated pages.

### Tab Structure

| # | Icon | Label | Route | Purpose |
|---|------|-------|-------|---------|
| 1 | LayoutDashboard | **Home** | `/dashboard` | Active program, health stats |
| 2 | Dumbbell | **Program** | `/my-programs` | All programs, progress bars |
| 3 | UtensilsCrossed | **Qida** | `/calorie` | Food log, calorie ring, macros |
| 4 | BarChart3 | **Progress** | `/progress` | Charts, weight, Apple Watch |

> **Note:** "AI Coach" tab has been removed. AIChatPage (/nutrition) is still accessible via links inside CaloriePage but is not in the bottom nav.

### Navigation Behavior

- Active tab: Green color (#22c55e), bold label
- Inactive tabs: rgba(255,255,255,0.35), normal weight
- No BottomNav on auth pages (Landing, Onboarding, Login, Register, BrowsePrograms, HomeSetup, CreateCustomPlan, Generating)

---

## Three Plan Types

### 1️⃣  GYM PLANS (type: 'gym')

**Flow:** /browse → /create-plan (planType:'gym') → /generating  
**AI generates:** 4-week program using all gym equipment (barbell, dumbbell, machines, cables)

**CreateCustomPlanPage steps for Gym:**
1. Goal (Muscle / Fat Loss / Strength / General)
2. Muscle groups (BodyMap chip grid — 7 groups, text only)
3. Frequency: how many days/week (2/3/4/5x — last question)
4. Confirm → Generate

---

### 2️⃣  HOME PLANS (type: 'home')

**Flow:** /browse → /home-setup → /create-plan (planType:'home') → /generating

**HomeSetupPage (equipment selection only):**
- Bodyweight always included (locked chip)
- Search bar to filter 37 equipment options
- Equipment list grouped by category (Cardio, Free Weights, Calisthenics, Functional, Flexibility, Accessories)
- Manual "Özün əlavə et" section: text input + Add button
- Selected items shown as chips (green = DB item, blue = custom)
- Equipment saved to `localStorage['fitstart_home_equipment']`
- [Davam et] → /create-plan with planType:'home'

**CreateCustomPlanPage steps for Home (same 4 steps as Gym):**
1. Goal
2. Muscle groups
3. Frequency (days/week — last question)
4. Confirm → Generate

**GeneratingPage home behavior:**
- Reads `fitstart_home_equipment` from localStorage
- Includes equipment list in Claude AI prompt
- "Yalnız bu avadanlıqlarla edilə bilən məşqlər seç. Gym aparatları istifadə etmə."
- Cleans up `fitstart_home_equipment` after save

---

### 3️⃣  PERSONAL PLANS (type: 'personal')

**Flow:** /browse → /personal-plan (manual entry, no AI)

**PersonalPlanPage:**
- Step 1: Plan name + days per week
- Step 2: Add exercises per day (name, sets, reps, weight)
- Save → Supabase custom_plans + purchases

---

## All Pages

### Pre-Auth Pages

#### 1️⃣  **LandingPage** (`/`)
- Welcome & feature showcase
- [Get Started] → `/register`

#### 2️⃣  **OnboardingPage** (`/onboarding`)
- 3-slide app introduction
- [Skip] or [Next] → `/register`

#### 3️⃣  **RegisterPage** (`/register`)
- Full Name, Email, Password, Confirm Password
- Supabase auth.signUp()
- → `/browse`

#### 4️⃣  **LoginPage** (`/login`)
- Email, Password
- Supabase auth.signInWithPassword()
- → `/dashboard`

---

### Authenticated Pages

#### 5️⃣  **DashboardPage** (`/dashboard`)
- Active program card + [Start Day] button
- 4 health stat widgets (steps, calories, heart rate, weight)
- HealthKit integration

#### 6️⃣  **MyProgramsPage** (`/my-programs`)
- List of purchased programs with progress bars
- [Play] → workout day

#### 7️⃣  **BrowseProgramsPage** (`/browse`)
- Three plan type cards with Claude Design system
- No emoji icons on cards
- Features: duration, frequency, level, 4-item checklist, CTA
- "ƏN POPULYAR" badge on Zalda Məşq
- "Evdə Məşq" features: "Öz avadanlıqların ilə", "Bodyweight məşqlər", "AI ilə fərdi plan", "İstənilən yerdə məşq et"
- Home → /home-setup | Gym → /create-plan | Personal → /personal-plan

#### 8️⃣  **ProgramDetailPage** (`/program/:id`)
- Full program overview, week/day breakdown
- Progress bar, [Start Day 1]

#### 9️⃣  **DayWorkoutPage** (`/program/:id/day/:dayId`)
- Warmup → Main Workout → Cooldown
- Set checkboxes, weight input
- Mark Complete → saves to Supabase progress table

#### 🔟  **HomeSetupPage** (`/home-setup`)
- Single step: equipment selection
- 37 equipment options from EQUIPMENT_DB (filtered to HOME_EQUIPMENT_KEYS)
- Search/filter, category labels in English
- Bodyweight always selected (locked)
- Custom manual equipment entry ("Özün əlavə et" section)
- Selected chips: DB items (green), custom items (blue with X)
- Saves `fitstart_home_equipment` to localStorage
- → /create-plan with state { planType: 'home' }

#### 1️⃣1️⃣  **CreateCustomPlanPage** (`/create-plan`)
- Works for both 'home' and 'gym' planType (passed via location.state)
- **4 steps, no progress bar — step counter "X / 3" shown above heading**
- Step 1: Goal (4 options, text only, no icons/emojis on buttons, green border when selected)
- Step 2: Muscle groups (BodyMap text chip grid, "Hamısını seç" toggle)
- Step 3: Frequency (2/3/4/5x per week, full-width cards with day labels & description — **last question**)
- Step 4: Confirm summary (goal, muscles, frequency) + [Proqramı yarat 🚀]
- No workout duration question — AI decides automatically

#### 1️⃣2️⃣  **PersonalPlanPage** (`/personal-plan`)
- Manual custom plan builder (no AI)
- Step 1: Plan name + days per week
- Step 2: Exercises per day (name, sets, reps, weight per exercise)
- Save → Supabase custom_plans + purchases → /dashboard

#### 1️⃣3️⃣  **GeneratingPage** (`/generating`)
- AI generation progress UI
- 8-step animated progress ring (0→100%)
- Calls Supabase Edge Function `ai-chat` with Claude-built prompt
- For home plans: reads equipment from `fitstart_home_equipment` localStorage key
- Prompt does NOT include workout duration — AI decides based on goal + frequency
- Saves plan to `custom_plans` + `purchases` tables
- Cleans up `fitstart_home_equipment` from localStorage after save
- Error state with [Yenidən cəhd et] retry button
- → /dashboard on success

#### 1️⃣4️⃣  **CaloriePage** (`/calorie`)
- Food intake & calorie tracking
- Calorie ring widget (SVG, intake vs 2000 kcal goal)
- 3 macro bars (Protein / Carbs / Fat)
- [+ Yemək Əlavə Et] opens bottom sheet:
  - 📷 Photo scan → Capacitor Camera → Claude Vision AI (`calorie-scan` edge function)
  - ✏️ Text entry → Claude AI estimation
  - Result shows name/calories/macros → [Əlavə et] → Supabase food_logs
- Today's food log list with delete buttons
- 7-day calorie bar chart (Azerbaijani day labels)
- Data: Supabase `food_logs` table

#### 1️⃣5️⃣  **AIChatPage** (`/nutrition`)
- AI fitness chatbot (not in BottomNav, accessible via link)
- Suggested prompts, chat interface
- Calls `ai-chat` edge function (Claude Sonnet)
- Program-aware responses
- Chat history persisted

---

## Key Features

### 🎨 Design System
- **Colors:** #0f0f0f bg, #18181b cards, #22c55e primary green, #27272a borders
- **Typography:** Oswald (headings, uppercase), Inter (body)
- **Cards:** Rounded-2xl, zinc-900 bg, zinc-800 borders
- **Buttons:** Rounded-full CTAs, rounded-xl secondary
- **No emoji icons** in plan type cards
- Step counter "X / 3" instead of progress bar in CreateCustomPlanPage

### 💪 Workout Plans
- 3 plan types: Gym (AI), Home (equipment-aware AI), Personal (manual)
- 4-step builder: Goal → Muscles → Frequency → Confirm
- No duration question — AI determines appropriate workout length
- Home equipment: 37 options + custom manual entry
- Progressive 4-week AI-generated programs

### 📱 BottomNav
- 4 tabs: Home, Program, Qida, Progress
- AI Coach removed from nav (still accessible via /nutrition)

### 🍽️ Nutrition
- Photo + text food logging with Claude Vision
- Calorie ring + macro breakdown
- 7-day history chart
- Supabase food_logs with RLS

### 📊 Progress
- HealthKit: steps, calories, heart rate, weight
- Apple Watch workout import
- 7-day charts, weight ruler

### 💾 Data
- Supabase tables: purchases, progress, custom_plans, food_logs, ai_chat_history
- Edge functions: ai-chat, calorie-scan
- localStorage: user, fitstart_home_equipment (temporary, cleaned after generate)

---

**Built with:** React | Capacitor (iOS) | Supabase | Claude AI | HealthKit  
**Language:** Azerbaijani (primary) + English  
**Status:** Production-ready  
**Last Updated:** May 2026
