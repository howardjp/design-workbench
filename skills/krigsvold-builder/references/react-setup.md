# Krigsvold React setup

React components 0.1.0 · experimental · tested theme dependency 2.1.0 · React 19.

The package is available as a public GitHub release tarball. npm publication is pending (`published: false` means unavailable from the npm registry, not absent implementation). Do not try `@krigsvold/react@next` while that flag is false. Do not replace the real components with theme-only JSX when the documented public archive is obtainable.

```sh
npm install https://github.com/howardjp/design-workbench/releases/download/react-v0.1.0/krigsvold-react-0.1.0.tgz react@19 react-dom@19
```

For a new Vite project, first run `npm create vite@latest example -- --template react-ts`, enter `example`, then use the command above. Check Node engine requirements of the chosen Vite version. Commit package.json and the generated lockfile; verify a clean `npm ci && npm run build`.

Artifact SHA-256: `d7ffd5de0df1f08370d05d5d7a950b932f912b99cd0a2fcf871795e5e0140246`. If an environment cannot install HTTPS tarballs directly, download the exact URL, verify its checksum with `sha256sum`, then run `npm install ./krigsvold-react-0.1.0.tgz react@19 react-dom@19`. A public archive is a supported alternative to registry publication, not an unpublished workspace package.

```tsx
import { Button, Field, TextInput } from '@krigsvold/react';
import '@krigsvold/react/styles.css';
import '@krigsvold/theme/fonts.css';

export default function App() {
  return <div className="krigsvold" data-krigsvold="light">
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
