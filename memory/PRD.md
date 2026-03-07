# FitStart - Fitness Web Application PRD

## Original Problem Statement
Build a fitness web application called "FitStart" with React.js/Tailwind CSS frontend and FastAPI/MongoDB backend.

## User Personas
- **Primary**: Fitness beginners with no gym experience looking for structured workout programs
- **Secondary**: Casual fitness enthusiasts seeking beginner-friendly routines

## Core Requirements (Phase 1 - Static)
- Landing page with conversion-focused design
- User authentication (register/login with JWT)
- Dark theme (#0f0f0f) with green accents (#22c55e)
- Mobile-responsive design

## What's Been Implemented (Jan 2026)
- [x] Landing Page with all sections: Navbar, Hero, How It Works, Programs, Testimonials, FAQ, Footer
- [x] 3 Program pricing cards ($19 Starter, $39 Transformer, $59 Elite)
- [x] Login page with email/password auth
- [x] Register page with validation
- [x] Backend auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- [x] JWT token-based authentication
- [x] MongoDB user storage
- [x] Google OAuth buttons (UI-only placeholders)
- [x] Responsive design with Oswald/Inter fonts

## Prioritized Backlog

### P0 - Critical (Next Phase)
- [ ] User dashboard after login
- [ ] Program purchase flow (Stripe integration)
- [ ] Functional Google OAuth

### P1 - Important
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Workout program content

### P2 - Nice to Have
- [ ] Progress tracking
- [ ] User profile editing
- [ ] Admin dashboard

## Technical Stack
- Frontend: React 19, Tailwind CSS, Shadcn/UI, Lucide React
- Backend: FastAPI, Motor (MongoDB async), JWT, bcrypt
- Database: MongoDB

## Next Tasks
1. Implement Stripe checkout for program purchases
2. Build user dashboard to show purchased programs
3. Add functional Google OAuth
