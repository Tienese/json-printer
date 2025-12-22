---
description: React Clean Architecture - 1 Component, 1 Style, 1 Design, 1 Architecture + SOLID principles
---

# React Clean Architecture & SOLID Principles

**Context:** Modern React is built on **Functional Programming + Composition**, not OOP classes. These rules translate classic architecture principles to React patterns.

---

## The "1 X" Consistency Rules

### 1 Component = Single Responsibility

- **Components only render** — no business logic, no API calls inside components
- **Logic goes to hooks** — create `useFetchData()`, not inline fetch in component
- **Reuse, don't repeat** — if used twice, extract to shared component

```tsx
✅ GOOD: <DataView data={data} />  ← pure render
✅ GOOD: useFetchData()           ← hook handles logic

❌ BAD: <UserProfile /> that fetches data, formats dates, calculates age, AND renders HTML
```

**SOLID equivalent:** **S - Single Responsibility Principle**

---

### 1 Style = Single Methodology

- **Use Tailwind exclusively** — do NOT mix with CSS Modules or Styled Components
- **Design Tokens** — use CSS variables for colors/spacing, never hardcode hex values
- **No inline styles** — use utility classes only

```tsx
✅ GOOD: className="text-primary bg-surface"
❌ BAD: style={{ color: '#3498db' }}
```

---

### 1 Design = Single UI System

- **Consistent components** — input on Login = input on Profile
- **One library only** — do NOT mix Bootstrap + Material UI + custom
- **Use shared primitives** — `<Button>`, `<Input>`, `<Alert>` from `/components/ui/`

**SOLID equivalent:** **L - Liskov Substitution Principle** (Interchangeable Components)

---

### 1 Architecture = Single Structural Pattern

- **Feature-based folders** — group by feature, not by type
- **One state approach** — React Context only (no Redux/Zustand mixing)
- **Props down, Events up** — avoid ref hacks for data flow

```
✅ GOOD: worksheet-ui/src/components/QuizBuilder/
         ├── QuizBuilder.tsx
         ├── useQuizBuilder.ts
         └── quizTypes.ts

❌ BAD: worksheet-ui/src/components/QuizBuilder.tsx
        worksheet-ui/src/hooks/useQuizBuilder.ts
        worksheet-ui/src/types/quizTypes.ts
```

**SOLID equivalent:** **D - Dependency Inversion** (Custom Hooks abstract data sources)

---

## SOLID Principles in React

### O - Open/Closed Principle

**Classic:** Open for extension, closed for modification.  
**React:** **Composition over Configuration**. Avoid 50 boolean props.

```tsx
❌ BAD: Adding hasIcon, hasTitle, hasFooter props to <Card />

✅ GOOD: Use children/slots
<Card>
  <Card.Title>My Title</Card.Title>
  <Card.Content>My content...</Card.Content>
</Card>
```

---

### I - Interface Segregation

**Classic:** Don't force a client to implement an interface it doesn't use.  
**React:** **Don't pass the whole object if you only need one field.**

```tsx
❌ BAD: <Avatar user={user} />
  // What if you want an avatar for a non-user entity later?

✅ GOOD: <Avatar url={user.imageUrl} />
  // Now it's decoupled from "User"
```

---

## DRY vs WET (Rule of Three)

**Warning:** DRY (Don't Repeat Yourself) can be dangerous in React.  
It leads to **Prop Drilling** and **God Components**.

### Adopt "WET" (Write Everything Twice) initially

**The Solution (Rule of Three):**
1. Write the component the **first** time
2. **Copy-paste** it the second time (WET)
3. **Refactor** into shared component only on **third** use when pattern is obvious

**The Trap to Avoid:**
```tsx
❌ You see two similar cards → immediately create <GenericCard />
✅ Wait until 3rd use → pattern is clear → extract shared component
```

---

## React Clean Code Standards

### Composition > Inheritance

**NEVER** use `extends React.Component` to share logic.

```tsx
❌ BAD: class AdminUser extends UserComponent

✅ GOOD:
<Layout>
  <Sidebar />
  <AdminContent />
</Layout>
```

---

### Colocation (Keep things close)

**Put things that change together, close together.**

```
✅ Feature Folder:
features/Profile/
  ├── Profile.tsx        (View)
  ├── useProfile.ts      (Logic)
  └── Profile.test.tsx   (Tests)
```

---

## When to Refactor

Ask these questions:
1. **Is this used 3+ times?** → Extract to shared
2. **Does it do more than render?** → Split logic to hook
3. **Are there 5+ props?** → Consider composition instead
4. **Is there `if (type === X)` logic?** → Separate components

---

## Handling Violations

When you detect a violation:

1. **Ask first:** "Should we update the shared component or is this a unique exception?"
2. **Flag duplicates:** If `login-button.tsx` exists when `Button.tsx` already does, refactor to use shared
3. **Document exceptions:** If approved, add comment explaining why exception was needed
