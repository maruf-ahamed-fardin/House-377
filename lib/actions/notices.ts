"use server";

import { createAuditLog } from "@/lib/audit";
import { ActionResult, actionError, parseDateInput, revalidateAppPaths } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { noticeFormSchema, type NoticeFormValues } from "@/lib/validations/finance";

export async function saveNoticeAction(values: NoticeFormValues): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = noticeFormSchema.parse(values);
    const payload = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      date: parseDateInput(data.date),
      isPublished: data.isPublished,
      createdById: admin.id,
    };

    const notice = data.id
      ? await prisma.notice.update({
          where: { id: data.id },
          data: payload,
        })
      : await prisma.notice.create({
          data: payload,
        });

    await createAuditLog({
      action: data.id ? "NOTICE_UPDATED" : "NOTICE_CREATED",
      entityType: "Notice",
      entityId: notice.id,
      performedById: admin.id,
      metadata: {
        title: data.title,
        priority: data.priority,
      },
    });

    revalidateAppPaths("/admin/notices", "/profile");

    return {
      success: true,
      message: "Notice saved successfully.",
    };
  } catch (error) {
    return actionError("Unable to save notice right now.", error);
  }
}

export async function deleteNoticeAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.notice.delete({ where: { id } });

    await createAuditLog({
      action: "NOTICE_DELETED",
      entityType: "Notice",
      entityId: id,
      performedById: admin.id,
    });

    revalidateAppPaths("/admin/notices", "/profile");

    return {
      success: true,
      message: "Notice removed successfully.",
    };
  } catch (error) {
    return actionError("Unable to remove notice right now.", error);
  }
}
