<p align="center">
  <img src="./.github/readme-assets/signal.gif" alt="Animated signal / product visual for chatTOchat" width="100%" />
</p>

<h1 align="center">chatTOchat</h1>

<p align="center"><strong>A browser-only, single-page chat frontend that uses Firebase services for auth, realtime data, storage and analytics. The repository contains static HTML, CSS and ES module JavaScript files implementing room-based chat UI, presence/typing indicators, profile uploads, a "secret scanner" animation, markdown rendering, and particle effects.</strong></p>

<p align="center"><code>REPO//SIGNAL</code> · <code>SIGNAL / PRODUCT</code> · <code>LOOPING README EXPERIENCE</code></p>

## Live signal

| Lens | Readout |
| --- | --- |
| Portfolio lane | **SIGNAL / PRODUCT** |
| Code surface | **13** tracked files observed |
| Primary materials | **JavaScript, CSS, HTML** |
| Verification | **0** test-related files observed |

> A moving scan of the project surface. The animated frame above is a lightweight visual signature; the sections below remain the source of truth for implementation details.

## Motion map

`SIGNAL` → `SHAPE` → `RELEASE`

Use the animated banner as the first signal, then move into the implementation dossier. The recommended next step is to verify the documented setup command against the repository scripts before extending the project.

<details open>
<summary><strong>Open the full project dossier</strong></summary>

## Overview
chatTOchat (aka ModernChat) is implemented as a client-side web application. Core UI and application logic are organized into small ES modules that run in the browser and rely on Firebase (Auth, Realtime Database, Storage, Analytics) as the backend. The repository contains the static assets and client code but lacks server-side configuration and several required operational files.

## What it does
- Provides email/password and Google authentication (client-side logic in auth.js).
- Shows real-time, room-based chat using the Firebase Realtime Database (app.js + firebase-config.js).
- Supports user presence and typing indicators (referenced in app.js).
- Allows profile photo upload using Firebase Storage.
- Renders message content with markdown parsing and shows toast notifications.
- Offers a visual "secret message scanner" UI and matrix particle background animations.

## Key capabilities
- Email/password + Google sign-in flows (client-side).
- Room creation and room list UI.
- Realtime message sending/receiving via Firebase DB.
- Presence (online users) and typing indicators.
- Profile image upload to Firebase Storage.
- Markdown parsing for messages (utils.js.parseMarkdown).
- Toast notifications and animated UI elements (secret-scanner, matrix).
- Responsive styling with CSS (glassmorphism and custom variables).

## Technology
- Vanilla JavaScript ES modules (auth.js, app.js, utils.js, secret-scanner.js, etc.)
- Firebase JS SDK (client-side Auth, Realtime Database, Storage, Analytics)
- HTML5 and CSS3 (style.css, secret-scanner.css, decryption-styles.css)
- Browser Canvas APIs used for animations (matrix.js)

## Repository structure
Top-level files found in the repository:
- index.html — main entry (client-side SPA).
- chat.html — chat UI / room layout.
- app.js — core app logic and Realtime DB interactions.
- auth.js — authentication UI and logic.
- firebase-config.js — client Firebase configuration (contains project identifiers and measurementId; see notes below).
- utils.js — utilities (markdown parser, toasts, helpers).
- secret-scanner.js / secret-scanner.css / decryption-styles.css — "secret message" animated UI.
- matrix.js — particle/matrix background animation.
- style.css — main styling.
- Chat Application.docx.pdf — included document (contents not summarized here).

Note: Several JavaScript files appear truncated or contain redacted/malformed snippets as observed in the repository.

## Getting started
- There are no explicit setup or deployment instructions in the repository.
- The app is client-side only: the static files (index.html / chat.html and the JS/CSS) are intended to run in a browser. To inspect the app and its client code, open index.html or chat.html in a browser or serve the directory with any static HTTP server.
- To understand the Firebase integration and runtime expectations, inspect firebase-config.js, auth.js and app.js in the repository root.

If you plan to run the app locally, start by opening index.html in a browser and review console errors to identify missing or broken configuration (see Configuration and Development notes below).

## Configuration
- firebase-config.js contains the Firebase client configuration (project identifiers and measurementId). Client API keys are public by design, but the repository shows a malformed apiKey line (e.g., `apiKey=[REDACTED]"`) which will cause runtime failure unless corrected.
- There are no Firebase rules files (firebase.rules.json), no .firebaserc, and no firebase.json present in the repository. Backend security rules and hosting configuration are therefore not versioned here.
- No package.json, build scripts, or other dependency manifests are provided — the app is plain static files and ES modules.

Contributors should inspect:
- firebase-config.js for the client config and any redacted/malformed lines.
- auth.js and app.js for redacted placeholders and runtime logic that may need repair.
- utils.js for sanitization/markdown code and any uses of innerHTML.

## Development and quality notes
- Several files contain truncated snippets or redacted lines that currently make the code invalid (examples: malformed apiKey in firebase-config.js; a redacted password read expression in auth.js).
- The repo contains no tests, no linter/configuration, and no CI configuration. Expect to add linting, tests and basic CI as part of stabilizing the project.
- There are uses of innerHTML in places (renderCurrentUserAvatar, secret-scanner templates). While utils.parseMarkdown includes escaping, any innerHTML usage with untrusted content should be audited and refactored to safer DOM APIs where possible.
- No server-side enforcement (Firebase security rules) is present here, so repository review cannot confirm access restrictions or rate limits.

## Safety and responsible use
- The Firebase client config is present in firebase-config.js; client keys are expected to be public, but the repository lacks any Firebase rules files, so access controls are unknown. Review and commit restrictive Realtime Database and Storage rules before connecting a live project to real user data.
- The repository contains syntactic issues (malformed apiKey, redacted variable references) that will cause runtime failures until corrected.
- Audit any innerHTML usage and ensure message and input sanitization to prevent XSS.
- Do not deploy or connect to production Firebase resources until appropriate security rules and monitoring are in place.

## Contributing
This repository does not include a CONTRIBUTING.md. Suggested first steps for contributors:
- Clone the repository and open index.html / chat.html in a browser to reproduce current runtime behavior.
- Inspect firebase-config.js, auth.js and app.js for redacted/malformed lines and restore correct expressions or placeholders.
- Add Firebase rules files (firebase.rules.json) and any required project configuration (.firebaserc / firebase.json) to make security reviewable.
- Introduce a package.json and basic dev tooling (linters, formatters) and add tests for utility functions (e.g., utils.parseMarkdown).
- Replace unsafe innerHTML patterns with safer DOM construction, and add input validation where missing.

Be conservative about connecting to live Firebase projects until rules and access controls are added.

</details>

---

<p align="center"><sub>README motion system · visual layer by RepoSignal · implementation details remain project-specific</sub></p>
