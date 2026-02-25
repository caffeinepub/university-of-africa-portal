# Specification

## Summary
**Goal:** Fix the "Unauthorized — admin only" error that occurs when authenticated admin users attempt to call privileged backend functions, and improve error messaging on the frontend.

**Planned changes:**
- Consolidate all admin role checks in `backend/main.mo` into a single `isAdmin(caller: Principal): Bool` helper function that reads from the stable profiles store used during registration.
- Replace all ad-hoc or duplicated inline role-check logic across admin-gated functions (addFeeItem, addCourse, registerStudent, updateAdmissionStatus, postResult, sendAnnouncement, approveHostelApplication, etc.) with calls to the shared helper.
- On the frontend, add a clear error toast or inline banner to FeeManagementPage, ProgrammeManagementPage, StudentManagementPage, ResultsManagementPage, MessagingPage, and HostelManagementPage when a backend mutation returns an authorization error, prompting the user to re-authenticate.

**User-visible outcome:** Admin users who have registered with the admin role can successfully perform all privileged actions (managing fees, courses, students, results, announcements, hostel applications) without receiving an unauthorized error. If an authorization failure does occur (e.g., expired session), a clear, human-readable message is displayed instead of a raw error string.
