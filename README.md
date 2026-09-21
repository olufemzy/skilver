# VeriHire

Verified skills/service marketplace. Next.js 14 (App Router) + TypeScript +
Tailwind CSS + Prisma (PostgreSQL) + NextAuth.

This is a staged build. This first drop is the **foundation + landing page**
(spec section 1). Everything else in the MVP phase-1 list gets built in the
same pattern, in the following sessions, on top of this base.

## Folder structure (current)

```
verihire/
├── prisma/
│   ├── schema.prisma        # full data model — sections 3-29 of the spec
│   └── seed.ts               # seeds categories, skills, universities
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx        # root layout, fonts, navbar/footer shell
│   │   ├── page.tsx           # landing page (section 1)
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   └── footer.tsx
│   │   ├── landing/
│   │   │   ├── hero.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── category-grid.tsx     # reads live categories from DB
│   │   │   ├── trust-section.tsx
│   │   │   └── cta-section.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── badge.tsx             # includes <VerifiedBadge />
│   │       └── search-bar.tsx
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config, password hashing
│   │   └── utils.ts           # cn(), formatNaira(), calculateCommission()
│   ├── types/
│   │   ├── index.ts           # shared view-model types, category groups
│   │   └── next-auth.d.ts     # session typing (id, role)
│   └── middleware.ts          # role-gates /admin, /dashboard/provider, /dashboard/customer
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── .env.example
```

## Design system

The visual language is built around the platform's actual trust mechanic —
verification — rather than generic SaaS styling: a paper background, a deep
teal-forest primary (`#1F3D3A`), and a muted "stamp gold" (`#C89B3C`) used
sparingly for verified badges and financial callouts. Display type is
Fraunces (serif), body is Inter. All tokens live in `tailwind.config.ts`.

## Database model

`prisma/schema.prisma` already models the full spec, not just what's wired
up to a page yet — `Role`, `ProviderProfile` (extensible to `ProviderType.ARTISAN`
for phase-2 trades onboarding), `VerificationStatus`, `CustomerProfile`,
`Category`/`Skill`, `Service`, `Job`/`Application`, `Contract`, `Submission`,
`Transaction` (commission math), `Review`, `PortfolioItem`, `Conversation`/`Message`,
`Notification`, `Dispute`, `Report`. This means later features are additive —
no schema rewrites as we go.

## Setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL and NEXTAUTH_SECRET
npx prisma db push        # create tables from schema.prisma
npx prisma db seed        # seed categories, skills, universities
npm run dev
```

`NEXTAUTH_SECRET` can be generated with `openssl rand -base64 32`.

You'll need a Postgres database — a free one from
[Neon](https://neon.tech) or [Supabase](https://supabase.com) works for
local development.

## What's next (in build order, matching the spec's own MVP priority list)

1. **Auth & registration** — student/provider signup (photo, university,
   faculty, matric no., skills), customer signup (individual/business),
   login, email verification.
2. **Student verification flow** — document upload, pending/verified/rejected
   states, admin review queue.
3. **Provider profile page** — public profile, portfolio, skills, rate,
   availability, reviews (section 5).
4. **Search & filters** — category/skill/location/price/rating/verified
   filters (sections 7-8).
5. **Customer dashboard, job posting, service listings** (sections 10-12).
6. **Applications, hiring, messaging** (sections 13-16).
7. **Transaction/commission screens + job status lifecycle** (sections 17-20).
8. **Reviews, work history, notifications** (sections 21-25).
9. **Admin dashboard** — users, verification queue, jobs, transactions,
   categories, disputes, analytics (sections 26-29).
10. **AI matching** — job↔provider recommendation, profile assistant, job
    description assistant, moderation flagging (section 30).

Nothing here is placeholder-only: each page that's shipped is meant to be
clicked through end to end, per your note about not wanting a static-looking
demo.
