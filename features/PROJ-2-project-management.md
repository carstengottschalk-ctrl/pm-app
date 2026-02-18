# PROJ-2: Project Management

**Status:** 🔵 Planned
**Created:** 2026-02-18
**Last Updated:** 2026-02-18
**Dependencies:** PROJ-1 (User Authentication) - requires logged-in user

## User Stories

1. **As a** project manager **I want to** create a new project **so that** I can start tracking time and budget for it.
2. **As a** team member **I want to** view all projects I'm associated with **so that** I can select where to log my time.
3. **As a** project manager **I want to** edit project details (name, dates, budget) **so that** I can keep information up to date.
4. **As a** project manager **I want to** delete projects that are no longer active **so that** the list stays clean.
5. **As a** team member **I want to** see project status (active/archived) **so that** I know which projects are currently running.

## Acceptance Criteria

### Project Creation
- [ ] Logged-in user can access "Create Project" button/form
- [ ] Form includes: project name (required), start date (required), end date (required), estimated budget (required, numeric)
- [ ] Project name must be unique within the user's team/organization
- [ ] Start date must be today or in the future (can be adjusted for historical projects)
- [ ] End date must be after start date
- [ ] Estimated budget must be positive number
- [ ] Successful creation shows confirmation and redirects to project list
- [ ] Project duration in days is automatically calculated (end date - start date)

### Project List
- [ ] User sees a list of all projects they have access to
- [ ] Each project shows: name, start date, end date, duration, estimated budget
- [ ] Projects are sorted by start date (newest first) by default
- [ ] User can filter projects by status (active, archived)
- [ ] User can search projects by name

### Project Details View
- [ ] Clicking a project opens its detail view
- [ ] Detail view shows all project fields and calculated values (duration, spent budget, remaining budget - once PROJ-4 is implemented)
- [ ] User can see time entries logged against this project (once PROJ-3 is implemented)

### Project Editing
- [ ] Project creator/manager can edit project details
- [ ] Editing form pre-fills existing values
- [ ] Validation rules same as creation
- [ ] Successful edit updates the project without changing its ID or time entries

### Project Deletion
- [ ] Project creator/manager can delete a project
- [ ] Deletion requires confirmation ("Are you sure? This will also delete all time entries for this project.")
- [ ] Deletion is soft delete (mark as archived) for MVP, hard delete for simplicity
- [ ] Deleted projects disappear from active lists

### Project Status
- [ ] Projects automatically marked as "active" if current date between start and end date
- [ ] Projects automatically marked as "completed" if end date has passed
- [ ] User can manually archive projects

## Edge Cases

1. **Duplicate project names**: What if two projects have the same name?
   - Allow duplicates but show warning: "A project with this name already exists. Consider using a unique name."

2. **Date changes affecting time entries**: What if project end date is moved earlier than existing time entries?
   - Show warning: "New end date is before some time entries. Those entries will still be associated but may appear outside project timeline."

3. **Budget updates after time entries**: What if estimated budget is reduced below already spent amount?
   - Show warning: "New budget is less than already spent amount. Spent budget: X, New budget: Y."

4. **Concurrent edits**: What if two users edit the same project simultaneously?
   - Last write wins with optimistic locking (simple MVP approach).

5. **Large project lists**: What if a user has 100+ projects?
   - Implement pagination or virtual scrolling.

6. **Invalid date formats**: What if user enters "2026-13-45"?
   - Date picker prevents invalid dates; backend validates.

7. **Project without time entries**: How does spent budget calculation work?
   - Spent budget shows 0 until time entries are logged.

8. **User leaves team**: What happens to their projects?
   - Projects remain associated with team; team lead can reassign.

## Tech Design (to be added by Solution Architect)

*To be filled by `/architecture` skill*

## Dependencies
- **PROJ-1 (User Authentication)**: Must be completed first
- **PROJ-3 (Time Tracking)**: For viewing time entries per project
- **PROJ-4 (Budget Tracking)**: For spent/remaining budget calculations

## QA Test Results (to be added by QA Engineer)

*To be filled by `/qa` skill*

## Deployment (to be added by DevOps Engineer)

*To be filled by `/deploy` skill*