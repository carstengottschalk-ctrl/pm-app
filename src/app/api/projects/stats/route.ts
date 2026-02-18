import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/projects-service';
import { withSecurity } from '@/lib/security';
import { supabase } from '@/lib/supabase';

// GET /api/projects/stats - Get project statistics
export async function GET(request: NextRequest) {
  return withSecurity(
    request,
    async (req) => {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Get counts by status
      const counts = await ProjectsService.getProjectCounts();

      // Get all projects with stats
      const projects = await ProjectsService.getProjectStats();

      // Calculate summary statistics
      const totalBudget = projects.reduce((sum, project) => sum + project.estimated_budget, 0);
      const averageBudget = projects.length > 0 ? totalBudget / projects.length : 0;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const overdueProjects = projects.filter(p =>
        p.status === 'active' && p.days_remaining < 0
      ).length;

      return NextResponse.json({
        counts,
        summary: {
          totalBudget,
          averageBudget: Math.round(averageBudget),
          activeProjects,
          overdueProjects,
          totalProjects: projects.length,
        },
        projects, // Return projects with stats for detailed view
      });
    },
    {
      requireCSRF: false,
      rateLimitIdentifier: 'projects:stats',
    }
  );
}