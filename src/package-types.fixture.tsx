// Compile consumer-native props and refs against both public package APIs.
import { createRef } from "react";
import * as Martlet from "@martlet/react";
import * as Krigsvold from "@krigsvold/react";
export const consumerContracts = [Martlet, Krigsvold].map((UI) => (
  <UI.Field label="Email">
    {(props) => (
      <UI.TextInput
        {...props}
        ref={createRef<HTMLInputElement>()}
        name="email"
        type="email"
        autoComplete="email"
        required
      />
    )}
  </UI.Field>
));
export const summaryContracts = [Martlet, Krigsvold].map((UI) => (
  <UI.ErrorSummary
    ref={createRef<HTMLDivElement>()}
    title="Check the form"
    errors={[{ message: "Enter a name.", targetId: "name" }]}
  >
    <UI.Field id="name" label="Name">
      {(props) => <UI.TextInput {...props} />}
    </UI.Field>
  </UI.ErrorSummary>
));
