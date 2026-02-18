'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, DollarSign, Clock, Edit, Archive, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { ProjectForm } from '@/components/project-form';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchProject, archiveProject, deleteProject, updateProject, isLoading } = useProjects();

  const [project, setProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch project data on mount
  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectId = params.id as string;
        const fetchedProject = await fetchProject(projectId, true);
        setProject(fetchedProject);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load project details.',
          variant: 'destructive',
        });
        router.push('/projects');
      }
    };

    if (params.id) {
      loadProject();
    }
  }, [params.id, fetchProject, router]);

  if (!project) {
    return (
      <ProtectedRoute>
        <div className="container py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-muted rounded"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const startDate = typeof project.start_date === 'string' ? new Date(project.start_date) : project.start_date;
  const endDate = typeof project.end_date === 'string' ? new Date(project.end_date) : project.end_date;
  const createdDate = typeof project.created_at === 'string' ? new Date(project.created_at) : project.created_at;
  const updatedDate = typeof project.updated_at === 'string' ? new Date(project.updated_at) : project.updated_at;

  // Calculate project duration in days
  const durationInMs = endDate.getTime() - startDate.getTime();
  const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));

  // Get status badge color
  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archived</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleArchive = async () => {
    if (project.status === 'archived') {
      toast({
        title: 'Already archived',
        description: 'This project is already archived.',
      });
      return;
    }

    if (window.confirm(`Are you sure you want to archive "${project.name}"?`)) {
      setIsArchiving(true);
      try {
        const updatedProject = await archiveProject(project.id);
        setProject(updatedProject);
      } catch (error) {
        // Error is already handled by the hook
      } finally {
        setIsArchiving(false);
      }
    }
  };

  const handleUpdateProject = async (data: any) => {
    if (!project) return;

    try {
      const updatedProject = await updateProject(project.id, data);
      setProject(updatedProject);
      setIsEditing(false);
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await deleteProject(project.id);
        router.push('/projects');
      } catch (error) {
        // Error is already handled by the hook
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isLoading && !project) {
    return (
      <ProtectedRoute>
        <div className="container py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-muted rounded"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container py-8">
        {/* Back button and title */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                {getStatusBadge(project.status)}
                <span className="text-sm text-muted-foreground">
                  Project ID: {params.id}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit} disabled={isLoading}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleArchive} disabled={isArchiving || isLoading || project.status === 'archived'}>
                <Archive className="mr-2 h-4 w-4" />
                {project.status === 'archived' ? 'Archived' : (isArchiving ? 'Archiving...' : 'Archive')}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting || isLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>

        {/* Project stats */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Start Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{format(startDate, 'MMM d, yyyy')}</div>
              <p className="text-xs text-muted-foreground">Project start</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">End Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{format(endDate, 'MMM d, yyyy')}</div>
              <p className="text-xs text-muted-foreground">Project end</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{durationInDays}</div>
              <p className="text-xs text-muted-foreground">Days total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(project.estimated_budget)}</div>
              <p className="text-xs text-muted-foreground">Estimated total</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="time-entries" disabled>Time Entries</TabsTrigger>
            <TabsTrigger value="budget" disabled>Budget Analysis</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
                <CardDescription>
                  Detailed information about this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {project.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>
                  Key dates and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Start Date</div>
                      <div className="text-sm text-muted-foreground">{format(startDate, 'MMMM d, yyyy')}</div>
                    </div>
                    <Badge variant="outline">Started</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">End Date</div>
                      <div className="text-sm text-muted-foreground">{format(endDate, 'MMMM d, yyyy')}</div>
                    </div>
                    <Badge variant="outline">Planned End</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Days Remaining</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                      </div>
                    </div>
                    <Badge variant="outline">
                      {Date.now() > endDate.getTime() ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time-entries">
            <Card>
              <CardHeader>
                <CardTitle>Time Entries</CardTitle>
                <CardDescription>
                  Time logged against this project (PROJ-3 feature)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Time Tracking Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This feature is part of PROJ-3: Time Tracking. You&apos;ll be able to log and view time entries for this project here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <CardTitle>Budget Analysis</CardTitle>
                <CardDescription>
                  Budget tracking and analysis (PROJ-4 feature)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Budget Tracking Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This feature is part of PROJ-4: Budget Tracking. You&apos;ll be able to track spent budget, remaining budget, and get insights here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                  Manage project settings and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="font-medium">Project ID</div>
                  <div className="text-sm text-muted-foreground font-mono">{params.id}</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">{format(createdDate, 'PPP')}</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Last Updated</div>
                  <div className="text-sm text-muted-foreground">{format(updatedDate, 'PPP')}</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Current Status</div>
                  <div>{getStatusBadge(project.status)}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Project Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update the project details below. All fields are required except description.
              </DialogDescription>
            </DialogHeader>
            {project && (
              <ProjectForm
                defaultValues={{
                  name: project.name,
                  description: project.description || '',
                  start_date: typeof project.start_date === 'string'
                    ? new Date(project.start_date)
                    : project.start_date,
                  end_date: typeof project.end_date === 'string'
                    ? new Date(project.end_date)
                    : project.end_date,
                  estimated_budget: project.estimated_budget,
                }}
                onSubmit={handleUpdateProject}
                onCancel={() => setIsEditing(false)}
                isSubmitting={isLoading}
                submitButtonText="Update Project"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}