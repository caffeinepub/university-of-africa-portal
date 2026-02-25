# Specification

## Summary
**Goal:** Fix admin data entry persistence for students, fees, and courses; add Nigerian Naira currency formatting across all fee-related pages; and implement role-based service menus in the navigation sidebar for all user roles.

**Planned changes:**
- Fix Motoko backend `addFeeItem`, `addCourse`, and student creation/profile-update functions to correctly write to stable state and return all stored records reliably.
- Wire `FeeManagementPage`, `ProgrammeManagementPage`, and `StudentManagementPage` forms to their respective backend mutation hooks so submitted data is saved to the backend and lists refresh immediately after submission.
- Clear form fields and show success/error toast messages after each submission attempt.
- Apply Nigerian Naira (₦) formatting with comma thousand separators (`en-NG` locale via `Intl.NumberFormat`) to all fee-related amount fields and displays on `FeeManagementPage`, `FeeStatementPage`, `PaymentHistoryPage`, `ReceiptPage`, and any other page showing monetary values.
- Update the navigation sidebar/menu to display a contextual list of role-specific service links after login:
  - **Student:** Course Registration, Fee Statement, Results, Transcript, Hostel Application, Payment History, Announcements.
  - **Staff:** My Profile, Assigned Courses, Enrolled Students, Announcements, Exams & Records Portal.
  - **Parent:** Linked Student Overview, Student Results, Fee Status, Course Registrations.
  - **Admin:** Manage Students, Manage Staff, Manage Courses/Programmes, Manage Fees, Admissions, Results Management, Hostel Applications, Messaging/Announcements, Exams & Records Portal.
- Ensure service menu links are hidden from unauthenticated users and that each role only sees their own services.

**User-visible outcome:** Admins can successfully add students, fees, and courses that persist across page reloads. All monetary values display with ₦ and thousand separators. Every logged-in user sees a tailored sidebar menu listing all services available to their role.
