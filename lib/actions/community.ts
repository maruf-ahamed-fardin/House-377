"use server";

import { createAuditLog } from "@/lib/audit";
import { ActionResult, actionError, getMonthKeyFromDateInput, normalizeText, parseDateInput, revalidateAppPaths } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/rbac";
import {
  bazarScheduleFormSchema,
  bazarScheduleRequestDecisionSchema,
  bazarScheduleRequestFormSchema,
  timelinePostFormSchema,
  type BazarScheduleFormValues,
  type BazarScheduleRequestDecisionValues,
  type BazarScheduleRequestFormValues,
  type TimelinePostFormValues,
} from "@/lib/validations/community";

export async function saveBazarScheduleAction(values: BazarScheduleFormValues): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = bazarScheduleFormSchema.parse(values);
    const date = parseDateInput(data.date);
    const existingForDate = await prisma.bazarSchedule.findFirst({
      where: {
        date,
        ...(data.id ? { id: { not: data.id } } : undefined),
      },
    });

    if (existingForDate) {
      return {
        success: false,
        message: "Another member is already assigned to this bazar date.",
      };
    }

    const payload = {
      memberId: data.memberId,
      date,
      monthKey: getMonthKeyFromDateInput(data.date),
      notes: normalizeText(data.notes),
      createdById: admin.id,
    };

    const schedule = data.id
      ? await prisma.bazarSchedule.update({
          where: { id: data.id },
          data: payload,
        })
      : await prisma.bazarSchedule.create({
          data: payload,
        });

    await createAuditLog({
      action: data.id ? "BAZAR_SCHEDULE_UPDATED" : "BAZAR_SCHEDULE_CREATED",
      entityType: "BazarSchedule",
      entityId: schedule.id,
      performedById: admin.id,
      metadata: {
        memberId: data.memberId,
        date: data.date,
      },
    });

    revalidateAppPaths("/admin/bazar-schedule", "/bazar-schedule");

    return {
      success: true,
      message: data.id ? "Bazar schedule updated." : "Bazar schedule added.",
    };
  } catch (error) {
    return actionError("Unable to save bazar schedule right now.", error);
  }
}

export async function deleteBazarScheduleAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.bazarSchedule.delete({ where: { id } });

    await createAuditLog({
      action: "BAZAR_SCHEDULE_DELETED",
      entityType: "BazarSchedule",
      entityId: id,
      performedById: admin.id,
    });

    revalidateAppPaths("/admin/bazar-schedule", "/bazar-schedule");

    return {
      success: true,
      message: "Bazar schedule deleted.",
    };
  } catch (error) {
    return actionError("Unable to delete bazar schedule right now.", error);
  }
}

export async function submitBazarScheduleChangeRequestAction(values: BazarScheduleRequestFormValues): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const data = bazarScheduleRequestFormSchema.parse(values);
    const schedule = await prisma.bazarSchedule.findUnique({
      where: { id: data.scheduleId },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!schedule) {
      return {
        success: false,
        message: "Schedule not found.",
      };
    }

    if (user.role !== "ADMIN" && schedule.member.userId !== user.id) {
      return {
        success: false,
        message: "You can request date changes only for your own bazar duty.",
      };
    }

    const pendingRequest = await prisma.bazarScheduleChangeRequest.findFirst({
      where: {
        scheduleId: data.scheduleId,
        requesterId: user.id,
        status: "PENDING",
      },
    });

    if (pendingRequest) {
      return {
        success: false,
        message: "You already have a pending date-change request for this schedule.",
      };
    }

    const request = await prisma.bazarScheduleChangeRequest.create({
      data: {
        scheduleId: data.scheduleId,
        requesterId: user.id,
        requestedDate: parseDateInput(data.requestedDate),
        requestedMonthKey: getMonthKeyFromDateInput(data.requestedDate),
        reason: data.reason,
      },
    });

    await createAuditLog({
      action: "BAZAR_SCHEDULE_REQUEST_CREATED",
      entityType: "BazarScheduleChangeRequest",
      entityId: request.id,
      performedById: user.id,
      metadata: {
        scheduleId: data.scheduleId,
        requestedDate: data.requestedDate,
      },
    });

    revalidateAppPaths("/admin/bazar-schedule", "/bazar-schedule", "/dashboard");

    return {
      success: true,
      message: "Date-change request sent to admin.",
    };
  } catch (error) {
    return actionError("Unable to submit the schedule change request right now.", error);
  }
}

