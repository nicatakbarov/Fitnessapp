# FitStart Aplikasiyası — Tam Funksionallik Sənədi

**Sənəd Tarixi:** 3 May 2026  
**Versiya:** 2.0  
**Dil:** Azərbaycan (AZ)

---

## 📑 Mündəricat

1. [Giriş (Landing Page)](#1-giriş)
2. [Qeydiyyat (Register)](#2-qeydiyyat)
3. [Daxil olmaq (Login)](#3-daxil-olmaq)
4. [Onboarding](#4-onboarding)
5. [Plan Seçim Səhifəsi (Browse)](#5-plan-seçim-səhifəsi)
6. [Məşq Planları — 3 Plan Tipi](#6-məşq-planları)
   - 6.1 [Evdə Məşq](#61-evdə-məşq-planı)
   - 6.2 [Zalda Məşq](#62-zalda-məşq-planı)
   - 6.3 [Şəxsi Plan](#63-şəxsi-plan)
7. [Plan Yaratma Sualları (CreateCustomPlanPage)](#7-plan-yaratma-sualları)
8. [AI Generasiya Səhifəsi](#8-ai-generasiya-səhifəsi)
9. [Əsas Dashboard](#9-əsas-dashboard)
10. [Gün-Gün Məşq Səhifəsi](#10-gün-gün-məşq-səhifəsi)
11. [Qida İzləyici (CaloriePage)](#11-qida-izləyici)
12. [AI Coach (AIChatPage)](#12-ai-coach)
13. [Tərəqqi Səhifəsi (Progress)](#13-tərəqqi-səhifəsi)
14. [Aşağı Naviqasyon Bar](#14-aşağı-naviqasyon-bar)

---

## 1. Giriş

**Route:** `/`  
**Fayl:** `frontend/src/pages/LandingPage.jsx`

- İstifadəçi daxil olmuşsa → `/dashboard`
- Onboarding tamamlanmamışsa → `/onboarding`
- Əks halda Landing Page göstərilir: logo, tagline, "Başlayın" düyməsi

---

## 2. Qeydiyyat

**Route:** `/register`  
**Fayl:** `frontend/src/pages/RegisterPage.jsx`

**Sahələr:**
- Ad Soyad
- Email
- Şifrə (güc göstəricisi ilə)
- Şifrəni təkrar et

**Nə olur:**
1. Email format yoxlanılır
2. Şifrə uyğunluğu yoxlanılır
3. `supabase.auth.signUp()` çağırılır
4. User `localStorage`-a yazılır
5. → `/browse` (Plan Seçim Səhifəsi)

---

## 3. Daxil olmaq

**Route:** `/login`  
**Fayl:** `frontend/src/pages/LoginPage.jsx`

**Sahələr:** Email, Şifrə (göstər/gizlət)

**Nə olur:**
1. `supabase.auth.signInWithPassword()` çağırılır
2. User `localStorage`-a yazılır
3. → `/dashboard`

---

## 4. Onboarding

**Route:** `/onboarding`  
**Fayl:** `frontend/src/pages/OnboardingPage.jsx`

3 slayd:
- Slayd 1: "Track Workouts"
- Slayd 2: "Build Your Plan"
- Slayd 3: "See Progress" + Login/Register linkləri

[Skip] və ya [Next] → `/register`

---

## 5. Plan Seçim Səhifəsi

**Route:** `/browse`  
**Fayl:** `frontend/src/pages/BrowseProgramsPage.jsx`

### Dizayn (Claude Design sistemi)

Hər plan tipi ayrı kart:
- Oswald bold başlıq (uppercase)
- Meta sıra: müddət · tezlik · səviyyə
- 4 xüsusiyyət (CheckCircle ilə siyahı)
- CTA düyməsi
- "ƏN POPULYAR" badge (Zalda Məşq-da)
- **İkon yoxdur** (emojilər silinib)

### 3 Plan Tipi Kartları

| Kart | Başlıq | Xüsusiyyətlər | Yönləndirmə |
|------|--------|---------------|-------------|
| Evdə Məşq | 4–8 həftə · 3–5x/həftə · Başlanğıc | Öz avadanlıqların ilə · Bodyweight məşqlər · AI ilə fərdi plan · İstənilən yerdə məşq et | `/home-setup` |
| Zalda Məşq ⭐ | 4–9 həftə · 2–5x/həftə · Hər səviyyə | Barbell, dumbbell, maşınlar · Proqressiv yük artımı · AI ilə fərdi plan · Push/Pull/Legs bölgüsü | `/create-plan` (gym) |
| Şəxsi Plan | Öz müddətin · Öz cədvəlin · Sənin seçimin | Özün hərəkətləri seç · Öz dəst/təkrar sayın · Tam azadlıq · İstədiyin kimi qur | `/personal-plan` |

---

## 6. Məşq Planları

### 6.1 Evdə Məşq Planı

**Tam axın:** `/browse` → `/home-setup` → `/create-plan` → `/generating` → `/dashboard`

#### HomeSetupPage (`/home-setup`)

**Fayl:** `frontend/src/pages/HomeSetupPage.jsx`

**Tək addım — Avadanlıq seçimi:**

```
Evdə hansı avadanlıqlar var?
───────────────────────────────
✅ Bodyweight (həmişə daxil — kilidli)

[Axtar: dumbbells, resistance bands...]

[ Dumbbell          Cardio      ○ ]
[ Kettlebell        Free Weight ○ ]
[ Pull-up bar       Calisthenics ✓ ]
[ Resistance bands  Accessories ✓ ]
... (37 avadanlıq)

── Özün əlavə et ──
[________________] [+ Əlavə et]

── Seçilmiş (3 avadanlıq) ──
[Bodyweight] [Pull-up bar ×] [Bands ×]

[   Davam et →   ]
```

**Texniki detallar:**
- `HOME_EQUIPMENT_KEYS` — 37 avadanlıq açarı (DB-dən filterlənir)
- Kateqoriyalar ingilis dilindədir (EN_CATEGORIES map-i ilə)
- Axtarış: `e.en` və `e.key` sahələri üzrə
- Seçilən DB avadanlıqları: `selectedKeys` state (yaşıl çiplər)
- Əl ilə əlavə edilənlər: `customItems` state (mavi çiplər, X ilə silinir)
- [Davam et] → `fitstart_home_equipment` JSON array-ni localStorage-a yazır → `/create-plan` (state: `{ planType: 'home' }`)

---

### 6.2 Zalda Məşq Planı

**Tam axın:** `/browse` → `/create-plan` (planType:'gym') → `/generating` → `/dashboard`

Avadanlıq seçim mərhələsi yoxdur. Birbaşa CreateCustomPlanPage açılır.

---

### 6.3 Şəxsi Plan

**Tam axın:** `/browse` → `/personal-plan` → `/dashboard`

**Fayl:** `frontend/src/pages/PersonalPlanPage.jsx`

AI yoxdur. Tam manual daxiletmə:
- Addım 1: Plan adı + həftədə neçə gün
- Addım 2: Hər gün üçün məşqlər (ad, dəst, təkrar, çəki)
- [Saxla] → Supabase `custom_plans` + `purchases` → `/dashboard`

---

## 7. Plan Yaratma Sualları

**Route:** `/create-plan`  
**Fayl:** `frontend/src/pages/CreateCustomPlanPage.jsx`  
**İstifadə:** Həm Ev, həm Zal planları üçün

### Ümumi quruluş

- **4 addım** (progress bar yoxdur)
- Hər sualın başlığının üstündə **"X / 3"** yaşıl rəqəm göstəricisi
- Alt naviqasyon: [← Geri] + [Növbəti →] düymələri
- Son addım (Təsdiq): [Proqramı yarat 🚀] düyməsi

### Addım 1 — Məqsəd (1 / 3)

```
Məqsədin nədir?

[ Kütlə artırmaq        ✓ ]  ← seçildikdə yaşıl border + mətn
[ Arıqlamaq               ]
[ Güc artırmaq            ]
[ Ümumi fitness           ]
```

- İkon və emoji yoxdur
- Seçilmiş seçim: `border-green-500`, mətn yaşıl

### Addım 2 — Əzələlər (2 / 3)

```
Hansı əzələlərə fokuslanmaq istəyirsən?

[ Hamısını seç ]

[ Döş      ] [ Çiynlər ]
[ Qollar   ] [ Qarın   ]
[ Ayaqlar  ] [ Kürək   ]
[ Omba              ]
```

- **BodyMap** komponenti: yalnız mətn çipləri (SVG şəkil yoxdur)
- 2 sütunlu grid, 7 əzələ qrupu
- Seçilmiş: yaşıl fon + qalın mətn, seçilməmiş: tünd fon + solğun mətn
- "Hamısını seç" toggle düyməsi

### Addım 3 — Tezlik (3 / 3) ← Son sual

```
Həftədə neçə dəfə məşq?

[ 2x / həftə                              ○ ]
  Light schedule — full body focus
  Mon · Thu

[ 3x / həftə                              ✓ ]  ← default
  Recommended for beginners — balanced split
  Mon · Wed · Fri

[ 4x / həftə                              ○ ]
  Intermediate — upper/lower split
  Mon · Tue · Thu · Fri

[ 5x / həftə                              ○ ]
  Advanced — push/pull/legs split
  Mon · Tue · Wed · Fri · Sat
```

- **Məşq müddəti sualı yoxdur** — AI özü müəyyən edir
- FREQUENCY_DAY_LABELS və FREQUENCY_DESCRIPTIONS istifadə olunur
- Default seçim: 3x

### Addım 4 — Təsdiq

```
Proqramın hazırdır!
Seçimlərini yoxla və proqramı yarat

┌─────────────────────────────┐
│ Məqsəd                      │
│ Kütlə artırmaq              │
│                             │
│ Əzələ qrupları              │
│ [Döş] [Kürək] [Qollar]     │
│                             │
│ Tezlik                      │
│ Həftədə 3 gün               │
│ Mon · Wed · Fri             │
└─────────────────────────────┘

[   Proqramı yarat 🚀   ]
```

---

## 8. AI Generasiya Səhifəsi

**Route:** `/generating`  
**Fayl:** `frontend/src/pages/GeneratingPage.jsx`

### Nə olur

1. `location.state.planConfig` alınır: `{ goal, muscles, daysPerWeek, planType }`
2. Supabase session yoxlanılır/yenilənir
3. Claude AI promptu qurulur:
   - **Zal planı:** bütün gym avadanlıqları
   - **Ev planı:** `localStorage['fitstart_home_equipment']` oxunur, yalnız seçilmiş avadanlıqlar
   - **Müddət daxil edilmir** — AI özü qərar verir
4. `supabase.functions.invoke('ai-chat')` çağırılır
5. JSON cavab parse edilir (`extractJSON()`)
6. Plan `custom_plans` cədvəlinə yazılır
7. `purchases` cədvəlinə yazılır
8. `fitstart_home_equipment` localStorage açarı silinir
9. → `/dashboard`

### UI

```
[FitStart logo]

  ◯ 67%   ← SVG progress ring (yaşıl)

Proqramın Yaradılır
[Plan adı]

✓ Fitness məqsədlərini analiz edirik...
✓ Əzələ qruplarını yoxlayırıq...
⏳ Səviyyənə uyğun məşqlər seçirik...
○ Həftəlik cədvəl qururuq...
○ 4 həftəlik proqressiya yaradırıq...
○ İstirahət günləri hesablayırıq...
○ İsitmə/soyutma əlavə edirik...
○ Proqramın hazırdır!
```

- Xəta olduqda: qırmızı ring + [Yenidən cəhd et] düyməsi
- Uğurlu olduqda: yaşıl ✓ + 0.9 saniyə sonra dashboard-a yönləndirir

---

## 9. Əsas Dashboard

**Route:** `/dashboard`  
**Fayl:** `frontend/src/pages/DashboardPage.jsx`

- Aktiv proqram kartı: gün nömrəsi, [Məşqə Başla]
- 4 sağlamlıq widget: Addımlar · Kalori · Ürək atışı · Çəki
- HealthKit inteqrasiyası (iOS)

---

## 10. Gün-Gün Məşq Səhifəsi

**Route:** `/program/:id/day/:dayId`  
**Fayl:** `frontend/src/pages/DayWorkoutPage.jsx`

Quruluş: **İsitmə** → **Əsas Məşq** → **Soyutma**

- Hər məşq: ad, dəst × təkrar, istirahət, avadanlıq
- Çəki daxiletmə sahəsi
- [Günü Tamamla] → Supabase `progress` cədvəlinə yazır

---

## 11. Qida İzləyici

**Route:** `/calorie`  
**Fayl:** `frontend/src/pages/CaloriePage.jsx`  
**BottomNav Tab:** "Qida" (UtensilsCrossed ikonu)

### Bölmələr

#### Kaloriya Halqası
```
     ◑ 1240 / 2000 kcal
          (62%)

Protein:  45q ▓▓░░  / 150q
Karbohid: 120q ▓░░░ / 250q
Yağ:      28q ▓▓▓░  / 65q
```

#### Yemək Əlavə Et (bottom sheet modal)

**Mətn ilə:**
```
[100q toyuq döşü yazdı]
→ Claude AI cavabı:
  Toyuq Döşü (100q): 165 kcal | P:31 K:0 Y:4
[Əlavə et]
```

**Şəkil ilə:**
```
[@capacitor/camera → foto çəkilir]
→ Claude Vision (calorie-scan edge func):
  Makarna Salat: 320 kcal | P:12 K:35 Y:14
[Əlavə et]
```

#### Bugünkü Qida Loqu
- Hər yemək: ad, kaloriya, makrolar, [× Sil]
- Boş: "Hələ heç nə əlavə edilməyib"

#### 7 Günlük Tarix
- Bar chart, Azərbaycan gün adları (B, Ç, C, Ş...)
- Bugün vurğulanmış

**Supabase cədvəli:** `food_logs`
```sql
create table food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  name text not null,
  calories int not null,
  protein int default 0,
  carbs int default 0,
  fat int default 0,
  created_at timestamptz default now()
);
```

**Edge Function:** `calorie-scan`
- Input: `{ text: "..." }` və ya `{ image: "<base64>", mimeType: "image/jpeg" }`
- Output: `{ name, calories, protein, carbs, fat }`
- Model: `claude-opus-4-5` (Vision dəstəyi üçün)

---

## 12. AI Coach

**Route:** `/nutrition`  
**Fayl:** `frontend/src/pages/AIChatPage.jsx`

> **Qeyd:** BottomNav-dan çıxarılıb. CaloriePage-dən link vasitəsilə əlçatandır.

- Fitness/qida chatbot
- `ai-chat` edge function (Claude Sonnet)
- Proqrama uyğun məsləhətlər
- Söhbət tarixi saxlanır

---

## 13. Tərəqqi Səhifəsi

**Route:** `/progress`  
**Fayl:** `frontend/src/pages/ProgressPage.jsx`  
**BottomNav Tab:** "Progress" (BarChart3 ikonu)

- 7 günlük addım tarixi (HealthKit)
- 7 günlük kalori yanma cədvəli
- Ürək atışı (gündəlik orta + bugünkü)
- Çəki tarixi (6 aylıq, ruler slider)
- Apple Watch məşq idxalı
- Tamamlanma seriyaları
- Son 10 məşq tarixi

---

## 14. Aşağı Naviqasyon Bar

**Fayl:** `frontend/src/components/BottomNav.jsx`

```
┌───────────────────────────────────────┐
│  🏠 Home  💪 Program  🍽️ Qida  📊 Progress │
│  /dash   /my-prog   /cal   /progress  │
└───────────────────────────────────────┘
```

| Tab | İkon (lucide-react) | Aktiv Rəng | Route |
|-----|--------------------|-----------:|-------|
| Home | LayoutDashboard | #22c55e | /dashboard |
| Program | Dumbbell | #22c55e | /my-programs |
| Qida | UtensilsCrossed | #22c55e | /calorie |
| Progress | BarChart3 | #22c55e | /progress |

**Pasiv tab:** `rgba(255,255,255,0.35)`  
**Aktiv tab:** `#22c55e`, font-weight 600  
**Arxa plan:** `rgba(15,15,15,0.95)` + 16px blur

> **AI Coach** tabi **silinib**. `/nutrition` route qalır lakin naviqasiyada göstərilmir.

---

## 🔄 Tam İstifadəçi Axını

### Yeni İstifadəçi — Ev Planı Seçir

```
1. /register → hesab yaradılır
2. /browse → "Evdə Məşq" kartına basır
3. /home-setup → avadanlıqları seçir (məs. dumbbells, bands)
               → "Özün əlavə et" ilə "TRX" əlavə edir
               → [Davam et]
4. /create-plan (home)
   → Addım 1: "Kütlə artırmaq" seçir  (1/3)
   → Addım 2: Döş + Kürək + Qollar seçir  (2/3)
   → Addım 3: "3x / həftə" seçir  (3/3) ← son sual
   → Addım 4: Təsdiq → [Proqramı yarat 🚀]
5. /generating → AI plan yaradır (avadanlığa uyğun, müddəti özü seçir)
6. /dashboard → plan hazırdır, [Məşqə Başla]
```

### Gündəlik İstifadə

```
/dashboard → bugünkü məşqə başla
/program/:id/day/:dayId → məşqi tamamla
/calorie → yeməyi əlavə et (foto çək və ya yaz)
/progress → tərəqqini izlə
```

---

## ✅ Xülasə Cədvəli

| Xüsusiyyət | Status | Qeyd |
|-----------|--------|------|
| Qeydiyyat & Login | ✅ | Supabase Auth |
| Browse/Plan seçimi | ✅ | 3 kart, Claude Design |
| Ev avadanlıq seçimi | ✅ | 37 seçim + manual əlavə |
| AI plan yaratma | ✅ | Ev + Zal (Claude API) |
| Şəxsi manual plan | ✅ | AI yox, tam azad |
| Məşq izləmə | ✅ | Gün-gün, set checkboxları |
| Qida izləmə | ✅ | Foto/mətn + AI Vision |
| Tərəqqi analitika | ✅ | HealthKit, 7-gün chart |
| BottomNav (4 tab) | ✅ | AI Coach tabi silinib |
| BodyMap (mətn chip) | ✅ | SVG yox, yalnız mətn |
| Addım sayacı | ✅ | "X / 3" (progress bar yox) |
| Müddət sualı | ❌ | Silinib — AI özü seçir |

---

**Hazırlayan:** FitStart Development  
**Tarix:** 3 May 2026  
**Versiya:** 2.0
