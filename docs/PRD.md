# Product Requirements Document

## Vision
A project management app for small teams that tracks time and budget across projects. The app provides visibility into project spending versus budget and enables accurate time tracking by team members.

## Target Users
- **Team leads / project managers**: Responsible for planning, budgeting, and monitoring projects
- **Team members / employees**: Work on projects and need to log their time against specific projects

## Core Features (Roadmap)

| Priority | Feature | Status | Description |
|----------|---------|--------|-------------|
| P0 (MVP) | PROJ-1: User Authentication | Planned | Sign up, login, logout, password reset for team members |
| P0 (MVP) | PROJ-2: Project Management | Planned | Create, view, edit, delete projects with name, start/end dates, estimated budget |
| P0 (MVP) | PROJ-3: Time Tracking | Planned | Log time against projects with date, duration, description |
| P0 (MVP) | PROJ-4: Budget Tracking | Planned | Automated calculations: spent budget (from time entries), remaining budget, project duration |
| P1 | PROJ-5: Project Dashboard | Planned | Overview of all projects with status, budget health, and quick actions |
| P1 | PROJ-6: Reports & Analytics | Planned | Time spent per project, budget utilization reports, team productivity |
| P2 | PROJ-7: User Roles & Permissions | Planned | Different access levels for team members vs. project managers |
| P2 | PROJ-8: Notifications & Reminders | Planned | Email notifications for overdue time entries, budget alerts |

## Success Metrics
- Number of active projects created per team
- Number of time entries logged per week
- Budget accuracy (estimated vs. actual spending)
- User adoption rate (percentage of team members logging time regularly)

## Constraints
- **Backend required**: User accounts, multi-user support, data persistence (Supabase PostgreSQL + Auth)
- **Timeline**: MVP within 2-3 weeks, full feature set within 1-2 months
- **Budget**: Utilize free tiers (Supabase, Vercel) to minimize costs
- **Team size**: Solo developer or small team implementation

## Non-Goals
- Advanced collaboration features (chat, file sharing)
- Invoice generation and billing
- Integration with third-party tools (Slack, Jira, etc.)
- Mobile apps (web-first, responsive design)
- Complex project planning (Gantt charts, dependencies)

---

Use `/requirements` to create detailed feature specifications for each item in the roadmap above.