import { useState, useCallback } from 'react';
import { Project } from '@/components/project-card';
import { toast } from './use-toast';

// Extended project interface to match API response
export interface ApiProject extends Omit<Project, 'start_date' | 'end_date' | 'created_at' | 'updated_at'> {
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  team_id: string;
  created_by: string;
}

// Convert API project to frontend project
const convertApiProject = (apiProject: ApiProject): Project => ({
  ...apiProject,
  start_date: new Date(apiProject.start_date),
  end_date: new Date(apiProject.end_date),
  created_at: new Date(apiProject.created_at),
  updated_at: new Date(apiProject.updated_at),
});

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all projects
  const fetchProjects = useCallback(async (options?: {
    status?: 'active' | 'completed' | 'archived';
    search?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.search) params.append('search', options.search);

      const response = await fetch(`/api/projects?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch projects');
      }

      const data = await response.json();
      const convertedProjects = data.projects.map(convertApiProject);
      setProjects(convertedProjects);
      return convertedProjects;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single project
  const fetchProject = useCallback(async (id: string, withStats = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (withStats) params.append('withStats', 'true');

      const response = await fetch(`/api/projects/${id}?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch project');
      }

      const data = await response.json();
      return convertApiProject(data.project);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch project';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create project
  const createProject = useCallback(async (projectData: {
    name: string;
    description?: string;
    start_date: Date;
    end_date: Date;
    estimated_budget: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert dates to ISO strings for API
      const apiData = {
        ...projectData,
        start_date: projectData.start_date.toISOString().split('T')[0],
        end_date: projectData.end_date.toISOString().split('T')[0],
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const data = await response.json();
      const newProject = convertApiProject(data.project);

      // Update local state
      setProjects(prev => [newProject, ...prev]);

      toast({
        title: 'Success',
        description: `Project "${projectData.name}" created successfully.`,
      });

      return newProject;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update project
  const updateProject = useCallback(async (id: string, projectData: Partial<{
    name: string;
    description?: string;
    start_date: Date;
    end_date: Date;
    estimated_budget: number;
  }>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert dates to ISO strings if provided
      const apiData: any = { ...projectData };
      if (projectData.start_date) {
        apiData.start_date = projectData.start_date.toISOString().split('T')[0];
      }
      if (projectData.end_date) {
        apiData.end_date = projectData.end_date.toISOString().split('T')[0];
      }

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }

      const data = await response.json();
      const updatedProject = convertApiProject(data.project);

      // Update local state
      setProjects(prev => prev.map(p =>
        p.id === id ? updatedProject : p
      ));

      toast({
        title: 'Success',
        description: `Project "${updatedProject.name}" updated successfully.`,
      });

      return updatedProject;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update project';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Archive project
  const archiveProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${id}/archive`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to archive project');
      }

      const data = await response.json();
      const archivedProject = convertApiProject(data.project);

      // Update local state
      setProjects(prev => prev.map(p =>
        p.id === id ? archivedProject : p
      ));

      toast({
        title: 'Success',
        description: `Project "${archivedProject.name}" archived successfully.`,
      });

      return archivedProject;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive project';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete project
  const deleteProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      // Update local state
      setProjects(prev => prev.filter(p => p.id !== id));

      toast({
        title: 'Success',
        description: 'Project deleted successfully.',
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch project statistics
  const fetchProjectStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects/stats');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch project statistics');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch project statistics';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    archiveProject,
    deleteProject,
    fetchProjectStats,
  };
}