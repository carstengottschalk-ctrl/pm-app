# Backend Implementation Test Plan

## Database Migration Test
1. Run the SQL migration in Supabase SQL Editor
2. Verify tables were created:
   - `teams`
   - `team_members`
   - `projects`
   - `project_stats` (view)
3. Verify RLS policies are enabled on all tables
4. Verify triggers were created:
   - `on_auth_user_created_team` (creates personal team)
   - `update_project_status_trigger` (auto-calculates status)

## API Endpoints Test
Test each endpoint with proper authentication:

### 1. GET /api/projects
```bash
curl -X GET "http://localhost:3000/api/projects" \
  -H "Authorization: Bearer <user-jwt-token>"
```

### 2. POST /api/projects
```bash
curl -X POST "http://localhost:3000/api/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user-jwt-token>" \
  -d '{
    "name": "Test Project",
    "description": "Test description",
    "start_date": "2026-02-19",
    "end_date": "2026-02-28",
    "estimated_budget": 5000
  }'
```

### 3. GET /api/projects/[id]
```bash
curl -X GET "http://localhost:3000/api/projects/<project-id>" \
  -H "Authorization: Bearer <user-jwt-token>"
```

### 4. PUT /api/projects/[id]
```bash
curl -X PUT "http://localhost:3000/api/projects/<project-id>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user-jwt-token>" \
  -d '{
    "name": "Updated Project Name"
  }'
```

### 5. DELETE /api/projects/[id]
```bash
curl -X DELETE "http://localhost:3000/api/projects/<project-id>" \
  -H "Authorization: Bearer <user-jwt-token>"
```

### 6. POST /api/projects/[id]/archive
```bash
curl -X POST "http://localhost:3000/api/projects/<project-id>/archive" \
  -H "Authorization: Bearer <user-jwt-token>"
```

### 7. GET /api/projects/stats
```bash
curl -X GET "http://localhost:3000/api/projects/stats" \
  -H "Authorization: Bearer <user-jwt-token>"
```

## Frontend Integration Test
1. Login to the application
2. Navigate to /projects
3. Create a new project using the form
4. Verify project appears in the list
5. Click on project to view details
6. Test archive functionality
7. Test delete functionality
8. Test search and filter functionality

## Security Tests
1. Try to access projects without authentication (should fail)
2. Try to access another user's projects (should fail due to RLS)
3. Try to update/delete projects you didn't create (should fail)

## Edge Cases to Test
1. Create project with duplicate name in same team (should fail)
2. Create project with end date before start date (should fail)
3. Create project with negative budget (should fail)
4. Archive already archived project (should fail)
5. Delete non-existent project (should fail)

## Performance Considerations
1. Projects list should load within 2 seconds
2. Project details should load within 1 second
3. Search/filter should be responsive
4. Database queries should use indexes