# PROJ-3: Time Tracking

**Status:** 🔵 Planned
**Created:** 2026-02-18
**Last Updated:** 2026-02-18
**Dependencies:** PROJ-1 (User Authentication), PROJ-2 (Project Management)

## User Stories

1. **As a** team member **I want to** log time against a specific project **so that** my work hours are tracked for billing and budgeting.
2. **As a** team member **I want to** view my past time entries **so that** I can review what I worked on and when.
3. **As a** project manager **I want to** see time entries for all team members on a project **so that** I can monitor progress and budget consumption.
4. **As a** user **I want to** edit or delete my time entries **so that** I can correct mistakes.
5. **As a** user **I want to** quickly log time for today with default values **so that** tracking is fast and convenient.

## Acceptance Criteria

### Time Entry Creation
- [ ] Logged-in user can access "Log Time" button/form
- [ ] Form includes: project selection (dropdown of user's accessible projects), date (default today), hours (decimal, e.g., 1.5), description (optional)
- [ ] Project selection is required
- [ ] Date cannot be in the future (can be adjusted for historical entries)
- [ ] Hours must be positive number (0.25 minimum, 24 maximum per entry)
- [ ] Description supports basic text (max 500 characters)
- [ ] Successful creation shows confirmation and updates project spent budget (once PROJ-4 implemented)
- [ ] User can create multiple entries for same project on same day

### Time Entry List
- [ ] User sees a list of their own time entries
- [ ] Each entry shows: project name, date, hours, description, calculated cost (once hourly rate implemented)
- [ ] Entries sorted by date (newest first)
- [ ] User can filter by project, date range (this week, this month, custom)
- [ ] User can see total hours per day/week/month

### Project Time View
- [ ] In project detail view, user sees all time entries for that project
- [ ] Entries grouped by user and date
- [ ] Shows total hours per user and overall project total
- [ ] Project managers can see all users' entries; team members see only their own

### Time Entry Editing
- [ ] User can edit their own time entries
- [ ] Editing form pre-fills existing values
- [ ] Same validation rules as creation
- [ ] Successful edit recalculates project spent budget (PROJ-4)

### Time Entry Deletion
- [ ] User can delete their own time entries
- [ ] Deletion requires confirmation
- [ ] Successful deletion recalculates project spent budget (PROJ-4)

### Quick Log
- [ ] User has "Quick Log" option with pre-filled: current date, last used project, 1 hour default
- [ ] Quick log requires only hours and description (project remembered)
- [ ] One-click submission

## Edge Cases

1. **Time entry overlaps**: What if user logs 10 hours in a single day?
   - Allow but show warning if total exceeds 24 hours: "You've logged X hours today. Are you sure?"

2. **Historical entries**: What if user logs time for a date before project start date?
   - Allow but show warning: "This date is before project start date."

3. **Project completion**: What if user logs time for a project after its end date?
   - Allow but show warning: "This date is after project end date."

4. **Decimal hours**: What if user enters "1.75" hours?
   - Convert to minutes (1.75 = 1h 45m) for display.

5. **Concurrent edits**: What if two users edit same time entry (shared project)?
   - Not applicable; users can only edit their own entries.

6. **Deleted project**: What happens to time entries if project is deleted?
   - Time entries are also deleted (cascade) or marked as orphaned.

7. **Large time entry lists**: What if user has 1000+ entries?
   - Implement pagination with date-based filtering.

8. **Offline logging**: What if user loses internet while submitting?
   - Show error and allow retry; consider local storage for offline support (future enhancement).

9. **Hourly rate changes**: How are costs calculated if hourly rate changes?
   - Use rate at time of entry creation (store with entry).

## Tech Design (to be added by Solution Architect)

*To be filled by `/architecture` skill*

## Dependencies
- **PROJ-1 (User Authentication)**: Must be completed first
- **PROJ-2 (Project Management)**: Requires projects to exist
- **PROJ-4 (Budget Tracking)**: Time entries affect spent budget calculation

## QA Test Results (to be added by QA Engineer)

*To be filled by `/qa` skill*

## Deployment (to be added by DevOps Engineer)

*To be filled by `/deploy` skill*