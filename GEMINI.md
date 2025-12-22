# GEMINI CLI AGENT Configuration: `json-printer`

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
* **Thymeleaf:** Use strictly for generating **Printable Reports** (server-side HTML generation for PDF conversion).

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

---

## 🖨️ Print Design Rules (CRITICAL)

All printable pages MUST follow these strict guidelines:

### 🚫 No Colors in Print
- **Black and white ONLY** — color is useless for printed worksheets
- **Never render background colors** in `@media print`
- Use `print:bg-white` on all printable elements

### ✏️ Visual Hierarchy Without Color
Use these techniques instead of colors:
- **Border styles:** solid, dashed, double, thick/thin
- **Text indicators:** `[NOTE]`, `[INFO]`, `[!]`, `[Q1]`, `[A]`/`[B]`/`[C]`
- **ASCII/Unicode:** `▸`, `•`, `○`, `▪`, `★`, `→`, box-drawing chars
- **Font weight:** bold for emphasis, normal for content
- **Spacing/indentation:** visual grouping

### 📐 Vertical Space Optimization
- **Minimize gaps:** Use smallest practical margins/padding
- **Goal:** Maximize usable printing area vertically
- **Compact layouts:** Avoid excessive whitespace between items
- **Print-break awareness:** Use `break-inside-avoid` strategically

### ✅ Print CSS Pattern
```css
@media print {
  .printable-item {
    background: white !important;
    color: black !important;
    border-color: black !important;
  }
}
```

---

## 🎨 UI Component Standards

### Navbar Component
* **Usage:** Use `<Navbar />` component on ALL pages for consistent navigation
* **Back Button:** Icon-only chevron (top-left), always navigates to `ROUTES.HOME`
* **Actions Slot:** Right-side area for page-specific buttons (e.g., Print, Save, etc.)
* **Example:**
  ```tsx
  <Navbar 
    onBack={() => navigate(ROUTES.HOME)}
    actions={<button>Print</button>}
  />
  ```

### Styling Rules (CRITICAL)
* **NO hover transitions:** Avoid `hover:bg-*`, `hover:text-*`, `hover:shadow-*`
* **NO scale effects:** Avoid `active:scale-*`, `transition-all`
* **NO flashy animations:** Keep UI static and readable
* **Focus states allowed:** `focus:ring-*` for accessibility is acceptable
* **Rationale:** Minimize visual distraction, prioritize readability

### Button Standards
```tsx
// ✅ CORRECT: Static styling
<button className="px-4 py-2 bg-black text-white border-2 border-black font-bold">
  Submit
</button>

// ❌ WRONG: Hover effects
<button className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-all">
  Submit
</button>
```