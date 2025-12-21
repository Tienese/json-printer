# Claude Code Configuration: `json-printer`

> **🚨 CRITICAL: LOCALHOST PARALLEL EXECUTION**
> **CONTEXT:** Single-User, Stateless, Local-First (Java + React).
> **STACK:** Java 21 (Spring Boot 3.5), React (Vite/Tailwind), Maven.

---

## 🚨 Critical: Hybrid Stack Concurrent Operations

**ABSOLUTE RULE:** ALL operations (Backend + Frontend) MUST be batched in a single message to maintain sync between the Spring Boot backend and React frontend.

### 🔴 Mandatory Concurrent Patterns

* **Full Stack Updates:** ALWAYS batch Java (Backend) and React (Frontend) changes together if they relate to the same feature.
* **Stateless Mindset:** NEVER attempt to create database entities, repositories, or SQL migrations.
* **Build Operations:** ALWAYS use the Maven wrapper, which controls the frontend build.

> ⚡ **GOLDEN RULE:** "1 MESSAGE = FULL FEATURE IMPLEMENTATION (Backend API + Frontend UI)"

### ✅ Example of CORRECT Execution (json-printer)

```yaml
[Single Message]:
  - Task("You are the Architect. Coordinate JSON parsing logic...")
  - Task("You are the UI Dev. Coordinate React component state...")
  - Write("src/main/java/com/jsonprinter/service/CanvasService.java", apiLogic)
  - Write("src/main/java/com/jsonprinter/controller/ReportController.java", restEndpoint)
  - Write("src/main/resources/application.properties", configUpdate)
  - Write("src/main/frontend/src/components/QuizList.tsx", reactComponent)
  - Write("src/main/frontend/src/hooks/useCanvas.ts", reactHook)
  - Write("src/main/frontend/src/types/quiz.ts", typescriptDefinitions)
  - Bash("mvn clean install") 
  # Note: 'mvn install' triggers the frontend-maven-plugin to build React automatically

```

---

## 🏗️ Architecture: Stateless Hybrid Web App

**Mental Model:**

* **The Converter:** Input (API/CSV) -> Process (Memory) -> Output (PDF/Print).
* **The Build:** React is built by Maven and embedded into the JAR.
* **The User:** YOU (Localhost). No login screens. No security tokens (except `application.properties`).

### ❌ BANNED TECHNOLOGIES (Do Not Use)

* **No Databases:** PostgreSQL, MySQL, H2, MongoDB, Flyway, Hibernate/JPA.
* **No Complex Security:** Spring Security, JWT, OAuth2, Keycloak.
* **No Heavy Frontend:** Next.js, Redux (unless absolutely necessary), SSR (Server Side Rendering).
* **No Cloud Ops:** Docker, Kubernetes, Jenkins, Terraform, AWS/Cloud annotations.

---

## ☕ Backend Coordination (Spring Boot 3.5 + Java 21)

**Role:** Data Orchestrator & Proxy.
**State:** In-memory only. Records over Classes.

### 🔌 API & Integration Pattern

* **Canvas Integration:** Use `RestClient` (Java 21 style) for fetching Canvas data.
* **CSV Processing:** Use `Apache Commons CSV` for parsing student data.
* **React:** Use strictly for generating **Printable Reports** (client-side rendering for printing).

**Standard Java Batch:**

```yaml
[BatchTool]:
  - Write("src/main/java/com/jsonprinter/model/QuizDTO.java", javaRecord)
  - Write("src/main/java/com/jsonprinter/service/PrintService.java", logic)
  - Write("src/main/java/com/jsonprinter/controller/ApiController.java", endpoint)
  - Bash("mvn compile")

```

---

## ⚛️ Frontend Coordination (React + Vite)

**Role:** Interactive Worksheet Builder (WYSIWYG).
**State:** LocalStorage (Persistence) + React Context (Runtime).

### 🎨 UI & State Pattern

* **Worksheet Builder:** Heavy use of React State/Context.
* **Styling:** Tailwind CSS (Utility-first, Print-optimized).
* **Storage:** `localStorage.setItem('draft_worksheet', ...)` for saving progress.
* **Fetch:** Standard `fetch` or custom hooks calling the local Spring Boot API (`/api/...`).

**Standard React Batch:**

```yaml
[BatchTool]:
  - Write("src/main/frontend/src/components/Builder/GridEditor.tsx", component)
  - Write("src/main/frontend/src/hooks/useLocalStorage.ts", storageHook)
  - Write("src/main/frontend/src/App.tsx", routeUpdate)
  - Bash("cd src/main/frontend && npm run lint") # Quick check

```

---

## 🔧 Build & Run Coordination

**The "One Command" Workflow:**
Since this project uses `frontend-maven-plugin`, you rarely need to run `npm` commands manually in the root context.

### 🚀 Standard Development Cycle

```bash
# 1. Clean & Build Everything (Java + Node install + Vite Build)
mvn clean install

# 2. Run the App (Localhost:8080)
mvn spring-boot:run

# 3. (Optional) Quick Frontend Dev (Separate Terminal)
# Only if you need Hot Module Replacement (HMR) for UI tweaking
cd src/main/frontend && npm run dev

```

---

## 💡 Code Quality & Defaults

* **Java:** Use Java 21 `record` for all DTOs. Use `var` for local variables.
* **TypeScript:** Strict typing. Interfaces for all API responses.
* **CSS:** Tailwind classes preferred over custom CSS files.
* **Simplicity:** If a library isn't needed, don't add it. Keep `pom.xml` and `package.json` lean.