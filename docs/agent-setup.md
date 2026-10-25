# Connect a design language

Reviewed October 25, 2026. Consult `distribution.json` for verified publication status. Experimental distribution does not establish stable grammar or complete accessibility conformance.

| Language | Public MCP endpoint | Optional builder skill |
| --- | --- | --- |
| Martlet | https://martletdesign.dev/mcp | `martlet-builder` |
| Krigsvold | https://krigsvolddesign.dev/mcp | `krigsvold-builder` |

The remote MCP retrieves public knowledge only. It needs no account, API key or local download. It cannot access the registry administration service, user drafts or write operations. Keep the two independent identities separate.

## ChatGPT

Open Plugins, use the plus button and select **Add custom MCP server**. Give it the chosen language's name, paste its endpoint and choose **No authentication**. Review the connection and create the plugin. Install it, then select it with `@` in a new conversation. Account and workspace permissions may restrict custom servers. The private review Site's automatically created plugin is a separate owner-scoped connection.

## Claude and Claude Code

In Claude, open **Customize → Connectors**, add a custom **Web** connector, paste the selected endpoint and choose **No sign in**. Enable it in the conversation. Team and Enterprise owners may need to add the connector first.

For Claude Code, choose one:

```sh
claude mcp add --transport http martlet-design-language https://martletdesign.dev/mcp
claude mcp add --transport http krigsvold-design-language https://krigsvolddesign.dev/mcp
```

Use `/mcp` to inspect connection status. A successful installation command alone does not establish that tool calls work.

## Method and installed skills

Call `get_manifest`, confirm the family and provenance, then retrieve `builder-skill` and `grammar` using `get_reference`. Search for the task, retrieve full patterns and actual APIs, compose the interface, and verify its complete states and keyboard/focus behavior. MCP delivery does not itself install a persistent skill. The builder method is available through MCP without downloading it; optional skill ZIPs and offline stdio distributions are linked from each reference site's Agent tools page.

## Evidence and troubleshooting

SDK checks cover pinned modern 2026-07-28 and legacy Streamable HTTP, tools/resources, hashes, family isolation, validation and unavailable references. Account-specific ChatGPT and Claude UI installation is a separate observation and must be reported separately. A static HTML response from `/mcp` means the Worker route was not deployed. A private Site's sign-in wall is not the public knowledge endpoint. A missing version or platform is unsupported; do not substitute the other family or invent APIs.

Official setup references: [ChatGPT custom MCP](https://developers.openai.com/api/docs/guides/custom-mcp-server), [Claude custom connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp), [Claude Code MCP](https://code.claude.com/docs/en/mcp).

## Paired private plugins and Claude Code source

The repository’s `plugins/martlet-design-language` and `plugins/krigsvold-design-language` each contain the matching builder skill, original mark and remote MCP configuration. They can be saved as separate private ChatGPT plugins. Account creation, installation and tool availability are verified separately; see the release record for actual status.

From a checkout, Claude Code can load one plugin for the session:

```sh
claude --plugin-dir ./plugins/martlet-design-language
# or
claude --plugin-dir ./plugins/krigsvold-design-language
```

Inspect `/mcp`, then request `get_manifest` and `platform:Astro` or React component references for the selected platform. The `.claude-plugin` compatibility manifest uses the same skill and endpoint as portable `plugin.json` / `mcp.json`. A skill alone contains no MCP executable; the optional full offline agent archive contains the stdio server.
