import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/projects-service';
import { supabase } from '@/lib/supabase';
import { withSecurity } from '@/lib/security';

// GET /api/projects - Get all projects for current user
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

      // Get query parameters
      const searchParams = req.nextUrl.searchParams;
      const status = searchParams.get('status') as 'active' | 'completed' | 'archived' | undefined;
      const search = searchParams.get('search') || undefined;
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
      const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

      // Fetch projects
      const projects = await ProjectsService.getProjects({
        status,
        search,
        limit,
        offset,
      });

      return NextResponse.json({ projects });
    },
    {
      requireCSRF: false,
      rateLimitIdentifier: 'projects:get',
    }
  );
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  return withSecurity(
    request,
    async (req) => {
      const body = await req.json();

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Create project
      const project = await ProjectsService.createProject(body);

      return NextResponse.json({ project }, { status: 201 });
    },
    {
      requireCSRF: true,
      rateLimitIdentifier: 'projects:post',
    }
  );
}