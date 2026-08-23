# School Management System (ScMS) v1

ScMS is a all-in-one system to manage the operations, events, notices, users, attendance, transportation, courses, classroom, and clubs.

## Overview

[DEMO](https://user-cdn.hackclub-assets.com/01a0300e-0e6b-74da-93df-cd6c6d7f5275/scms-basic-intro.mp4)

## Pictures

<img width="1896" height="901" alt="image" src="https://github.com/user-attachments/assets/59732499-0290-4e07-b6f6-5f4b6bf0e492" />
<img width="1919" height="874" alt="image" src="https://github.com/user-attachments/assets/a1e73a8d-188d-46a8-8b80-55b8bae72bb9" />
<img width="1919" height="840" alt="image" src="https://github.com/user-attachments/assets/aa3a9a28-82c7-406b-bdf4-3b4da281971c" />
<img width="724" height="102" alt="image" src="https://github.com/user-attachments/assets/7f3eaf9f-02d3-4267-b8c2-4572d3938b35" />
<img width="664" height="41" alt="image" src="https://github.com/user-attachments/assets/d18f6e10-18bf-4e46-989d-0bb93488bbdd" />
<img width="670" height="125" alt="image" src="https://github.com/user-attachments/assets/e85418fb-9663-49b3-8057-fb4014f16d7d" />
<img width="1571" height="36" alt="image" src="https://github.com/user-attachments/assets/9140aaa7-efa4-40fa-95af-90df11a1c3d4" />
<img width="353" height="59" alt="image" src="https://github.com/user-attachments/assets/20c2ec5c-2824-47ca-a98b-6ce4ce7fbbab" />


---

### Routes 

The current version have: 

1. Landing Page (/) with three sections; Hero, Overview, and Footer,
2. About Page (/about) with one sentence of information related to the school, 
3. Contact Page (/contact) with two ways to contact (DUMMY),
4. Signup Page (/signup) with name and email field to generate a invite link (In the next version, except for the server fn, /signup route won't be a thing since invites will be managed by the Admins), also in this version, you can register without any verification but since in future version, it's gonna be carried out on a invite basis only, it shouldn't matter for this moment,
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
