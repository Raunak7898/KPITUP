# API & Integration Guide

The KPIT system communicates with a Supabase PostgreSQL backend using the PostgREST interface. This guide outlines the primary integration patterns.

## 🔑 Authentication Flow

All requests must be authenticated. The client initializes the session using:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: '...',
  password: '...',
});
```
The session JWT is automatically attached to subsequent database queries by the client.

## 📊 Database Interaction Patterns

### 1. Complex Joins (Fetching Projects)
We use a nested selection string to fetch related data in a single round-trip:
```typescript
const { data } = await supabase
  .from('projects')
  .select(`
    *,
    project_members(*, profiles(*)),
    tasks(*)
  `)
  .order('created_at', { ascending: false });
```

### 2. Transactional Workflows (Task Review)
Since `reviewTask` updates a task AND inserts a review, we perform these sequentially.
- **Update Task**: Change status to `done` or back to `in_progress`.
- **Insert Review**: Log the comment and decision in `task_reviews`.

### 3. Upsert Logic (Member Linking)
To prevent duplicate membership records, we use `upsert` with an `onConflict` constraint:
```typescript
await supabase
  .from('project_members')
  .upsert(
    { project_id: '...', profile_id: '...' },
    { onConflict: 'project_id,profile_id' }
  );
```

## 🛡 Error Handling Standards

| Error Code | Meaning | Handling Strategy |
| :--- | :--- | :--- |
| `42P17` | Infinite Recursion | Audit RLS policies for circular subqueries. |
| `23505` | Unique Violation | Inform the user (e.g., "Member already in project"). |
| `42501` | Permission Denied | Check RLS policies for the current authenticated role. |
| `PGRST116` | No rows returned | Check `.single()` vs `.maybeSingle()`. |

## 🚀 Performance Notes
- **Selective Fetching**: Only columns required for the UI are selected in high-frequency queries.
- **Resilient Fallbacks**: The `fetchProjects` method includes a fallback to a simpler query if the full schema (including tasks) is partially unavailable during migrations.
