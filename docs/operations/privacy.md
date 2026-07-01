# Privacy Notes

Thought Log has two storage paths.

Local-only entries stay in the browser's IndexedDB storage and user-exported files. They should not be sent to Supabase, server actions, analytics, or application logs.

Cloud history entries are saved only after the user chooses cloud save and is signed in. Supabase row-level security scopes each row to the authenticated `user_id`.

The app does not provide medical advice, diagnosis, AI interpretation, or crisis support.
