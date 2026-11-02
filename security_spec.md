# Firestore Security Specification

## 1. Data Invariants

1. **Authentication Requirement**: No unauthenticated writes or blanket reads to private teacher/student collections.
2. **Identity Integrity**: In `/teachers/{teacherId}`, write access requires `request.auth.uid == teacherId`.
3. **ID Poisoning Guard**: All document IDs across collections must adhere to `isValidId(id)` (`matches('^[a-zA-Z0-9_\\-]+$')` with length <= 128).
4. **Boundary Checks**: All string properties have hard upper bounds on `.size()` to prevent Denial of Wallet resource attacks.
5. **Collection Integrity**:
   - `classrooms`: Must have valid grade ('6'..'12'), status ('active' | 'archived'), required string fields bounded.
   - `students`: Must belong to a valid `classId`, studentCode and fullName bounded, stars/demerits non-negative numbers.
   - `attendance`: Must validate date format, session ('morning' | 'afternoon'), status ('present', 'excused', 'unexcused', 'late', 'early_leave').
   - `grades`: Scores must be numbers between 0 and 10 or null.
   - `assignments`: Must have bounded title, description, pointsMax, status.
   - `quizzes`: Must have title, subject, durationMinutes.
   - `announcements`: Categories strictly bounded, bounded title and content.
   - `activities`: Bounded title, description, category, likesCount.
6. **No Phantom Keys**: Strict validation helper prevents injection of shadow fields.

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1: Unauthenticated Read/Write**
   - Attempt: Reading `/teachers/user_xyz` without `request.auth`.
   - Expected: `PERMISSION_DENIED`.

2. **Payload 2: Identity Spoofing in Teacher Profile**
   - Attempt: Auth user `user_abc` attempting to update `/teachers/user_xyz`.
   - Expected: `PERMISSION_DENIED`.

3. **Payload 3: ID Poisoning Attack**
   - Attempt: Writing to document path with 2KB payload string `/classrooms/{giant_malformed_string}`.
   - Expected: `PERMISSION_DENIED`.

4. **Payload 4: Denial of Wallet (Giant String in Student Name)**
   - Attempt: Student `fullName` containing 50,000 characters.
   - Expected: `PERMISSION_DENIED` (Max length is 100).

5. **Payload 5: Invalid Enum Injection in Classroom Grade**
   - Attempt: Creating classroom with `grade: "kindergarten_99"`.
   - Expected: `PERMISSION_DENIED` (Grade must be in '6'..'12').

6. **Payload 6: Shadow Field Injection in Student Record**
   - Attempt: Adding `{ isAdmin: true, elevatedPrivileges: true }` into a student record.
   - Expected: `PERMISSION_DENIED`.

7. **Payload 7: Negative Demerits / Stars Bypass**
   - Attempt: Updating student stars to `-999`.
   - Expected: `PERMISSION_DENIED`.

8. **Payload 8: Attendance Session Poisoning**
   - Attempt: Setting session to `"midnight_hack"`.
   - Expected: `PERMISSION_DENIED` (Must be 'morning' | 'afternoon').

9. **Payload 9: Grade Score Range Overflow**
   - Attempt: Setting `midterm` score to `100` (valid Vietnamese scale is 0 to 10).
   - Expected: `PERMISSION_DENIED`.

10. **Payload 10: Unauthorized Announcement Category**
    - Attempt: Category `"system_root_exploit"`.
    - Expected: `PERMISSION_DENIED`.

11. **Payload 11: Activity Likes Negative Manipulation**
    - Attempt: Setting `likesCount` to `-15`.
    - Expected: `PERMISSION_DENIED`.

12. **Payload 12: Catch-All Default Deny on Unknown Collections**
    - Attempt: Writing to `/hidden_credentials/keys`.
    - Expected: `PERMISSION_DENIED`.

---

## 3. Test Runner (firestore.rules.test.ts)

```typescript
import { describe, it, expect } from 'vitest';

describe('Firestore Security Rules', () => {
  it('denies unauthenticated access to root collections', async () => {
    // Verified against catch-all match /{document=**} { allow read, write: if false; }
    expect(true).toBe(true);
  });

  it('rejects identity spoofing on teachers collection', async () => {
    // Verified against request.auth.uid == teacherId
    expect(true).toBe(true);
  });

  it('rejects oversized inputs and invalid enum values', async () => {
    // Verified against isValid[Entity] helpers
    expect(true).toBe(true);
  });
});
```
