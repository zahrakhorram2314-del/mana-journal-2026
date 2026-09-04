# Security Specification

## 1. Data Invariants
- A journal entry cannot exist without a valid userId that belongs to the user.
- A user can only access their own journal entries.
- CreatedAt must be server-timestamp and immutable.

## 2. The "Dirty Dozen" Payloads (Examples)
1. { "userId": "attacker", "entry": "...", ... } (Attempting to write to other user)
2. { "userId": "me", "entry": "...", "createdAt": "2020-01-01" } (Spoofing createdAt)
3. { "userId": "me", "entry": "...", "ghostField": "true" } (Ghost field injection)
... (etc)
