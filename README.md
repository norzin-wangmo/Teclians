# Teclians

**Education Analytics and Student Performance Monitoring System** — a web platform for digitizing attendance and academic records, visualizing trends, and supporting decisions for teachers, students, school administrators, and education authorities.

## Features

- **Teachers** — Record attendance and grades; monitor class performance and trends
- **Students** — View personal attendance, grades, and progress charts
- **School admins** — School-wide analytics, class overview, attendance trends
- **Education authorities** — Multi-school comparison and district-level insights

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- TypeScript, Tailwind CSS
- Prisma + SQLite
- Recharts for analytics visualizations

## Getting started

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Institutions in demo data

**Royal University of Bhutan (RUB)** — all 9 constituent colleges plus 2 affiliated colleges are seeded (CNR, CST, GCBS, CLCS, JNEC, PCE, SCE, Sherubtse, GCIT, RTC, Norbuling Rigter).

**School-level** — e.g. **Motithang Higher Secondary School** (Thimphu). Students use `@education.gov.bt` emails; login with student ID only.

### Demo accounts

| Role | Login | Password |
|------|--------|----------|
| Teacher (CST) | Karmagayley.cst@rub.edu.bt | password123 |
| Student (CST) — Norzin Wangmo, Software Engineering Year 1 | 02250359.cst | password123 |
| Student (Motithang HSS) — Tashi phuntsho | 201.00310.11.0036 | password123 |
| Admin (CST) | admin@rub.edu.bt | password123 |
| Authority | authority@education.gov | password123 |

Staff sign in with education email. Students sign in with **student ID only** (not email). College IDs look like `02250359.cst`; school-level IDs look like `201.00310.11.0036` with email `201.00310.11.0036@education.gov.bt`.

## Scripts

| Command        | Description                          |
|----------------|--------------------------------------|
| `npm run dev`  | Start development server             |
| `npm run build`| Production build                     |
| `npm run db:setup` | Push schema and seed demo data   |
| `npm run db:seed`  | Re-seed database only            |

## Project objectives

This system supports the goals outlined in the project brief:

1. Digitize attendance and academic record management
2. Provide visual dashboards for student performance
3. Help teachers monitor attendance and academic trends
4. Enable students to view their own records and progress
5. Support administrators with school-wide analytics
6. Provide authorities with aggregated educational insights
7. Improve transparency and accessibility of educational data
