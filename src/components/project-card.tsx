'use client';

import { format } from 'date-fns';
import { Calendar, DollarSign, Clock, MoreVertical } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date: Date | string;
  end_date: Date | string;
  estimated_budget: number;
  status: 'active' | 'completed' | 'archived';
  created_at: Date | string;
  updated_at: Date | string;
}

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onArchive?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onArchive, onDelete }: ProjectCardProps) {
  const startDate = typeof project.start_date === 'string' ? new Date(project.start_date) : project.start_date;
  const endDate = typeof project.end_date === 'string' ? new Date(project.end_date) : project.end_date;
  const createdDate = typeof project.created_at === 'string' ? new Date(project.created_at) : project.created_at;

  // Calculate project duration in days (0 for same-day projects)
  const durationInMs = endDate.getTime() - startDate.getTime();
  const durationInDays = Math.max(0, Math.round(durationInMs / (1000 * 60 * 60 * 24)));

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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <Link href={`/projects/${project.id}`} className="hover:text-primary transition-colors">
                {project.name}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {project.description || 'No description provided'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(project.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/projects/${project.id}`}>View Details</Link>
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(project)}>
                    Edit Project
                  </DropdownMenuItem>
                )}
                {onArchive && project.status !== 'archived' && (
                  <DropdownMenuItem onClick={() => onArchive(project)}>
                    Archive Project
                  </DropdownMenuItem>
                )}
                {(onEdit || onArchive) && onDelete && (
                  <DropdownMenuSeparator />
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(project)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete Project
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Start Date</div>
              <div className="text-muted-foreground">{format(startDate, 'MMM d, yyyy')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">End Date</div>
              <div className="text-muted-foreground">{format(endDate, 'MMM d, yyyy')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Duration</div>
              <div className="text-muted-foreground">{durationInDays} days</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Budget</div>
              <div className="text-muted-foreground">{formatCurrency(project.estimated_budget)}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        Created {format(createdDate, 'MMM d, yyyy')}
      </CardFooter>
    </Card>
  );
}