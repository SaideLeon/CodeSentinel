import type {
  Audit,
  AuditSourceType,
  FindingStatus,
  Project,
  SecurityFinding,
  SecurityRule,
  Severity,
  Subscription,
  SubscriptionPlan,
  TeamMember,
  TeamRole,
  UserProfile
} from '@/types/security';

const rules: SecurityRule[] = [
  { id: 'OWASP-R01', name: 'SQL Injection', description: 'Detecta consultas SQL montadas por concatenação ou interpolação.', category: 'Injection', severity: 'CRITICAL', penaltyPoints: 25, enabled: true },
  { id: 'OWASP-R03', name: 'Sensitive Data Exposure', description: 'Detecta credenciais, tokens e segredos hardcoded.', category: 'Cryptography', severity: 'HIGH', penaltyPoints: 15, enabled: true },
  { id: 'CTF-R07', name: 'TOCTOU Race Condition', description: 'Detecta checagens de saldo/estoque sem operação atômica.', category: 'Concurrency', severity: 'CRITICAL', penaltyPoints: 20, enabled: true },
  { id: 'OWASP-R10', name: 'Insufficient Logging', description: 'Sinaliza fluxos críticos sem trilha mínima de auditoria.', category: 'Observability', severity: 'MEDIUM', penaltyPoints: 10, enabled: true }
];

const projects: Project[] = [
  { id: 'proj_1', name: 'Payment Gateway API', description: 'Rotas críticas de pagamento, autenticação e ledger.', repositoryUrl: 'github.com/acme/payment-gateway', latestScore: 40, hasOpenCritical: true, productionReady: false, auditCount: 1 },
  { id: 'proj_2', name: 'Customer Portal', description: 'Portal web com dados de clientes e integrações internas.', repositoryUrl: 'github.com/acme/customer-portal', latestScore: 88, hasOpenCritical: false, productionReady: true, auditCount: 2 }
];

let subscription: Subscription = { plan: 'PRO', creditsUsed: 8, creditsLimit: 50 };
let user: UserProfile = { name: 'Saide Leon', company: 'CodeSentinel Labs' };
let teamMembers: TeamMember[] = [
  { id: 'tm_1', name: 'Saide Leon', email: 'saide@example.com', role: 'OWNER', avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=SL' },
  { id: 'tm_2', name: 'Security Lead', email: 'security@example.com', role: 'ADMIN', avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Security' }
];

const buildFinding = (overrides: Partial<SecurityFinding>): SecurityFinding => ({
  id: 'find_1',
  ruleId: 'OWASP-R01',
  ruleName: 'SQL Injection',
  severity: 'CRITICAL',
  status: 'OPEN',
  location: 'src/routes/auth.ts:9',
  description: 'Entrada de usuário interpolada diretamente em consulta SQL.',
  exploitationReason: 'Um atacante pode alterar a cláusula WHERE e extrair registros arbitrários.',
  potentialImpact: 'Vazamento de dados pessoais, fraude e bloqueio de deploy por risco crítico.',
  codeProof: "const query = `SELECT * FROM users WHERE email = '${email}'`;",
  fixArchitecture: 'Controller → service → repository com prepared statements e validação de schema na borda.',
  fixSteps: [
    { title: 'Parametrizar consulta', description: 'Substitua interpolação por placeholders suportados pelo driver.', language: 'ts', code: "await db.query('SELECT * FROM users WHERE email = $1', [email]);" },
    { title: 'Validar entrada', description: 'Rejeite payloads fora do formato esperado antes de acessar o banco.', language: 'ts', code: "const email = z.string().email().parse(req.body.email);" }
  ],
  validationTest: { language: 'ts', command: 'bun test security/auth.test.ts', code: "expect(response.status).toBe(401);", expectedResult: 'Payload malicioso não altera a consulta nem retorna registros.' },
  deployChecklist: ['Executar testes de regressão', 'Revisar logs de autenticação', 'Rodar nova auditoria antes do release'],
  ...overrides
});

let audits: Audit[] = [
  {
    id: 'audit_1',
    projectId: 'proj_1',
    createdAt: new Date('2026-08-12T10:30:00.000Z').toISOString(),
    score: 40,
    verdict: 'REPROVADO',
    productionReady: false,
    findings: [
      buildFinding({ id: 'find_1' }),
      buildFinding({ id: 'find_2', ruleId: 'OWASP-R03', ruleName: 'Sensitive Data Exposure', severity: 'HIGH', location: 'src/routes/auth.ts:5', description: 'JWT secret hardcoded no código fonte.', codeProof: 'const JWT_SECRET = "sk_live_...";' }),
      buildFinding({ id: 'find_3', ruleId: 'CTF-R07', ruleName: 'TOCTOU Race Condition', severity: 'CRITICAL', location: 'src/controllers/checkout.ts:4', description: 'Saldo verificado antes da cobrança sem transação atômica.', codeProof: 'if (user.rows[0].credits >= amount) {' })
    ],
    totalCritical: 2,
    totalHigh: 1,
    totalMedium: 0,
    filesAnalyzedCount: 2,
    codeSizeKB: 12,
    submittedBy: 'Saide Leon',
    sourceType: 'PASTE',
    sourceDetails: 'Editor de código',
    isRescan: false
  }
];

const summarizeAudit = (audit: Audit) => {
  audit.totalCritical = audit.findings.filter(f => f.severity === 'CRITICAL').length;
  audit.totalHigh = audit.findings.filter(f => f.severity === 'HIGH').length;
  audit.totalMedium = audit.findings.filter(f => f.severity === 'MEDIUM').length;
  audit.productionReady = audit.totalCritical === 0 && audit.score >= 70;
  return audit;
};

export const createAudit = (input: { projectId: string; codeContent: string; sourceType: AuditSourceType; sourceDetails: string; isRescan?: boolean }) => {
  const findings: SecurityFinding[] = [];
  const lines = input.codeContent.split('\n');
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    if ((lower.includes('select ') || lower.includes('update ')) && (line.includes('${') || line.includes(' + '))) {
      findings.push(buildFinding({ id: `find_${Date.now()}_${index}`, location: `${input.sourceDetails}:${index + 1}`, codeProof: line.trim() }));
    }
    if ((lower.includes('secret') || lower.includes('password') || lower.includes('token')) && (line.includes('=') || line.includes(':')) && !lower.includes('process.env')) {
      findings.push(buildFinding({ id: `find_${Date.now()}_${index}_secret`, ruleId: 'OWASP-R03', ruleName: 'Sensitive Data Exposure', severity: 'HIGH', location: `${input.sourceDetails}:${index + 1}`, description: 'Segredo hardcoded detectado.', codeProof: line.trim() }));
    }
    if (lower.includes('if (') && (lower.includes('credits') || lower.includes('balance') || lower.includes('amount'))) {
      findings.push(buildFinding({ id: `find_${Date.now()}_${index}_race`, ruleId: 'CTF-R07', ruleName: 'TOCTOU Race Condition', severity: 'CRITICAL', location: `${input.sourceDetails}:${index + 1}`, description: 'Checagem de estado financeiro sem atualização atômica.', codeProof: line.trim() }));
    }
  });

  const penalty = findings.reduce((total, finding) => total + (finding.severity === 'CRITICAL' ? 25 : finding.severity === 'HIGH' ? 15 : 10), 0);
  const score = Math.max(0, 100 - penalty);
  const audit = summarizeAudit({
    id: `audit_${Date.now()}`,
    projectId: input.projectId,
    createdAt: new Date().toISOString(),
    score,
    verdict: score >= 90 ? 'APROVADO_COM_DISTINCAO' : score >= 75 ? 'APROVADO_COM_RESSALVAS' : score >= 60 ? 'APROVADO_CONDICIONALMENTE' : 'REPROVADO',
    productionReady: false,
    findings,
    totalCritical: 0,
    totalHigh: 0,
    totalMedium: 0,
    filesAnalyzedCount: 1,
    codeSizeKB: Math.max(1, Math.round(input.codeContent.length / 1024)),
    submittedBy: user.name,
    sourceType: input.sourceType,
    sourceDetails: input.sourceDetails,
    isRescan: input.isRescan
  });

  audits = [audit, ...audits];
  const project = projects.find(p => p.id === input.projectId);
  if (project) {
    project.latestScore = audit.score;
    project.auditCount += 1;
    project.hasOpenCritical = audit.totalCritical > 0;
    project.productionReady = audit.productionReady;
  }
  subscription = { ...subscription, creditsUsed: Math.min(subscription.creditsLimit, subscription.creditsUsed + 1) };
  return audit;
};

