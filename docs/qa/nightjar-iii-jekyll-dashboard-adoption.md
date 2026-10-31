# Nightjar III: standalone Jekyll directory adoption

## Finding and change

The frozen Jekyll snapshots ship a data-driven `examples/table.html` include, but their guide did not explain its inputs or demonstrate a new application composed independently of the three canonical dashboard controllers. The existing `example-dashboard` layout is tied to Northlight's fixture, navigation and the three named applications; it is not a general dashboard API. An unfamiliar developer could not follow the existing guide alone to reproduce a small custom directory. This is a documentation and adoption gap, not evidence that every Jekyll dashboard feature is independently reusable.

The canonical `examples/page-archetypes/DASHBOARDS.md` now documents `block.title`, `headers`, `rows` and optional `density` for the existing table include, and supplies a small complete directory using that include, the family's existing button and layout styles, and a consumer-owned progressive-enhancement script. The synchronized copies in both Jekyll exports carry the same guide. No new component, example-specific CSS, shared fixture owner or source-authority transfer is introduced. The example uses synthetic Mara/Active and Pavel/Pending records, case-insensitive Apply search, Clear search, no-match guidance and a local-only status; no data is sent or saved. Both rows remain readable and controls remain disabled if JavaScript is disabled, blocked, or initialization fails.

## Clean-room evidence

The authoring input is workbench commit `5fa205b06e75e70c7f0ecbb41289f43265b6ad14`, a descendant of the Nightjar II frozen candidate and the [#48](https://github.com/k3jph/design-workbench/pull/48) dashboard-landmark correction. The [#46](https://github.com/k3jph/design-workbench/pull/46) materializer was explicitly given that full locally present SHA, producing separate clean local repositories without remotes:

| Family | Local candidate | Commit | Tree |
| --- | --- | --- | --- |
| Martlet | `/workspace/nightjar-iii-guide/jekyll-martlet` | `8d6548cb682269807381889bb96bd0063354819c` | `938e9a9e7d26f4267a9243e9b9acad2cfd9b77a8` |
| Krigsvold | `/workspace/nightjar-iii-guide/jekyll-krigsvold` | `a1abc5c8420ab52109f58506e40dbfbfb5c46232` | `c5e1f006c4d0e0d24285e12a1e9d46d93be59b7f` |

The prior frozen Nightjar II and #48-derived snapshots remain unchanged. Each candidate records the exact source commit in `nightjar/PROVENANCE.json`; its `docs/archetypes/DASHBOARDS.md` matches the canonical authoring input byte-for-byte and is in the source allowlist.

`scripts/qa/nightjar-iii-jekyll-dashboard-adoption.mjs` requires an explicit candidate directory and both full local commit IDs. It reads the three sample files **from each candidate's guide**, copies only tracked snapshot files into a disposable directory without `.git`, writes those exact snippets, and adds the three consumer files to the source-archive allowlist as documented. For both families at `/` and `/preview`, it builds via the snapshot's own archive helper and verifies that the archive contains the exact guide and all three sample files. It does not copy a workbench dashboard controller or add custom CSS.

With Ruby 3.2.3 and preinstalled locked gems, the four-build Chromium run passed case-insensitive keyboard Apply, uncommitted-input behavior, no-match recovery, Clear and returned focus; 320px and 1440px reflow; no external requests; and static two-row fallback with disabled controls when JavaScript is disabled, the script is blocked, or listener installation fails. Axe reported no violations in the ready, blocked and partial-initialization states. Axe cannot execute in a truly JavaScript-disabled page; there, the Chromium native accessibility tree was sampled for both records and the fallback message, and static semantics and disabled controls were checked separately. Incomplete axe findings were not relabelled as passes.

Both guide-bearing snapshots also passed `BUNDLE_FROZEN=true python3 nightjar/verify.py`: standalone root/subpath builds and link checks, source-archive rebuild without Git metadata, safe-mode and hostile-markup checks, and unsafe-input rejection. `strace -f -e trace=network` observed no socket, connect or send calls during those checks. The environment denied `unshare --net`; this is observed no-network behavior with cached gems, not an enforced network-isolation claim. Canonical source synchronization, source-manifest consistency and `npm run test:examples` also passed.

Run the consumer regression with the snapshot IDs above, for example:

```sh
PATH=/workspace/nightjar/toolchains/ruby-3.2.3-install/bin:$PATH \
BUNDLE_PATH=/workspace/nightjar/toolchains/gems BUNDLE_FROZEN=true \
CHROMIUM_PATH=/usr/bin/chromium \
NIGHTJAR_JEKYLL_CANDIDATES=/workspace/nightjar-iii-guide \
NIGHTJAR_MARTLET_COMMIT=8d6548cb682269807381889bb96bd0063354819c \
NIGHTJAR_KRIGSVOLD_COMMIT=a1abc5c8420ab52109f58506e40dbfbfb5c46232 \
node scripts/qa/nightjar-iii-jekyll-dashboard-adoption.mjs
```

This run does not establish Firefox or WebKit behavior, manual assistive-technology review, physical print, complete visual identity fidelity or accessibility certification. The documented page intentionally illustrates only a local search application; it does not claim the canonical administration dashboard's editing, sorting, bulk actions or export capabilities. The 18 Firefox and 18 WebKit incomplete contrast results remain open. Creating remote repositories, transferring source authority, publishing and deployment remain separately authorized decisions.
