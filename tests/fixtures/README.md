# Test fixtures

Drop any Outlook `.msg` files into this folder and
`tests/unit/msg-parser.test.ts` will pick them up automatically.

- Files here are **git-ignored by default** — they may contain private
  email content. If you want to commit a safe sample, add it to the
  repo explicitly with `git add -f tests/fixtures/your-sample.msg`.
- When this folder is empty, the fixture-based test suite is skipped
  (the rest of the suite still runs against synthetic data).
- Recommended: include 1-2 real samples privately so local runs catch
  real-world parsing regressions, while CI stays synthetic.
