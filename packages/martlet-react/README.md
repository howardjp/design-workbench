# @martlet/react

Experimental 0.1.0. MIT licensed. Source package in the [design workbench](https://github.com/howardjp/design-workbench). Not published to npm and not a stable public API. `private: true` prevents accidental publication while the contract is being exercised.

```tsx
import { Button, Field, TextInput } from '@martlet/react';
import '@martlet/react/styles.css';
import '@martlet/theme/fonts.css'; // optional local fonts

<div className="martlet" data-martlet="light">
  <Field label="Component name" hint="Use the exported API name.">
    {props => <TextInput {...props} name="name" required />}
  </Field>
  <Button type="submit">Save component</Button>
</div>
```

Exports: AppShell, Button, TextInput, Select, Textarea, Field, Notice, Badge, DataTable, Dialog, Checkbox, Fieldset, Disclosure, and FieldControl (type). Native attributes and refs on native controls follow React 19 conventions. Button defaults to `type="button"`. Field supplies a stable id and associated hint/error descriptions through a render function. Dialog uses the native modal top layer; keep it mounted and control `open`. Escape calls `onDismiss`; provide visible dismissal buttons. DataTable wraps a semantic table in a named, focusable overflow region. Notice announces success/info politely and errors assertively.

Use one AppShell per document; its skip link targets main. Styles are scoped to `.martlet` and require the matching data attribute for light/dark colors. Both families can coexist in a document. Application spacing roles are experimental. No app persistence or registry state is embedded in the components.

Build with `npm run build` at the workspace root. `npm run pack:react` produces installable tarballs for testing without publishing. React 19 and the theme package are required. Build artifacts include JavaScript, declarations, and CSS. The workbench exercises editing, validation, saving, server failures, conflicts, empty results, modal dismissal, light/dark rendering, responsive layout, and automated accessibility checks. Manual assistive-technology review and sustained use remain required before stability.

See the [component contracts](../../docs/components.md) for properties, states, keyboard behavior, and acceptance criteria for every export. Checkbox is binary; mixed state is not yet a public contract. Fieldset keeps the native legend and disabled-group behavior. Disclosure uses native details/summary toggling.
