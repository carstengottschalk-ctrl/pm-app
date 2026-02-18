import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/projects-service';
import { supabase } from '@/lib/supabase';
import { withSecurity } from '@/lib/security';

// POST /api/projects/[id]/archive - Archive a project
export async function POST(
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

      // Archive project
      const project = await ProjectsService.archiveProject(id);

      return NextResponse.json({ project });
    },
    {
      requireCSRF: true,
      rateLimitIdentifier: 'projects:archive',
    }
  );
}