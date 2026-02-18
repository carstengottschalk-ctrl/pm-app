import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/projects-service';
import { supabase } from '@/lib/supabase';
import { withSecurity } from '@/lib/security';

// GET /api/projects/[id] - Get a single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSecurity(
    request,
    async (req) => {
      const { id } = await params;

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Check if we should return stats
      const searchParams = req.nextUrl.searchParams;
      const withStats = searchParams.get('withStats') === 'true';

      let project;
      if (withStats) {
        project = await ProjectsService.getProjectWithStats(id);
      } else {
        project = await ProjectsService.getProjectById(id);
      }

      return NextResponse.json({ project });
    },
    {
      requireCSRF: false,
      rateLimitIdentifier: 'projects:getById',
    }
  );
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSecurity(
    request,
    async (req) => {
      const { id } = await params;
      const body = await req.json();

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Update project
      const project = await ProjectsService.updateProject(id, body);

      return NextResponse.json({ project });
    },
    {
      requireCSRF: true,
      rateLimitIdentifier: 'projects:put',
    }
  );
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSecurity(
    request,
    async (req) => {
      const { id } = await params;

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Delete project
      await ProjectsService.deleteProject(id);

      return NextResponse.json({ success: true });
    },
    {
      requireCSRF: true,
      rateLimitIdentifier: 'projects:delete',
    }
  );
}