# School Management System (ScMS) v1

ScMS is a all-in-one system to manage the operations, events, notices, users, attendance, transportation, courses, classroom, and clubs.

## Overview

[DEMO]()

## Pictures


---

### Routes 

The current version have: 

1. Landing Page (/) with three sections; Hero, Overview, and Footer,
2. About Page (/about) with one sentence of information related to the school, 
3. Contact Page (/contact) with two ways to contact (DUMMY),
4. Signup Page (/signup) with name and email field to generate a invite link (In the next version, except for the server fn, /signup route won't be a thing since invites will be managed by the Admins),
5. Activate Page (/activate/:token) with validation and activation of the account logic, and 
6. Login Page (/login) with working login functionality.

## Introduction & Till What I reached

ScMS started as a highly ambitious project, due to the time constraint, and my academics; needs to seriously compromise on the probable greatness of the project while still making sure the started features were completed without any stone unturned. 

## What is Completed?

- Modular Architecture (Data consuming logic, Static and Dynamic Data distinction (Json vs Zustand))
- Schema, Seed, and Docker Config
- User Signup/Activate/Login flow (with working prototype)
- Landing Page (With Hero, Overview and Footer)
- Sidebar (With Proper Layout, Collapsing Logic)
...many more

## What is Incomplete? (or, What is left?)

- Admin driven Invitation Flow
- Proper Layout and Content in About, Contact Page (Incl. Onboarding Page's UI)
- Proper Content and Ultimate features like; Club, Events, Notices, etc 
...a lot more

## Tech Stack

- Tanstack start (w/ React compiler, Tailwind css)
- Postgresql (w/ Prisma)
- Gsap
- Better Auth
- Zod
- Lenis
- T3env
- Biome
- Docker

// In the Next Version
- Papaparse
- Nodemailer
- Zustand with Immer

## Get started with contribution

Step 1: Clone
```bash
git clone https://github.com/BurningFlamesss/scms
```

Step 2: Install deps
```bash
npm i
```

Step 3: Rename `.env.example` to `.env.local` and change the variables

Step 4: Setup local database provider using docker  (OPTIONAL, If you are using some other postgresql provider)
```bash
docker compose up -d
```

Step 5: Generate and Push the prisma schema and then generate seed for SUPERADMIN account (Make sure to update /src/packages/auth/server/create-invite.ts ORGANIZATION_ID & BRANCH_ID with the respective field in your local database. You can see the data via `npm run db:studio`)
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Step 6: Run either the dev server or the production server
```bash
npm run dev
npm run build
```