export const store = {
  getProjects: () => projects,
  getProjectById: (id: string) => projects.find(project => project.id === id),
  createProject: (name: string, description: string, repositoryUrl?: string) => {
    const project: Project = { id: `proj_${Date.now()}`, name, description: description || 'Projeto sem descrição.', repositoryUrl, latestScore: undefined, hasOpenCritical: false, productionReady: false, auditCount: 0 };
    projects.unshift(project);
    return project;
  },
  getAuditsByProjectId: (projectId: string) => audits.filter(audit => audit.projectId === projectId),
  getAuditById: (id: string) => audits.find(audit => audit.id === id),
  updateFindingStatus: (auditId: string, findingId: string, status: FindingStatus, statusJustification: string) => {
    const audit = audits.find(item => item.id === auditId);
    const finding = audit?.findings.find(item => item.id === findingId);
    if (finding) {
      finding.status = status;
      finding.statusJustification = statusJustification;
      finding.fixedAt = status === 'FIXED' ? new Date().toISOString() : undefined;
    }
  },
  getSubscription: () => subscription,
  updateSubscriptionPlan: (plan: SubscriptionPlan) => {
    const limits: Record<SubscriptionPlan, number> = { FREE: 2, PRO: 50, TEAM: 300 };
    subscription = { plan, creditsLimit: limits[plan], creditsUsed: 0 };
    return subscription;
  },
  getUser: () => user,
  updateUserProfile: (profile: Partial<UserProfile>) => {
    user = { ...user, ...profile };
    return user;
  },
  getTeamMembers: () => teamMembers,
  addTeamMember: (email: string, role: Exclude<TeamRole, 'OWNER'>) => {
    teamMembers = [...teamMembers, { id: `tm_${Date.now()}`, name: email.split('@')[0], email, role, avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(email)}` }];
  },
  removeTeamMember: (id: string) => {
    teamMembers = teamMembers.filter(member => member.id !== id);
  },
  getSecurityRules: () => rules,
  toggleRuleEnabled: (ruleId: string) => {
    const rule = rules.find(item => item.id === ruleId);
    if (rule) rule.enabled = !rule.enabled;
  },
  updateRuleSeverity: (ruleId: string, severity: Severity) => {
    const rule = rules.find(item => item.id === ruleId);
    if (rule) rule.severity = severity;
  },
  createAudit
};
