# Specification

## Summary
**Goal:** Add a portal selection page and four role-specific login pages so that visitors are routed through a branded login experience before accessing any dashboard.

**Planned changes:**
- Add a `/portal` Portal Selection page displaying four cards (Student Portal, Staff Portal, Admin Portal, Parent Portal), each with a label, brief description, and an "Access Portal" button that navigates to the corresponding role login page.
- Add four dedicated role-branded login pages at `/login/student`, `/login/staff`, `/login/admin`, and `/login/parent`, each showing the role name, a short portal description, and a "Login with Internet Identity" button.
- After successful login on a role-specific page, redirect users with a matching existing profile directly to their role dashboard; for new users, open the existing `ProfileSetupModal` with the role pre-filled and locked to the corresponding role.
- If an authenticated user with a mismatched role lands on a role-specific login page, show a message and link to their actual dashboard.
- Update homepage portal cards and navigation links so unauthenticated visitors are routed to `/login/{role}` pages instead of protected dashboard routes; authenticated users with a confirmed role continue to be routed directly to their dashboards.

**User-visible outcome:** Visitors who click a portal entry point are taken to a role-specific branded login page where they authenticate via Internet Identity and are then seamlessly directed to their correct dashboard or guided through profile setup with their role pre-selected.
