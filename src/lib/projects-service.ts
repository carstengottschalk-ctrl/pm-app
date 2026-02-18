import { supabase } from './supabase';
import { z } from 'zod';
import { sanitizeInput } from './security';

// Zod schemas for validation
export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
  estimated_budget: z.coerce.number().positive('Budget must be a positive number'),
});

export const updateProjectSchema = projectSchema.partial();

export type ProjectInput = z.infer<typeof projectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// Interface for project data returned from database
export interface Project {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  estimated_budget: number;
  status: 'active' | 'completed' | 'archived';
  team_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Interface for project with calculated stats
export interface ProjectWithStats extends Project {
  duration_days: number;
  days_remaining: number;
  time_progress_percent: number;
}

// Service class for project operations
export class ProjectsService {
  /**
   * Get all projects for the current user
   */
  static async getProjects(options?: {
    status?: 'active' | 'completed' | 'archived';
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const { status, search, limit = 50, offset = 0 } = options || {};

    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data as Project[];
  }

  /**
   * Get a single project by ID
   */
  static async getProjectById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return data as Project;
  }

  /**
   * Get project with calculated statistics
   */
  static async getProjectWithStats(id: string) {
    const { data, error } = await supabase
      .from('project_stats')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project stats:', error);
      throw new Error(`Failed to fetch project stats: ${error.message}`);
    }

    return data as ProjectWithStats;
  }

  /**
   * Create a new project
   */
  static async createProject(projectData: ProjectInput) {
    // Validate input
    const validatedData = projectSchema.parse(projectData);

    // Sanitize string inputs to prevent XSS
    const sanitizedData = {
      ...validatedData,
      name: sanitizeInput(validatedData.name),
      description: validatedData.description ? sanitizeInput(validatedData.description) : undefined,
    };

    // Get current user's session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Get user's personal team
    const { data: teamData, error: teamError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', session.user.id)
      .eq('role', 'owner')
      .single();

    if (teamError) {
      console.error('Error fetching user team:', teamError);
      throw new Error('Failed to find user team. Please try again.');
    }

    // Check for duplicate project name within the team
    const isDuplicate = await this.checkDuplicateProjectName(
      sanitizedData.name,
      teamData.team_id,
      session.user.id
    );
    if (isDuplicate) {
      throw new Error(`A project with the name "${sanitizedData.name}" already exists in your team. Please choose a different name.`);
    }

    // Create the project
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...sanitizedData,
        team_id: teamData.team_id,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data as Project;
  }

  /**
   * Check if a project name already exists in the user's team
   */
  static async checkDuplicateProjectName(
    name: string,
    teamId: string,
    userId: string,
    excludeProjectId?: string
  ) {
    let query = supabase
      .from('projects')
      .select('id, name')
      .eq('team_id', teamId)
      .eq('name', name);

    if (excludeProjectId) {
      query = query.neq('id', excludeProjectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking duplicate project name:', error);
      throw new Error('Failed to check duplicate project name');
    }

    return data.length > 0;
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, updateData: UpdateProjectInput) {
    // Validate input
    const validatedData = updateProjectSchema.parse(updateData);

    // Sanitize string inputs to prevent XSS
    const sanitizedData = { ...validatedData };
    if (sanitizedData.name !== undefined) {
      sanitizedData.name = sanitizeInput(sanitizedData.name);
    }
    if (sanitizedData.description !== undefined) {
      sanitizedData.description = sanitizeInput(sanitizedData.description);
    }

    // Get current user's session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Verify the user owns this project
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('created_by, team_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching project for update:', fetchError);
      throw new Error('Project not found');
    }

    if (existingProject.created_by !== session.user.id) {
      throw new Error('You do not have permission to update this project');
    }

    // Check for duplicate project name within the team (excluding current project)
    if (sanitizedData.name !== undefined) {
      const isDuplicate = await this.checkDuplicateProjectName(
        sanitizedData.name,
        existingProject.team_id,
        session.user.id,
        id
      );
      if (isDuplicate) {
        throw new Error(`A project with the name "${sanitizedData.name}" already exists in your team. Please choose a different name.`);
      }
    }

    // Update the project
    const { data, error } = await supabase
      .from('projects')
      .update(sanitizedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return data as Project;
  }

  /**
   * Archive a project (soft delete)
   */
  static async archiveProject(id: string) {
    // Get current user's session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Verify the user owns this project
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('created_by, status, team_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching project for archive:', fetchError);
      throw new Error('Project not found');
    }

    if (existingProject.created_by !== session.user.id) {
      throw new Error('You do not have permission to archive this project');
    }

    if (existingProject.status === 'archived') {
      throw new Error('Project is already archived');
    }

    // Archive the project
    const { data, error } = await supabase
      .from('projects')
      .update({ status: 'archived' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error archiving project:', error);
      throw new Error(`Failed to archive project: ${error.message}`);
    }

    return data as Project;
  }

  /**
   * Delete a project (hard delete - use with caution)
   */
  static async deleteProject(id: string) {
    // Get current user's session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Verify the user owns this project
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('created_by, team_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching project for delete:', fetchError);
      throw new Error('Project not found');
    }

    if (existingProject.created_by !== session.user.id) {
      throw new Error('You do not have permission to delete this project');
    }

    // Delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }

    return true;
  }

  /**
   * Get project statistics for the current user
   */
  static async getProjectStats() {
    const { data, error } = await supabase
      .from('project_stats')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project stats:', error);
      throw new Error(`Failed to fetch project statistics: ${error.message}`);
    }

    return data as ProjectWithStats[];
  }

  /**
   * Get counts by status for the current user
   */
  static async getProjectCounts() {
    const { data, error } = await supabase
      .from('projects')
      .select('status');

    if (error) {
      console.error('Error fetching project counts:', error);
      throw new Error(`Failed to fetch project counts: ${error.message}`);
    }

    const counts = {
      active: 0,
      completed: 0,
      archived: 0,
      total: data.length,
    };

    data.forEach(project => {
      counts[project.status as keyof typeof counts] += 1;
    });

    return counts;
  }
}