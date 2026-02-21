import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/projects-service';
import { supabase } from '@/lib/supabase';
import { withSecurity } from '@/lib/security';

// GET /api/projects/check-duplicate - Check if project name is duplicate
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
      const name = searchParams.get('name');
      const excludeId = searchParams.get('excludeId');

      if (!name) {
        return NextResponse.json(
          { error: 'Project name is required' },
          { status: 400 }
        );
      }

      // Check for duplicate name
      const isDuplicate = await ProjectsService.checkDuplicateName(name, excludeId || undefined);

      return NextResponse.json({ isDuplicate });
    },
    {
      requireCSRF: false,
      rateLimitIdentifier: 'projects:check-duplicate',
    }
  );
}