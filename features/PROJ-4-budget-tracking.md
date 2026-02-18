# PROJ-4: Budget Tracking

**Status:** 🔵 Planned
**Created:** 2026-02-18
**Last Updated:** 2026-02-18
**Dependencies:** PROJ-1 (User Authentication), PROJ-2 (Project Management), PROJ-3 (Time Tracking)

## User Stories

1. **As a** project manager **I want to** see real-time budget consumption for each project **so that** I can monitor spending against estimates.
2. **As a** team member **I want to** see how much budget is remaining on projects I work on **so that** I can plan my time accordingly.
3. **As a** user **I want to** view calculated metrics: project duration, spent budget, remaining budget, budget utilization percentage **so that** I have a clear financial overview.
4. **As a** project manager **I want to** receive alerts when projects approach or exceed budget **so that** I can take corrective action.
5. **As a** user **I want to** see budget trends over time **so that** I can forecast future spending.

## Acceptance Criteria

### Budget Calculations
- [ ] Project duration is automatically calculated: (end date - start date) in days
- [ ] Spent budget is calculated from time entries: sum(hours * hourly rate) per project
- [ ] Hourly rate is stored per user (default for MVP: fixed rate for all users, e.g., €50/hour)
- [ ] Remaining budget is calculated: estimated budget - spent budget
- [ ] Budget utilization percentage: (spent budget / estimated budget) * 100
- [ ] Calculations update in real-time when time entries are added/edited/deleted
- [ ] All calculations are performed server-side for accuracy

### Budget Display
- [ ] Project list shows: estimated budget, spent budget, remaining budget for each project
- [ ] Project detail view shows all budget metrics with visual indicators
- [ ] Visual indicators: green (under 80% utilization), yellow (80-100%), red (over 100%)
- [ ] Budget metrics formatted as currency (€X,XXX.XX)
- [ ] Utilization percentage shown with progress bar

### Budget Alerts
- [ ] Visual warning when project reaches 80% budget utilization
- [ ] Visual warning when project reaches 100% budget utilization (over budget)
- [ ] Alert icon next to project name in lists
- [ ] Project managers see alerts; team members see only basic metrics

### Budget Reports
- [ ] User can view budget report per project showing daily/weekly spending trends
- [ ] Report shows: estimated vs. actual spending over time
- [ ] Export option (CSV) for budget data (future enhancement)

### Hourly Rate Management
- [ ] Project managers can set default hourly rate for all team members (MVP)
- [ ] Future: individual hourly rates per user
- [ ] Hourly rate used for all new time entry calculations

## Edge Cases

1. **Zero estimated budget**: What if project has €0 estimated budget?
   - Show "No budget set" instead of division by zero errors.

2. **Negative remaining budget**: What if spent exceeds estimated?
   - Show negative amount in red: "-€X,XXX.XX (over budget)"

3. **Historical rate changes**: How are existing time entries affected if hourly rate changes?
   - Use rate at time of entry creation (store with entry); recalculations only for new entries.

4. **Currency formatting**: What if user is in different currency locale?
   - Use € for MVP; support multiple currencies in future.

5. **Very large budgets**: What if budget is €1,000,000?
   - Format with thousand separators: €1,000,000.00

6. **Very small budgets**: What if budget is €0.50?
   - Format with two decimal places: €0.50

7. **Project without time entries**: What is spent budget?
   - Show €0.00 spent, 0% utilization.

8. **Time entry deletion**: How does it affect budget?
   - Recalculate spent budget immediately.

9. **Concurrent time entries**: What if two users log time simultaneously?
   - Database transaction ensures correct sum.

10. **Data consistency**: What if calculation seems wrong?
    - Provide "Recalculate" button for project managers to force refresh.

## Tech Design (to be added by Solution Architect)

*To be filled by `/architecture` skill*

## Dependencies
- **PROJ-1 (User Authentication)**: Must be completed first
- **PROJ-2 (Project Management)**: Requires projects with estimated budget
- **PROJ-3 (Time Tracking)**: Requires time entries to calculate spent budget

## Implementation Notes
- Budget calculations should be optimized (cached, computed columns)
- Consider database triggers or materialized views for performance
- All financial calculations must be accurate (decimal types, not floats)

## QA Test Results (to be added by QA Engineer)

*To be filled by `/qa` skill*

## Deployment (to be added by DevOps Engineer)

*To be filled by `/deploy` skill*