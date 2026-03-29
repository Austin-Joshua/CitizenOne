const { ForbiddenError, NotFoundError, DomainError, ConflictError } = require('../../domain/errors/DomainError');
const { ProgramApplicationWorkflow } = require('../../domain/workflow/ProgramApplicationWorkflow');
const { ApplicationRecordRepository } = require('../../infrastructure/persistence/ApplicationRecordRepository');
const { ActivityRepository } = require('../../infrastructure/persistence/ActivityRepository');
const { AuditService } = require('../../infrastructure/security/AuditService');
const { findUserById, getUsers } = require('../../lib/userStore');
const { notifyUser } = require('../../lib/notify');
const { sanitizeApplicationPayload } = require('../../lib/sanitize');
const { broadcastWorkspace } = require('../../lib/eventHub');
const { normalizeRole } = require('../../domain/user/RoleBehavior');

class ApplicationProcessingService {
  constructor(deps = {}) {
    this.repo = deps.applicationRecordRepository || new ApplicationRecordRepository();
    this.activityRepo = deps.activityRepository || new ActivityRepository();
    this.findUserById = deps.findUserById || findUserById;
    this.getUsers = deps.getUsers || getUsers;
    this.notifyUser = deps.notifyUser || notifyUser;
    this.broadcastWorkspace = deps.broadcastWorkspace || broadcastWorkspace;
    this.sanitizePayload = deps.sanitizeApplicationPayload || sanitizeApplicationPayload;
  }

  async listQueue(principal) {
    if (!principal.canViewApplicationQueue) {
      throw new ForbiddenError('Not authorized to view the application queue.');
    }
    const apps = await this.repo.findAll();
    const enriched = [];
    for (const a of apps) {
      const u = await this.findUserById(a.userId);
      enriched.push({
        ...a,
        applicantName: u?.name || 'Unknown',
        applicantEmail: u?.email || '',
      });
    }
    return enriched.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  async listForUser(principal) {
    const all = await this.repo.findAll();
    return all
      .filter((a) => a.userId === principal.id)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  async submit(principal, body, req) {
    const raw = this.sanitizePayload(body || {});
    const { type, targetId, title, deadline } = raw;
    const status = ProgramApplicationWorkflow.initialStatusForSubmit();
    if (!type || !targetId || !title) {
      throw new DomainError('type, targetId, and title are required');
    }
    if (await this.repo.findDuplicateForUser(principal.id, type, targetId)) {
      throw new ConflictError('Application already exists');
    }
    const apps = await this.repo.findAll();
    const appRow = {
      id: this.repo.nextId('app', apps),
      userId: principal.id,
      type,
      targetId,
      title,
      status,
      deadline: deadline || null,
      updatedAt: new Date().toISOString(),
    };
    await this.repo.prepend(appRow);

    await this.activityRepo.record({
      userId: principal.id,
      type: 'application',
      message: `Submitted ${title}`,
      createdAt: new Date().toISOString(),
    });

    const users = await this.getUsers();
    for (const u of users) {
      const r = normalizeRole(u.role);
      if (r === 'staff' || r === 'admin') {
        await this.notifyUser(u.id, {
          title: 'New application submitted',
          body: appRow.title,
          type: 'application',
          refType: 'application',
          refId: appRow.id,
        });
      }
    }

    const applicant = await this.findUserById(principal.id);
    await AuditService.record({
      action: 'application.create',
      outcome: 'success',
      actorId: principal.id,
      actorEmail: applicant?.email,
      resourceType: 'application',
      resourceId: appRow.id,
      ip: AuditService.clientIp(req),
    });

    this.broadcastWorkspace({ type: 'applications', at: appRow.updatedAt });
    return appRow;
  }

  async review(principal, applicationId, body, req) {
    if (!principal.canReviewApplications) {
      throw new ForbiddenError('Only staff and administrators may review applications.');
    }
    const { status, note } = body || {};
    if (!status || !String(status).trim()) {
      throw new DomainError('status is required');
    }
    const row = await this.repo.findById(applicationId);
    if (!row) throw new NotFoundError('Application not found');

    const prev = row.status;
    ProgramApplicationWorkflow.assertReviewTransition(prev, status);

    const next = {
      ...row,
      status,
      reviewNote: note != null ? String(note) : row.reviewNote || '',
      reviewedByUserId: principal.id,
      updatedAt: new Date().toISOString(),
    };
    await this.repo.replaceById(applicationId, next);

    const reviewer = await this.findUserById(principal.id);
    await AuditService.record({
      action: 'application.review',
      outcome: 'success',
      actorId: principal.id,
      actorEmail: reviewer?.email,
      resourceType: 'application',
      resourceId: next.id,
      ip: AuditService.clientIp(req),
      detail: `${prev} → ${status}`,
    });

    if (prev !== status) {
      await this.notifyUser(row.userId, {
        title: 'Application status updated',
        body: `${row.title} is now ${status.replace(/_/g, ' ')}.${note ? ` ${note}` : ''}`,
        type: 'application',
        refType: 'application',
        refId: row.id,
      });
      await this.activityRepo.record({
        userId: row.userId,
        type: 'application',
        message: `"${row.title}" → ${status}`,
        createdAt: new Date().toISOString(),
      });
    }

    this.broadcastWorkspace({ type: 'applications', at: next.updatedAt });
    return next;
  }

  async ownerPatchStatus(principal, applicationId, body) {
    const { status } = body || {};
    if (!status) throw new DomainError('status is required');
    ProgramApplicationWorkflow.assertOwnerPatch(status);

    const row = await this.repo.findById(applicationId);
    if (!row || row.userId !== principal.id) {
      throw new NotFoundError('Application not found');
    }

    const next = { ...row, status, updatedAt: new Date().toISOString() };
    await this.repo.replaceById(applicationId, next);
    return next;
  }
}

let singleton;
function getApplicationProcessingService() {
  if (!singleton) singleton = new ApplicationProcessingService();
  return singleton;
}

module.exports = { ApplicationProcessingService, getApplicationProcessingService };
