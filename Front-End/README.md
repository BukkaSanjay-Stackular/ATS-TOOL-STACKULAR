# Stackular ATS — Front-End

Internal Applicant Tracking System built with React 19, TypeScript, and Vite. For internal use only.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 (strict mode) |
| Build tool | Vite 8 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Compiler | React Compiler (babel-plugin-react-compiler) |
| Linting | ESLint 9 + typescript-eslint |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type-check + production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## Project Structure

```
Front-End/
├── src/
│   ├── assets/              # Static assets (SVG logo, etc.)
│   ├── components/
│   │   ├── layout/
│   │   │   └── RecruitmentLayout.tsx   # Sidebar + outlet for recruitment panel
│   │   └── ProtectedRoute.tsx          # Role-based route guard
│   ├── context/
│   │   ├── AuthContext.tsx  # Auth provider, user list, login/logout
│   │   └── useAuth.ts       # useAuth() hook
│   ├── pages/
│   │   ├── LoginPage.tsx              # Login + panel selection + login animation
│   │   ├── recruitment/
│   │   │   ├── JobPostingPage.tsx     # JD generation page
│   │   │   └── DashboardPage.tsx      # Recruitment dashboard
│   │   └── interviewer/
│   │       └── InterviewerDashboard.tsx
│   ├── services/
│   │   └── jdService.ts     # Job description generation logic
│   ├── types/
│   │   └── index.ts         # Shared TypeScript types
│   ├── App.tsx              # Route definitions
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles + animation keyframes
├── package.json
├── tsconfig.app.json
└── vite.config.ts
```

---

## Routing

| Path | Component | Access |
|---|---|---|
| `/login` | `LoginPage` | Public |
| `/recruitment` | Redirects to `/recruitment/job-posting` | `recruitment` role |
| `/recruitment/job-posting` | `JobPostingPage` | `recruitment` role |
| `/recruitment/dashboard` | `DashboardPage` | `recruitment` role |
| `/interviewer/dashboard` | `InterviewerDashboard` | `interviewer` role |
| `*` | Redirects to `/login` | — |

All `/recruitment/*` and `/interviewer/*` routes are wrapped in `ProtectedRoute`, which checks the authenticated user's role and redirects to `/login` if unauthenticated or unauthorised.

---

## Authentication

Auth is client-side only — no backend. User credentials are stored in `AuthContext.tsx`. Session is persisted to `localStorage` under the key `ats_user`.

### User Accounts

| Username | Role |
|---|---|
| Amulya | Recruitment |
| Sai Kalyan | Recruitment |
| Venkat | Recruitment |
| Karthik | Interviewer |
| Fardeen | Interviewer |
| Jay | Interviewer |
| Nadem | Interviewer |

Passwords are defined in `src/context/AuthContext.tsx`.

### Login Flow

1. User selects a panel (Recruitment or Interviewer) on the panel picker screen.
2. User enters credentials and clicks **Sign In**.
3. `AuthContext.login()` matches username + password + role against the user list (case-insensitive username match).
4. On success, the login animation plays (~3s), then navigates to the appropriate dashboard.
5. On failure, an inline error is shown and the form remains active.

Clicking outside the login card collapses it back to the panel picker and clears the entered credentials.

---

## Login Animation

Triggered on successful authentication. No animation libraries — pure CSS transitions and keyframes.

| Time | Event |
|---|---|
| 0ms | Card fades and scales out (`card-collapse` keyframe) |
| 80ms | Stackular logo lifts from the header and flies to viewport center (spring easing) |
| 900ms | Time-of-day greeting appears below the logo — "Good morning/afternoon/evening, {username} 😊" |
| 2300ms | Greeting fades out; logo shrinks and flies to the top-left corner (sidebar logo position) |
| 2980ms | `navigate()` fires to the dashboard route |

Keyframes are defined in `src/index.css`: `card-collapse`, `greeting-in`, `greeting-out`.

---

## Design System

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0c0c0c` | Page background |
| `--color-surface` | `#161719` | Cards, panels |
| `--color-surface-2` | `#1a1d20` | Inputs, toggle bars |
| `--color-border` | `#37373f` | Borders, dividers |
| `--color-accent` | `#1d2ba4` | Primary blue — buttons, active states |
| `--color-accent-hover` | `#12219e` | Button hover |
| `--color-text` | `#ffffff` | Primary text |
| `--color-text-muted` | `#9ca3af` | Secondary / placeholder text |
| `--font-primary` | Sora, sans-serif | All text |

---

## Types

Defined in `src/types/index.ts`:

```ts
UserRole        — 'recruitment' | 'interviewer'
User            — id, username, role, name
HireType        — 'fresher' | 'experienced'
FresherJobForm  — jobTitle, requiredSkills
ExperiencedJobForm — extends FresherJobForm + experience
GeneratedJD     — jobTitle, content
```
