# 🚀 Unrole: Enterprise-Grade LinkedIn Automation SaaS (LoopCV Clone)

## 📌 Project Overview
Unrole is a production-ready SaaS platform designed to automate the entire job application lifecycle on LinkedIn. It replicates the sophisticated workflow of LoopCV Pro, leveraging AI for resume optimization and distributed workers for browser automation.

---

## 🏗️ High-Level Architecture
The system is built using a **Distributed Microservices Architecture** to ensure scalability, security, and maintainability.

### 1. Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router.
- **Styling**: TailwindCSS with ShadCN UI components.
- **State Management**: Zustand.
- **Animations**: Framer Motion for a premium, fluid user experience.
- **Analytics**: Recharts for visualizing application performance and match scores.

### 2. Backend API (NestJS)
- **Framework**: NestJS (Node.js).
- **ORM**: Prisma with PostgreSQL.
- **Caching/Queuing**: Redis with BullMQ for background job processing.
- **Security**: AES-256 for session encryption, Argon2 for password hashing (using bcrypt in demo), and JWT for authentication.

### 3. Automation Worker (Playwright)
- **Engine**: Playwright (for advanced anti-detection).
- **Scraping**: Structured extraction of LinkedIn jobs.
- **Automation**: Dynamic form filling for "Easy Apply" flows.
- **Session Management**: Per-user browser containerization with session persistence.

### 4. AI Engine (OpenAI + Embeddings)
- **Resume Parsing**: GPT-4o-mini structured output for converting PDFs to JSON.
- **Tailoring**: Context-aware bullet point rewriting to align with job descriptions.
- **Scoring**: Hybrid scoring using skill overlap and embedding-based semantic similarity.

---

## 🛠️ Detailed Implementation Breakdown

### 1. Database Schema Design
The schema is designed for relations and efficiency:
- `User`: Core user data and subscription tier.
- `Job`: Normalized job data from LinkedIn.
- `Application`: Tracks the state (Queued, Applied, Failed, Responded) and logs.
- `ResumeVariant`: Stores AI-optimized versions of resumes for specific jobs.
- `AnalyticsSnapshot`: Daily metrics for the dashboard.

### 2. Match Scoring Logic
- **Step 1**: Extract skills and experience from Resume using OpenAI.
- **Step 2**: Extract keywords and requirements from Job Description.
- **Step 3**: Calculate a weighted score:
  - 40% Logic-based skill overlap.
  - 60% Semantic similarity (OpenAI Embeddings).
  - Threshold set to 70% for automatic application.

### 3. Anti-Detection Strategy
- **Browser Fingerprinting**: Randomized viewport sizes and patched navigator properties.
- **Behavioral Simulation**: Bezier curve cursor movements and non-linear delays.
- **Rate Limiting**: Strict 10-20 applications per day limit to prevent account bans.
- **Proxies**: Architecture support for residential rotating proxies.

---

## 🚦 How to Run the Platform

### Prerequisites
- Docker & Docker Compose
- OpenAI API Key

### Setup
1. Clone the repository.
2. Create a `.env` file in the root:
   ```env
   OPENAI_API_KEY=your_key_here
   DATABASE_URL=postgresql://user:password@localhost:5432/unrole
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```
3. Run the stack:
   ```bash
   docker-compose up --build
   ```

### Access
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000

---

## 🔒 Security & Compliance
- **Zero Plaintext Storage**: All LinkedIn session cookies are encrypted with AES-256-GCM.
- **Rate Limiting**: Integrated throttler at the API level.
- **Legal**: Users must provide explicit consent for automation.

---

## 📈 Future Roadmap
- [ ] Gmail OAuth integration for recruiter response classification.
- [ ] Multi-portal support (Indeed, Glassdoor).
- [ ] Real-time browser logging for users to monitor their "bot".

---
**Developed with ❤️ by Antigravity AI.**
