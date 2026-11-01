# Security Policy

## Supported versions

Dottle is a continuously deployed web app, so only the current version at https://dottle.pages.dev is supported.

## Reporting a vulnerability

Please don't post vulnerability details in a public issue. Instead, [open an issue](https://github.com/zy0x1337/dottle/issues/new) that only says you have a security report, and the maintainer will set up a private way to share the details.

Helpful details to have ready:

- What the problem is and what an attacker could do with it
- Steps to reproduce
- Affected browsers or devices

## Scope

Dottle has no backend or user accounts, and sprites stay in the browser's `localStorage`. The most relevant issues are therefore in the client: script injection through imported files or sprite names, problems in the service worker or its caching, and vulnerable dependencies.
