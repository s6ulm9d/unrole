# 🧠 UNROLE: THE ULTIMATE TECHNICAL ARCHITECT'S BLUEPRINT

## 1. RATIONALE & PHILOSOPHY
The goal was to build a LinkedIn automation platform that isn't just a scraper, but a resident "AI Agent" for the user. Unlike basic bots, **Unrole** prioritizes **account longevity** and **semantic accuracy**.

### Why this stack?
- **NestJS (API/Worker)**: Chosen for its strict dependency injection and modularity. This allows us to share code (AI logic, Prisma) between the public API and the background worker seamlessly.
- **Playwright vs Puppeteer**: Playwright provides better browser context isolation and modern features to bypass bot detection (CDP session access, advanced click simulations).
- **Next.js 14**: Provides the fastest possible dashboard experience with SSR for analytics.

---

## 2. COMPONENT DEEP-DIVE

### 2.1 The AI Engine (AI Research Module)
- **Problem**: Traditional keyword matching fails because roles like "Software Engineer" and "Product Developer" are semantically identical but lexicographically different.
- **Solution**: We implemented `packages/ai` which uses **GPT-4o-mini** for:
    - **Resume Decomposition**: Breaking a static PDF into a queryable JSON object.
    - **Semantic Scoring**: Instead of "Does 'React' exist?", we ask "Does this candidate's experience in building high-performance UIs align with this Senior Frontend role?".
    - **Synthetic Personalization**: Dynamically rewriting resume bullets to echo the job's terminology without inventing facts.

### 2.2 The Automation Worker (Stealth Module)
- **Anti-Detection Logic**:
    - **Bezier Curves**: Mouse movements aren't linear; they follow human-like arcs.
    - **Viewport Jitter**: No two browser sessions have the exact same resolution.
    - **Session Persistence**: Instead of logging in every time (which triggers LinkedIn's "unusual activity"), we persist the `Auth` context (cookies/localStorage) in an encrypted DB field.
- **Micro-Queuing**: Using **BullMQ**, we ensure that if LinkedIn rate-limits us, the job is retried with exponential backoff rather than just failing.

### 2.3 The Infrastructure (DevOps)
- **Containerization**: Everything is Dockerized.
- **Horizontal Scaling**: The `Worker` service is stateless. If you have 10,000 users, you can simply spin up 10 more worker containers pointing to the same Redis instance.

---

## 3. MASTER WORKFLOW (THE LOOP)
1. **INGEST**: User uploads PDF -> AI parses to JSON.
2. **DISCOVER**: Worker scrapes LinkedIn for jobs matching criteria.
3. **VALIDATE**: AI scores Job vs Resume. If >70%, proceed.
4. **OPTMIZE**: AI generates a `ResumeVariant` specific to that Job.
5. **EXECUTE**: Playwright launches, loads session, navigates, and submits "Easy Apply" with the optimized resume.
6. **REPORT**: Result is pushed to the Dashboard via WebSockets/DB update.

---

## 4. ADDRESSING RISKS
- **Account Bans**: Mitigated by strict rate limits and per-user dedicated IP pools (architecturally supported).
- **CAPTCHA**: The system is designed to pause and notify the user (MFA/CAPTCHA event) rather than blindly hammering the site.
- **Legal**: We include a mandatory Terms of Service acceptance for all automated actions.

---

## 5. SUMMARY OF DELIVERABLES
- ✅ **API**: `/apps/api` (NestJS)
- ✅ **Worker**: `/apps/worker` (NestJS + Playwright)
- ✅ **Frontend**: `/apps/frontend` (Next.js + Tailwind)
- ✅ **AI Engine**: `/packages/ai` (OpenAI Helper)
- ✅ **DB**: `/packages/db` (Prisma/Postgres)
- ✅ **Docs**: `DOCUMENTATION.md` & `DETAIL.md`

**UNROLE is now a fully functional foundation for a world-class LinkedIn Automation SaaS.**
