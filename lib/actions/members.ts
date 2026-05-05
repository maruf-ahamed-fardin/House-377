"use server";

import { hash } from "bcryptjs";

import { createAuditLog } from "@/lib/audit";
import { ActionResult, actionError, normalizeText, parseDateInput, revalidateAppPaths } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { memberFormSchema, type MemberFormValues } from "@/lib/validations/member";

export async function saveMemberAction(values: MemberFormValues): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = memberFormSchema.parse(values);
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: { memberProfile: true },
    });

    if (existingUser && existingUser.memberProfile?.id !== data.id) {
      return {
        success: false,
        message: "A user with this email already exists.",
      };
    }

    const passwordHash = data.password ? await hash(data.password, 10) : undefined;

    if (data.id) {
      const member = await prisma.memberProfile.findUnique({
        where: { id: data.id },
        include: { user: true },
      });

      if (!member) {
        return {
          success: false,
          message: "Member not found.",
        };
      }

      await prisma.user.update({
        where: { id: member.userId },
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone,
          image: normalizeText(data.image),
          isActive: data.status === "ACTIVE",
          ...(passwordHash ? { passwordHash } : {}),
        },
      });

      const updatedMember = await prisma.memberProfile.update({
        where: { id: data.id },
        data: {
          permanentAddress: data.permanentAddress,
          roomNumber: data.roomNumber,
          joiningDate: parseDateInput(data.joiningDate),
          status: data.status,
          guardianPhone: normalizeText(data.guardianPhone),
          monthlyRentShare: data.monthlyRentShare,
          notes: normalizeText(data.notes),
        },
      });

      await createAuditLog({
        action: "MEMBER_UPDATED",
        entityType: "MemberProfile",
        entityId: updatedMember.id,
        performedById: admin.id,
        metadata: {
          name: data.name,
          roomNumber: data.roomNumber,
          status: data.status,
        },
      });
    } else {
      const createdUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash: passwordHash!,
          role: "MEMBER",
          phone: data.phone,
          image: normalizeText(data.image),
          isActive: data.status === "ACTIVE",
          memberProfile: {
            create: {
              permanentAddress: data.permanentAddress,
              roomNumber: data.roomNumber,
              joiningDate: parseDateInput(data.joiningDate),
              status: data.status,
              guardianPhone: normalizeText(data.guardianPhone),
              monthlyRentShare: data.monthlyRentShare,
              notes: normalizeText(data.notes),
            },
          },
        },
        include: {
          memberProfile: true,
        },
      });

      await createAuditLog({
        action: "MEMBER_CREATED",
        entityType: "MemberProfile",
        entityId: createdUser.memberProfile!.id,
        performedById: admin.id,
        metadata: {
          name: data.name,
          roomNumber: data.roomNumber,
        },
      });
    }

    revalidateAppPaths("/admin/members", "/profile");

    return {
      success: true,
      message: data.id ? "Member updated successfully." : "Member added successfully.",
    };
  } catch (error) {
    return actionError("Unable to save member right now.", error);
  }
}

export async function deleteMemberAction(memberId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const member = await prisma.memberProfile.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      return {
        success: false,
        message: "Member not found.",
      };
    }

    await prisma.user.delete({
      where: { id: member.userId },
    });

    await createAuditLog({
      action: "MEMBER_DELETED",
      entityType: "MemberProfile",
      entityId: member.id,
      performedById: admin.id,
      metadata: {
        name: member.user.name,
        email: member.user.email,
      },
    });

    revalidateAppPaths("/admin/members", "/profile");

    return {
      success: true,
      message: "Member removed successfully.",
    };
  } catch (error) {
    return actionError("Unable to remove member right now.", error);
  }
}
