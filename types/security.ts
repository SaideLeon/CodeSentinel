export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FindingStatus = 'OPEN' | 'FIXED' | 'IGNORED';
export type SubscriptionPlan = 'FREE' | 'PRO' | 'TEAM';
export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'READONLY';
export type AuditSourceType = 'PASTE' | 'FILE_UPLOAD' | 'GITHUB';
export type AuditVerdict = 'APROVADO_COM_DISTINCAO' | 'APROVADO_COM_RESSALVAS' | 'APROVADO_CONDICIONALMENTE' | 'REPROVADO';

export interface Project {
  id: string;
  name: string;
  description: string;
  repositoryUrl?: string;
  latestScore?: number;
  hasOpenCritical: boolean;
  productionReady: boolean;
  auditCount: number;
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: Severity;
  penaltyPoints: number;
  enabled: boolean;
}

export interface FixStep {
  title: string;
  description: string;
  language: string;
  code: string;
}

export interface ValidationTest {
  language: string;
  command: string;
  code: string;
  expectedResult: string;
}

export interface SecurityFinding {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: Severity;
  status: FindingStatus;
  location: string;
  description: string;
  exploitationReason: string;
  potentialImpact: string;
  codeProof?: string;
  fixArchitecture?: string;
  fixSteps: FixStep[];
  validationTest?: ValidationTest;
  deployChecklist?: string[];
  statusJustification?: string;
  fixedAt?: string;
}

export interface Audit {
  id: string;
  projectId: string;
  createdAt: string;
  score: number;
  verdict: AuditVerdict;
  productionReady: boolean;
  findings: SecurityFinding[];
  totalCritical: number;
  totalHigh: number;
  totalMedium: number;
  filesAnalyzedCount: number;
  codeSizeKB: number;
  submittedBy: string;
  sourceType: AuditSourceType;
  sourceDetails: string;
  isRescan?: boolean;
}

export interface Subscription {
  plan: SubscriptionPlan;
  creditsUsed: number;
  creditsLimit: number;
}

export interface UserProfile {
  name: string;
  company: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatarUrl: string;
}
