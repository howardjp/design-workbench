# Martlet React setup

React components 0.1.0 · experimental · tested theme dependency 2.1.0 · React 19.

The package is published on npm. At verification, both `latest` and `next` resolve to 0.1.0; the API remains experimental. Pin the version for reproducible adoption and use the real React components.

```sh
npm install @martlet/react@0.1.0 react@19 react-dom@19
```

For a new Vite project, first run `npm create vite@latest example -- --template react-ts`, enter `example`, then use the command above. Check Node engine requirements of the chosen Vite version. Commit package.json and the generated lockfile; verify a clean `npm ci && npm run build`.

The immutable public GitHub archive remains an alternative: https://github.com/howardjp/design-workbench/releases/download/react-v0.1.0/martlet-react-0.1.0.tgz. Its checksum applies to that archive, not the npm registry tarball.

Artifact SHA-256: `42a501d06ef7114ed5640b52d9889998ae70ca1846e0bdfba9e1ba487c3c1a41`. If an environment cannot install HTTPS tarballs directly, download the exact URL, verify its checksum with `sha256sum`, then run `npm install ./martlet-react-0.1.0.tgz react@19 react-dom@19`. A public archive is a supported alternative to registry publication, not an unpublished workspace package.

```tsx
import { Button, Field, TextInput } from '@martlet/react';
import '@martlet/react/styles.css';
import '@martlet/theme/fonts.css';

export default function App() {
  return <div className="martlet" data-martlet="light">
    <form onSubmit={event => event.preventDefault()}>
      <Field label="Name" hint="Use the name for this registration.">
        {props => <TextInput {...props} name="name" required />}
      </Field>
      <Button type="submit">Register</Button>
    </form>
  </div>;
}
```

This is a buildable component probe; it deliberately supplies no service or validation controller. Retrieve `pattern:validated-form`, `component:Field`, `component:ErrorSummary`, `component:Dialog` and their examples for the full interaction contract. React's published archive owns its component styling and remains on its tested theme 2.1.0 dependency. Do not import the newer core `full.css` over React styles or silently upgrade that dependency. Core 2.2.2 native-HTML forms are a separately versioned route for Astro and framework-independent markup, not a requirement for this React archive.

Use the actual exported APIs, family data attribute and native host identity. Top/side/none navigation remain task choices. Host code supplies validation, retained drafts, transport, cancellation and persistence. The real React components, rather than theme-only replicas, must be used for a React component adoption verdict. Full-page dark appearance, manual assistive technology, localization/RTL and sustained adoption remain experimental/open.

If the tarball cannot be obtained, record the exact failure before proposing another route. Theme-only React must be labelled as direct HTML using `platform:HTML` and `styling:forms`; it does not validate the React component contracts. The public websites are supplementary: all installation information above is available directly over MCP.
