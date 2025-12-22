Based on Clean Architecture principles applied to React, here is the elaboration of those "1 X" concepts. They are essentially rules of consistency and separation of concerns.

1. "1 Component" = Single Responsibility

This does not mean you cannot split code. In fact, it usually means you should split it more, but organized by purpose.

Does this mean each UI element is a self-contained component?

Yes. If a button is used in two places, it becomes a <Button /> component. You do not copy-paste the button code.

Avoid splitting logic?

No. Actually, the opposite.

The Rule: A component should only handle Rendering (View).

The Logic: Business logic (calculations, API calls) should move to Custom Hooks or Utility functions.

Example: Don't write a component that fetches data and displays it. Write a hook useFetchData() that returns the data, and a component <DataView /> that purely displays it.

2. "1 Style" = Single Methodology

This refers to technical consistency in how you write CSS.

One global CSS file?

No. That is considered "dirty" in modern React because it's hard to maintain.

One consistent visual style?

Yes. A "Design Token" approach. You define your colors (e.g., primary-blue) and spacing once. You never hardcode hex codes like #3498db inside a random component file.

Use CSS variables exclusively?

Yes (Recommended). Or use a standard utility library (like Tailwind) exclusively.

The Rule: Pick ONE method (e.g., CSS Modules, Styled Components, OR Tailwind) and stick to it strictly. Do not mix them.

3. "1 Design" = Single Source of Truth (UI System)

This refers to the Visual Language of your app.

One design system?

Yes. An input field on the Login page must look and behave exactly like an input field on the Profile page.

No mixing of libraries?

Strictly Yes. Do not install Bootstrap for the grid and Material UI for the buttons. Pick one library or build your own custom system.

4. "1 Architecture" = Single Structural Pattern

This refers to File Organization and Data Flow.

One folder structure pattern?

Yes. A common Clean Architecture pattern in React is Feature-Based.

Bad: Grouping by type (folder components, folder hooks).

Good: Grouping by feature (folder Auth contains its own components, hooks, and API logic).

One state management approach?

Yes. Don't use Redux for user data and Zustand for cart data. Choose one global state manager.

One data flow pattern?

Yes. Props go down, Events go up. Avoid complex workarounds like extensive use of ref to force updates.

Where should this "Memory" live?

This depends on if you want this memory for Humans (your team) or AI Agents (coding assistants).

For Humans (Documentation):

Location: docs/ARCH_GUIDELINES.md or README.md.

Why: New developers read this to understand where to put files.

For AI Agents (Cursor, Copilot, etc.):

Location: .cursorrules, .windsurfrules, or a generic .agent/instructions.md.

Why: This forces the AI to read your rules before generating code, ensuring it doesn't give you inline styles if you banned them.

Recommendation: Create a docs/ folder for the human-readable version, and reference it in your AI system prompt.

Handling Violations

When you (or the AI) detect a violation of these rules:

Scenario: You want to add a button that looks slightly different from the design system.

Ask for confirmation first (Preferred):

"I see you are adding a custom style to this button. We typically use the <PrimaryButton> component. Should we update the global component or is this a unique exception?"

Refuse duplicate components:

If you try to create login-button.tsx when button.tsx exists, the "system" (you or the linter) should flag it.