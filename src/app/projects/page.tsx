'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { ProjectList } from '@/components/project-list';
import { ProjectForm } from '@/components/project-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Project } from '@/components/project-card';
import { useProjects } from '@/hooks/use-projects';

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    fetchProjects,
    createProject,
    updateProject,
    archiveProject,
    deleteProject,
  } = useProjects();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<{
    status?: 'active' | 'completed' | 'archived';
    search?: string;
  }>({});

  // Fetch projects on mount and when filters change
  useEffect(() => {
    fetchProjects(filters);
  }, [filters, fetchProjects]);

  const handleCreateProject = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createProject(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Error is already handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (data: any) => {
    if (!editingProject) return;

    setIsSubmitting(true);
    try {
      await updateProject(editingProject.id, data);
      setEditingProject(null);
    } catch (error) {
      // Error is already handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProject = async (project: Project) => {
    setEditingProject(project);
  };

  const handleArchiveProject = async (project: Project) => {
    if (window.confirm(`Are you sure you want to archive "${project.name}"?`)) {
      try {
        await archiveProject(project.id);
      } catch (error) {
        // Error is already handled by the hook
      }
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        await deleteProject(project.id);
      } catch (error) {
        // Error is already handled by the hook
      }
    }
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleStatusFilter = (status: 'active' | 'completed' | 'archived' | 'all') => {
    if (status === 'all') {
      setFilters(prev => {
        const { status: _, ...rest } = prev;
        return rest;
      });
    } else {
      setFilters(prev => ({ ...prev, status }));
    }
  };

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage all your projects, track progress, and monitor budgets in one place.
          </p>
        </div>

        <ProjectList
          projects={projects}
          isLoading={isLoading}
          onEditProject={handleEditProject}
          onArchiveProject={handleArchiveProject}
          onDeleteProject={handleDeleteProject}
          onCreateProject={() => setIsCreateDialogOpen(true)}
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          initialSearch={filters.search}
          initialStatusFilter={filters.status || 'all'}
        />

        {/* Create Project Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new project. All fields are required except description.
              </DialogDescription>
            </DialogHeader>
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Project Dialog */}
        <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update the project details below. All fields are required except description.
              </DialogDescription>
            </DialogHeader>
            {editingProject && (
              <ProjectForm
                defaultValues={{
                  name: editingProject.name,
                  description: editingProject.description || '',
                  start_date: typeof editingProject.start_date === 'string'
                    ? new Date(editingProject.start_date)
                    : editingProject.start_date,
                  end_date: typeof editingProject.end_date === 'string'
                    ? new Date(editingProject.end_date)
                    : editingProject.end_date,
                  estimated_budget: editingProject.estimated_budget,
                }}
                onSubmit={handleUpdateProject}
                onCancel={() => setEditingProject(null)}
                isSubmitting={isSubmitting}
                submitButtonText="Update Project"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}