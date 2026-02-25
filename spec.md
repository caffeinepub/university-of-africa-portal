# Specification

## Summary
**Goal:** Add a portal access application system with ID/password login to the University of Africa Portal, allowing students, staff, parents, and admins to apply for portal access and receive role-specific credentials upon admin approval.

**Planned changes:**
- Add a `PortalAccessApplication` stable data type in the Motoko backend with fields for applicant info, role, status, generated ID, and password; store in a stable HashMap
- Implement backend functions: `submitPortalAccessApplication`, `approvePortalAccessApplication` (generates role-specific IDs like MATRIC/2024/XXXX, STAFF-XXXX, etc., and a random password), `rejectPortalAccessApplication`, `getPortalAccessApplications`, `getMyPortalAccessApplication`, and `loginWithIdAndPassword`
- Create a public `/apply` page (`PortalAccessApplicationPage.tsx`) with a form for Full Name, Email, Role, and Programme/Department, using the deep navy and gold theme
- Create an admin `AccessApplicationsPage.tsx` at `/admin/access-applications` (RoleGuard-protected) showing all applications in a table with Approve/Reject actions; on approval, display a modal/toast with the generated ID and password
- Create an `/id-login` page (`IdPasswordLoginPage.tsx`) with university logo, role selector, ID field (dynamic placeholder), and password field; on success redirect to the role-specific dashboard
- Add React Query hooks in `useQueries.ts` for all new backend functions following existing patterns
- Add "Apply for Access" and "ID Login" links to the public navigation bar
- Add a call-to-action banner on the homepage linking to `/apply` and `/id-login`
- Add links to `/apply` and `/id-login` beneath the four portal cards on the Portal Selection page (`/portal`)
- Add a link to "Access Applications" in the Admin Dashboard sidebar

**User-visible outcome:** New users can submit a portal access application; admins can approve or reject applications and view generated credentials; approved users can log in with their role-specific ID and password at `/id-login` and be redirected to their respective dashboard, all without disrupting the existing Internet Identity login flow.
