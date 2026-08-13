import { NextResponse } from 'next/server';
import { createAudit } from '@/lib/store/security-store';
import type { AuditSourceType } from '@/types/security';

export async function POST(request: Request) {
  const body = await request.json();
  const audit = createAudit({
    projectId: String(body.projectId || ''),
    codeContent: String(body.codeContent || ''),
    sourceType: (body.sourceType || 'PASTE') as AuditSourceType,
    sourceDetails: String(body.sourceDetails || 'Editor de código'),
    isRescan: Boolean(body.isRescan)
  });

  return NextResponse.json({ audit });
}
