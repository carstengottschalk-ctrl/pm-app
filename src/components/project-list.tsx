'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, PlusCircle } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectCard, Project } from './project-card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectListProps {
  projects: Project[];
  isLoading?: boolean;
  onEditProject?: (project: Project) => void;
  onArchiveProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  onCreateProject?: () => void;
  onSearch?: (search: string) => void;
  onStatusFilter?: (status: 'active' | 'completed' | 'archived' | 'all') => void;
  initialSearch?: string;
  initialStatusFilter?: string;
}

export function ProjectList({
  projects,
  isLoading = false,
  onEditProject,
  onArchiveProject,
  onDeleteProject,
  onCreateProject,
  onSearch,
  onStatusFilter,
  initialSearch = '',
  initialStatusFilter = 'all',
}: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (onStatusFilter) {
      onStatusFilter(value as 'active' | 'completed' | 'archived' | 'all');
    }
  };

  // Filter projects based on search and status
  const filteredProjects = useMemo(() => {
    // If we have callbacks, don't filter locally - API handles it
    if (onSearch || onStatusFilter) {
      return projects;
    }

    // Otherwise, filter locally
    return projects.filter((project) => {
      // Search filter
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      // Status filter
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter, onSearch, onStatusFilter]);

  // Sort projects by start date (newest first)
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const dateA = typeof a.start_date === 'string' ? new Date(a.start_date) : a.start_date;
      const dateB = typeof b.start_date === 'string' ? new Date(b.start_date) : b.start_date;
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredProjects]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {onCreateProject && (
          <Button onClick={onCreateProject}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {sortedProjects.length} of {projects.length} projects
        {searchQuery && ` matching "${searchQuery}"`}
        {statusFilter !== 'all' && ` with status "${statusFilter}"`}
      </div>

      {/* Projects list */}
      {sortedProjects.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {projects.length === 0
              ? "You haven't created any projects yet. Create your first project to get started."
              : "No projects match your search criteria. Try adjusting your filters."}
          </p>
          {projects.length === 0 && onCreateProject && (
            <Button onClick={onCreateProject} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Project
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={onEditProject}
              onArchive={onArchiveProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}