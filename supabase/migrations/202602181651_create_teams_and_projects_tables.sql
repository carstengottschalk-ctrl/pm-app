-- Create teams and projects tables for PROJ-2: Project Management
-- This migration builds on the existing profiles table from PROJ-1

-- Teams table for team-based collaboration
-- For MVP: each user gets a personal team automatically
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Team members table (for future team collaboration)
CREATE TABLE IF NOT EXISTS team_members (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- Enable Row Level Security for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Projects table (main table for PROJ-2)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  estimated_budget NUMERIC(12, 2) NOT NULL CHECK (estimated_budget >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure end date is after start date
  CONSTRAINT end_date_after_start_date CHECK (end_date > start_date),

  -- Ensure project name is unique within a team
  CONSTRAINT unique_project_name_per_team UNIQUE (team_id, name)
);

-- Enable Row Level Security for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_teams_created_at ON teams(created_at);

CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_role ON team_members(role);

CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_end_date ON projects(end_date);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_team_status ON projects(team_id, status);

-- RLS Policies for teams
-- Users can view teams they are members of
CREATE POLICY "Users can view teams they belong to" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

-- Users can create teams (for personal team creation)
CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update teams they own
CREATE POLICY "Users can update teams they own" ON teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Users can delete teams they own
CREATE POLICY "Users can delete teams they own" ON teams
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- RLS Policies for team_members
-- Users can view team members for teams they belong to
CREATE POLICY "Users can view team members of their teams" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

-- Team owners can add/remove team members
CREATE POLICY "Team owners can manage team members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
    )
  );

-- RLS Policies for projects
-- Users can view projects from teams they belong to
CREATE POLICY "Users can view projects from their teams" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Users can create projects for teams they belong to
CREATE POLICY "Users can create projects for their teams" ON projects
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Users can update projects they created
CREATE POLICY "Users can update projects they created" ON projects
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can archive projects they created
CREATE POLICY "Users can archive projects they created" ON projects
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete projects they created
CREATE POLICY "Users can delete projects they created" ON projects
  FOR DELETE USING (auth.uid() = created_by);

-- Create function to automatically create personal team for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_team()
RETURNS TRIGGER AS $$
DECLARE
  new_team_id UUID;
BEGIN
  -- Create a personal team for the new user
  INSERT INTO public.teams (name, created_by)
  VALUES (NEW.email || '''s Team', NEW.id)
  RETURNING id INTO new_team_id;

  -- Add the user as owner of their personal team
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (new_team_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create personal team on user signup
-- This runs after the profile creation trigger from PROJ-1
CREATE OR REPLACE TRIGGER on_auth_user_created_team
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_team();

-- Create function to calculate project status based on dates
-- This function updates status to 'completed' if end_date has passed
-- Manual 'archived' status overrides this calculation
CREATE OR REPLACE FUNCTION public.update_project_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-update if status is not manually set to 'archived'
  IF NEW.status != 'archived' THEN
    IF CURRENT_DATE > NEW.end_date THEN
      NEW.status := 'completed';
    ELSIF CURRENT_DATE BETWEEN NEW.start_date AND NEW.end_date THEN
      NEW.status := 'active';
    ELSE
      NEW.status := 'active'; -- Future projects are also active
    END IF;
  END IF;

  -- Always update updated_at timestamp
  NEW.updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate project status on insert/update
CREATE OR REPLACE TRIGGER update_project_status_trigger
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_status();

-- Create function to update updated_at timestamp for teams
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update teams.updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_teams_updated_at();

-- Create function to update updated_at timestamp for projects
-- (projects already has update_project_status trigger that handles updated_at)

-- Create view for project statistics (useful for frontend)
CREATE OR REPLACE VIEW project_stats AS
SELECT
  p.id,
  p.name,
  p.start_date,
  p.end_date,
  p.estimated_budget,
  p.status,
  p.team_id,
  p.created_by,
  p.created_at,
  p.updated_at,
  -- Calculate duration in days
  (p.end_date - p.start_date) AS duration_days,
  -- Calculate days remaining (negative if completed)
  (p.end_date - CURRENT_DATE) AS days_remaining,
  -- Calculate progress percentage based on time elapsed
  CASE
    WHEN CURRENT_DATE < p.start_date THEN 0
    WHEN CURRENT_DATE > p.end_date THEN 100
    ELSE ROUND(
      (EXTRACT(EPOCH FROM (CURRENT_DATE - p.start_date)) /
       EXTRACT(EPOCH FROM (p.end_date - p.start_date))) * 100
    )
  END AS time_progress_percent
FROM projects p;

-- Grant access to the view
GRANT SELECT ON project_stats TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE teams IS 'Teams for project collaboration. Each user gets a personal team automatically.';
COMMENT ON TABLE team_members IS 'Team membership records linking users to teams with roles.';
COMMENT ON TABLE projects IS 'Projects for time and budget tracking. Each project belongs to a team.';
COMMENT ON COLUMN projects.status IS 'Project status: active (current), completed (end date passed), archived (manually archived).';
COMMENT ON VIEW project_stats IS 'Enhanced project view with calculated statistics for frontend display.';