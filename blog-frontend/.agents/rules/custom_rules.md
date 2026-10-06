# Custom Guidelines & Rules

1. **Do Not Build**: Never run build commands (`npm run build`, `next build`, `pnpm build`, etc.).
2. **Follow Existing Design & Theme**:
   - Always adhere to the established color code, palette, and CSS variables (such as `var(--primary_Color)` / `#ff6c0a`).
   - Maintain the look and feel of existing modules and pages.
3. **Always Reuse Existing Custom Components**:
   - Prefer reusing custom components from `@/components/form` (e.g., `DbInput`, `DbSelect`, `DbMultySelect`, `DbTextArea`, `DbUploder`) over raw library primitives (such as raw `CheckPicker`, `SelectPicker`, etc.).
   - Use standard table components (`TableMain`, `TableHader`, `TableBody`, `TableRow`, `TableItem`, `TableLoader`, `NoResultFound`) for list views.