export async function handleBazarScheduleChangeRequestAction(values: BazarScheduleRequestDecisionValues): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = bazarScheduleRequestDecisionSchema.parse(values);
    const request = await prisma.bazarScheduleChangeRequest.findUnique({
      where: { id: data.requestId },
      include: {
        schedule: true,
        requester: true,
      },
    });

    if (!request) {
      return {
        success: false,
        message: "Change request not found.",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "This request has already been processed.",
      };
    }

    if (data.status === "APPROVED") {
      const existingSchedule = await prisma.bazarSchedule.findFirst({
        where: {
          date: request.requestedDate,
          id: { not: request.scheduleId },
        },
      });

      if (existingSchedule) {
        return {
          success: false,
          message: "Another bazar duty is already assigned for the requested date.",
        };
      }

      await prisma.bazarSchedule.update({
        where: { id: request.scheduleId },
        data: {
          date: request.requestedDate,
          monthKey: request.requestedMonthKey,
        },
      });
    }

    await prisma.bazarScheduleChangeRequest.update({
      where: { id: request.id },
      data: {
        status: data.status,
        adminNote: normalizeText(data.adminNote),
        handledById: admin.id,
      },
    });

    await createAuditLog({
      action: data.status === "APPROVED" ? "BAZAR_SCHEDULE_REQUEST_APPROVED" : "BAZAR_SCHEDULE_REQUEST_REJECTED",
      entityType: "BazarScheduleChangeRequest",
      entityId: request.id,
      performedById: admin.id,
      metadata: {
        scheduleId: request.scheduleId,
        requesterId: request.requesterId,
      },
    });

    revalidateAppPaths("/admin/bazar-schedule", "/bazar-schedule", "/dashboard");

    return {
      success: true,
      message: data.status === "APPROVED" ? "Schedule request approved." : "Schedule request rejected.",
    };
  } catch (error) {
    return actionError("Unable to process the schedule request right now.", error);
  }
}

export async function saveTimelinePostAction(values: TimelinePostFormValues): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const data = timelinePostFormSchema.parse(values);

    if (data.id) {
      const existingPost = await prisma.timelinePost.findUnique({
        where: { id: data.id },
      });

      if (!existingPost) {
        return {
          success: false,
          message: "Timeline post not found.",
        };
      }

      if (user.role !== "ADMIN" && existingPost.authorId !== user.id) {
        return {
          success: false,
          message: "You can edit only your own timeline posts.",
        };
      }

      await prisma.timelinePost.update({
        where: { id: data.id },
        data: {
          title: normalizeText(data.title),
          content: data.content,
        },
      });
    } else {
      const post = await prisma.timelinePost.create({
        data: {
          authorId: user.id,
          title: normalizeText(data.title),
          content: data.content,
        },
      });

      await createAuditLog({
        action: "TIMELINE_POST_CREATED",
        entityType: "TimelinePost",
        entityId: post.id,
        performedById: user.id,
        metadata: {
          title: normalizeText(data.title),
        },
      });
    }

    revalidateAppPaths("/timeline");

    return {
      success: true,
      message: data.id ? "Timeline post updated." : "Timeline post published.",
    };
  } catch (error) {
    return actionError("Unable to save the timeline post right now.", error);
  }
}

export async function deleteTimelinePostAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const post = await prisma.timelinePost.findUnique({
      where: { id },
    });

    if (!post) {
      return {
        success: false,
        message: "Timeline post not found.",
      };
    }

    if (user.role !== "ADMIN" && post.authorId !== user.id) {
      return {
        success: false,
        message: "You can delete only your own timeline posts.",
      };
    }

    await prisma.timelinePost.delete({ where: { id } });

    await createAuditLog({
      action: "TIMELINE_POST_DELETED",
      entityType: "TimelinePost",
      entityId: id,
      performedById: user.id,
    });

    revalidateAppPaths("/timeline");

    return {
      success: true,
      message: "Timeline post deleted.",
    };
  } catch (error) {
    return actionError("Unable to delete the timeline post right now.", error);
  }
}

export async function toggleTimelinePostResolvedAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const post = await prisma.timelinePost.findUnique({
      where: { id },
    });

    if (!post) {
      return {
        success: false,
        message: "Timeline post not found.",
      };
    }

    await prisma.timelinePost.update({
      where: { id },
      data: {
        isResolved: !post.isResolved,
      },
    });

    await createAuditLog({
      action: !post.isResolved ? "TIMELINE_POST_RESOLVED" : "TIMELINE_POST_REOPENED",
      entityType: "TimelinePost",
      entityId: id,
      performedById: admin.id,
    });

    revalidateAppPaths("/timeline");

    return {
      success: true,
      message: !post.isResolved ? "Post marked as resolved." : "Post reopened.",
    };
  } catch (error) {
    return actionError("Unable to update the timeline post status right now.", error);
  }
}
