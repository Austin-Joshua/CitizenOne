const { ForbiddenError, NotFoundError, DomainError } = require('../../domain/errors/DomainError');
const { ServiceRequestWorkflow } = require('../../domain/workflow/ServiceRequestWorkflow');
const { ServiceRequestRepository } = require('../../infrastructure/persistence/ServiceRequestRepository');
const { ActivityRepository } = require('../../infrastructure/persistence/ActivityRepository');
const { AuditService } = require('../../infrastructure/security/AuditService');
const { findUserById, getUsers } = require('../../lib/userStore');
const { notifyUser } = require('../../lib/notify');
const { sanitizeServiceRequestPayload } = require('../../lib/sanitize');
const { broadcastWorkspace } = require('../../lib/eventHub');
const { normalizeRole } = require('../../domain/user/RoleBehavior');

/**
 * Application service: service desk use cases (orchestration only; rules live in domain).
 */
class ServiceDeskService {
  constructor(deps = {}) {
    this.repo = deps.serviceRequestRepository || new ServiceRequestRepository();
    this.activityRepo = deps.activityRepository || new ActivityRepository();
    this.findUserById = deps.findUserById || findUserById;
    this.getUsers = deps.getUsers || getUsers;
    this.notifyUser = deps.notifyUser || notifyUser;
    this.broadcastWorkspace = deps.broadcastWorkspace || broadcastWorkspace;
    this.sanitizePayload = deps.sanitizeServiceRequestPayload || sanitizeServiceRequestPayload;
  }

  /**
   * @param {import('../../domain/user/Principal').Principal} principal
   */
  async listForPrincipal(principal) {
    const rows = await this.repo.findAll();
    if (principal.canViewAllServiceRequestsInQueue) {
      const enriched = [];
      for (const r of rows) {
        const u = await this.findUserById(r.userId);
        const base = { ...r, requesterName: u?.name || 'Unknown' };
        if (principal.canSeeRequesterEmailInQueue) {
          base.requesterEmail = u?.email || '';
        }
        enriched.push(base);
      }
      return enriched.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
    return rows
      .filter((r) => r.userId === principal.id)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * @param {import('../../domain/user/Principal').Principal} principal
   */
  async create(principal, body, req) {
    if (!principal.canSubmitServiceRequest) {
      throw new ForbiddenError('Only citizens and students may submit service requests.');
    }
    const { title, description, category } = this.sanitizePayload(body || {});
    if (!title) {
      throw new DomainError('title is required');
    }
    const rows = await this.repo.findAll();
    const now = new Date().toISOString();
    const item = {
      id: this.repo.nextId('sr', rows),
      userId: principal.id,
      title,
      description,
      category,
      status: ServiceRequestWorkflow.initialStatusForCreate(),
      resolutionNote: '',
      decidedByUserId: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.repo.prepend(item);

    const users = await this.getUsers();
    for (const u of users) {
      const r = normalizeRole(u.role);
      if (r === 'staff' || r === 'admin') {
        await this.notifyUser(u.id, {
          title: 'New service request',
          body: `${item.title} — submitted for review.`,
          type: 'service_request',
          refType: 'serviceRequest',
          refId: item.id,
        });
      }
    }

    const submitter = await this.findUserById(principal.id);
    await AuditService.record({
      action: 'service_request.create',
      outcome: 'success',
      actorId: principal.id,
      actorEmail: submitter?.email,
      resourceType: 'serviceRequest',
      resourceId: item.id,
      ip: AuditService.clientIp(req),
    });

    this.broadcastWorkspace({ type: 'service-requests', at: item.updatedAt });
    return item;
  }

  /**
   * @param {import('../../domain/user/Principal').Principal} principal
   */
  async transitionByStaff(principal, requestId, body, req) {
    if (!principal.canDecideServiceRequest) {
      throw new ForbiddenError('Only staff and administrators may update request status.');
    }
    const { status, resolutionNote } = body || {};
    if (!status) {
      throw new DomainError('status is required');
    }

    const row = await this.repo.findById(requestId);
    if (!row) throw new NotFoundError('Request not found');

    const prev = row.status;
    ServiceRequestWorkflow.assertStaffTransition(prev, status);

    const next = {
      ...row,
      status,
      resolutionNote: resolutionNote != null ? String(resolutionNote) : row.resolutionNote,
      decidedByUserId: principal.id,
      updatedAt: new Date().toISOString(),
    };
    await this.repo.replaceById(requestId, next);

    const actor = await this.findUserById(principal.id);
    await AuditService.record({
      action: 'service_request.status',
      outcome: 'success',
      actorId: principal.id,
      actorEmail: actor?.email,
      resourceType: 'serviceRequest',
      resourceId: row.id,
      ip: AuditService.clientIp(req),
      detail: `${prev} → ${status}`,
    });

    if (prev !== status) {
      await this.notifyUser(row.userId, {
        title:
          status === 'approved'
            ? 'Request approved'
            : status === 'rejected'
              ? 'Request not approved'
              : 'Request status updated',
        body: `${row.title}${resolutionNote ? ` — ${resolutionNote}` : ''}`,
        type: 'service_request',
        refType: 'serviceRequest',
        refId: row.id,
      });
      await this.activityRepo.record({
        userId: row.userId,
        type: 'service_request',
        message: `Service request "${row.title}" marked ${status}`,
        createdAt: new Date().toISOString(),
      });
    }

    this.broadcastWorkspace({ type: 'service-requests', at: next.updatedAt });
    return next;
  }
}

let singleton;
function getServiceDeskService() {
  if (!singleton) singleton = new ServiceDeskService();
  return singleton;
}

module.exports = { ServiceDeskService, getServiceDeskService };
