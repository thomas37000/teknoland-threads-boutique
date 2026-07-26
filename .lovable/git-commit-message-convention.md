# Descriptive Commit Messages

When creating automatic Git commits, never use generic commit messages such as "Changes", "Update", or "Fix".

Always generate a concise and descriptive commit message that reflects the actual code modification.

## Rules

- Use imperative mood.
- Keep the message under 72 characters when possible.
- Mention the affected feature, component, or file.
- If multiple related changes are made, summarize them in one sentence.
- Follow Conventional Commits whenever possible.

## Examples

Instead of:

```text
Changes
```

use:

```text
feat(cart): add reservedItems to CartContext
```

Instead of:

```text
Changes
```

use:

```text
refactor(cart): simplify CartProvider
```

Instead of:

```text
Changes
```

use:

```text
fix(admin): redirect after reservation
```

Instead of:

```text
Changes
```

use:

```text
types(cart): add reservedItems and removeReservedItem
```

## Goal

Every commit should explain **what changed** without requiring someone to open the diff.

Generic commit messages like **"Changes"**, **"Update"**, or **"Fix"** must never be used.