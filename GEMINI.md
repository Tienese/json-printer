# GEMINI CLI AGENT Configuration: `json-printer`

> **Workspace Rules** - Project-specific patterns for json-printer.
> For generic coding principles (SOLID, CoI, LoD, error prevention), see `~/.gemini/GEMINI.md`.

---

## Core Philosophy

> **One way to do each thing. Reuse existing. Extend, don't reinvent.**

| Principle | Rule |
|-----------|------|
| **Consistency** | Check existing patterns before creating new |
| **Simplicity** | Don't abstract early, don't over-engineer |
| **Print-First** | Black & white, static UI, no flashy effects |

---

## Project Context

| Aspect | Value |
|--------|-------|
| **Stack** | Java 21 (Spring Boot 3.5), React (Vite/Tailwind), SQLite |
| **Build** | Maven with frontend-maven-plugin |
| **User** | Single-user, localhost only, no auth |

### Banned Technologies
- **Cloud Databases**: PostgreSQL, MySQL, MongoDB (use SQLite only)
- **Complex Security**: Spring Security, JWT, OAuth2
- **Heavy Frontend**: Next.js, Redux, SSR
- **Cloud Ops**: Docker, Kubernetes, AWS

---

## Before Adding New Code

> **CRITICAL**: Always check existing patterns first.

### Consistency Checklist
1. **Search existing**: Does a similar component/service/pattern exist?
2. **Extend existing**: Can you add to existing code instead of creating new?
3. **Match patterns**: Does new code follow the same structure as existing?

### Anti-Patterns (DON'T DO)
```tsx
// DON'T: Create new button style for same action type
<button className="new-random-style">Submit</button>  // BAD
<Button variant="primary">Submit</Button>              // GOOD (use existing)

// DON'T: Create different input mechanism
<input onKeyDown={customHandler} />   // BAD (custom logic)
<InputField {...standardProps} />      // GOOD (use existing)
```

---

## Batch Operations

**ABSOLUTE RULE:** Backend + Frontend changes MUST be batched together.

> **"1 MESSAGE = FULL FEATURE IMPLEMENTATION"**

```yaml
[Single Message - Write ALL code first]:
  - Write("src/main/java/.../Service.java", logic)
  - Write("src/main/java/.../Controller.java", endpoint)
  - Write("src/main/frontend/src/components/Feature.tsx", component)
  - Write("src/main/frontend/src/hooks/useFeature.ts", hook)
  # NO BUILD HERE - Defer to Final Verification
```

---

## Backend Patterns (Java 21 + Spring Boot)

### DTOs: Use Records
```java
public record QuizDTO(
    String id,
    String title,
    List<QuestionDTO> questions
) {}
```

### External APIs: Use RestClient
```java
private final RestClient restClient;

public QuizDTO fetchQuiz(String id) {
    return restClient.get()
        .uri("/quizzes/{id}", id)
        .retrieve()
        .body(QuizDTO.class);
}
```

### JPA Entity Pattern
Use `@Entity` class (NOT record) with lifecycle callbacks:
```java
@Entity
@Table(name = "worksheets")
public class Worksheet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String jsonContent;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters (required for JPA)
}
```

### JPA Repository Pattern
Use Spring Data interface with method naming:
```java
@Repository
public interface WorksheetRepository extends JpaRepository<Worksheet, Long> {
    List<Worksheet> findAllByOrderByUpdatedAtDesc();
    List<Worksheet> findByNameContainingIgnoreCase(String name);
}
```

**Key Rules**:
- Entities: **class** with getters/setters (JPA requirement)
- DTOs: **record** (immutable)
- Repository: **interface only** - no implementation
- Queries: **method naming** - avoid `@Query`

---

## Frontend Patterns (React + Vite)

### Component Structure
- **Components render only** - move logic to hooks
- **Hooks handle logic** - useEffect, useState, data fetching
- **Shared primitives** - use `src/components/ui/` components

### State Management
- **React Context** for global-ish state
- **localStorage** for transient UI drafts
- **No Redux** unless absolutely necessary

### Styling: Tailwind Only
- NO CSS modules
- NO styled-components
- NO inline `style={{...}}`

---

## Print Design (CRITICAL)

### Rules
- **Black & white ONLY** - no colors in print
- **No background colors** in `@media print`
- **Minimize gaps** - maximize vertical space
- **Use `break-inside-avoid`** for clean page breaks

### Visual Hierarchy Without Color
- Border styles: solid, dashed, double
- Text indicators: `[NOTE]`, `[INFO]`, `[Q1]`
- Font weight: bold for emphasis
- Spacing/indentation for grouping

### Print CSS
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

## UI Standards

### Static Aesthetics (NO Flashy Effects)
- **NO** hover transitions (`hover:bg-*`)
- **NO** scale effects (`active:scale-*`)
- **NO** animations (`transition-all`)
- **YES** focus states for accessibility (`focus:ring-*`)

### Button Example
```tsx
// CORRECT: Static
<button className="px-4 py-2 bg-black text-white border-2 font-bold">
  Submit
</button>

// WRONG: Hover effects
<button className="hover:bg-gray-800 transition-all">
  Submit
</button>
```

### Navbar Usage
```tsx
<Navbar
  onBack={() => navigate(ROUTES.HOME)}
  actions={<button>Print</button>}
/>
```

---

## Build & Run

```bash
# Full build
mvn clean install

# Run app
mvn spring-boot:run

# Frontend dev (HMR)
cd src/main/frontend && npm run dev
```

---

## Final Verification (DEFERRED)

> **Run terminal commands ONLY after ALL code is written.**

### Execution Order
1. Write ALL backend code (no terminal)
2. Write ALL frontend code (no terminal)
3. Self-review code visually
4. **THEN** run verification commands

### Verification Commands (Run ONCE at End)
```bash
mvn clean compile
cd src/main/frontend && npx tsc --noEmit
mvn spring-boot:run
```

### If Verification Fails
1. Read error message
2. Fix the specific issue
3. Re-run ONLY the failed command
4. Repeat until all pass

### DON'T Do This
```yaml
# WRONG: Build after each file
- Write(file1)
- Bash("mvn compile")  # NO!

# CORRECT: Build once at end
- Write(file1)
- Write(file2)
- Write(file3)
- Bash("mvn clean compile")  # Only now
```

---

## SonarQube (Project-Specific)

### Project Key
```
sonar-printer
```

### Usage
```bash
# 1. Push analysis
mvn clean verify sonar:sonar -Dsonar.projectKey=sonar-printer ...

# 2. Fetch results
.sonar\fetch.bat
```

### Token Setup
```bash
cp .sonar/.env.template .sonar/.env
# Edit .sonar/.env with your token
```

### Output
```
.sonar/
├── quality-gate.json      # Pass/Fail
├── issues-critical.json   # BLOCKER + CRITICAL
├── issues-major.json      # MAJOR
└── metrics.json           # Coverage, bugs, smells
```
