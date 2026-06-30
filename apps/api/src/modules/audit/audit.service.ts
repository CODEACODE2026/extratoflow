import type { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma/client";

type CreateAuditLogInput = {
  userId?: string | null;
  entity: string;
  entityId: string;
  action: string;
  summary?: Prisma.InputJsonValue;
};

export const createAuditLog = async ({ userId, entity, entityId, action, summary }: CreateAuditLogInput) => {
  await prisma.auditLog.create({
    data: {
      userId,
      entity,
      entityId,
      action,
      summary
    }
  });
};
