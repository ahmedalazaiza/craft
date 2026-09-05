# Email Specifications & Notification Backlog

This document captures email requirements requested during platform development to be designed and implemented in the dedicated Email Templates milestone.

---

## 1. Account Permanent Deletion Notice (`account_deleted_notice`)

- **Trigger**: When an administrator executes permanent deletion of a user account from the Dashboard (`admin_delete_user_complete`).
- **Recipient**: The email address of the deleted user (`auth.users.email`).
- **Timing**: Captured at the moment of deletion before or immediately after database purging.
- **Tone & Messaging Requirements**:
  - Clear, concise, and professional.
  - Inform the user that their account and associated profile on Layerat have been removed.
  - Do NOT over-explain internal administrative details or expose internal database mechanisms.
  - Provide a standard support/contact link if they believe this was done in error or require assistance.
- **Status**: **PENDING DESIGN & IMPLEMENTATION** (Explicitly deferred per user instruction until the email templates design phase).

---

## 2. Other Planned Transactional Emails
- Welcome / Email confirmation (`auth_verify_email`)
- Password reset request (`auth_reset_password`)
- New follower / Project appreciation digest (optional user preference)
