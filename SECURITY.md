# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 2.x     | ✅                 |
| 1.x     | ✅                 |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please **do not open a public issue**.

**Email**: [redacted for privacy]
**Subject**: `[SECURITY] TalentPulse - <brief description>`

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your contact for follow-up

## What We Patch

- Authentication / authorization bypass
- SQL injection
- XSS (stored/reflected)
- Insecure direct object references (IDOR)
- Secret exposure in environment or code
- CSRF
- Dependency vulnerabilities with active exploits

## What We Don't Patch

- Feature requests
- UI/UX improvements
- Performance optimization
- Dependencies without known exploits

## Response Timeline

- Acknowledge: within 48 hours
- Initial assessment: within 1 week
- Fix or decline: within 2 weeks
- Public disclosure: after fix is deployed (with your permission)

## Security Headers

The backend sets these headers on all responses:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy` (basic)
- `Strict-Transport-Security` (in prod)

## Third-Party Dependencies

We monitor dependencies via:
- `npm audit` (frontend)
- `pip audit` or `safety check` (backend)
- GitHub Dependabot alerts
