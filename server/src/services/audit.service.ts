import type { Prisma } from "@prisma/client";

import { prisma } from "../prisma.js";

type AuditPayload = {
  action: string;
  entityType: string;
  entityId: string;
  performedById?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function createAuditLog(payload: AuditPayload) {
  await prisma.auditLog.create({
    data: {
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId,
      performedById: payload.performedById ?? null,
      metadata: payload.metadata,
    },
  });
}
