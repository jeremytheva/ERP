"use server";

import { Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import { z } from "zod";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const actionItemCreateSchema = z.object({
  idToken: z.string().min(1),
  text: z.string().min(1, "Action item text is required."),
  ownerRole: z.string().optional(),
  ownerName: z.string().optional(),
  isCustom: z.boolean().optional(),
});

const actionItemUpdateSchema = z.object({
  idToken: z.string().min(1),
  itemId: z.string().min(1),
  updates: z
    .object({
      text: z.string().min(1).optional(),
      completed: z.boolean().optional(),
      ownerRole: z.string().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one update is required.",
    }),
});

const actionItemDeleteSchema = z.object({
  idToken: z.string().min(1),
  itemId: z.string().min(1),
});

const teamAlignmentRequestSchema = z.object({
  idToken: z.string().min(1),
});

const competitorNoteStatusSchema = z.enum(["intel", "analysis", "response"]);

const competitorNoteCreateSchema = z.object({
  idToken: z.string().min(1),
  title: z.string().min(1, "A title is required."),
  summary: z.string().min(1, "A summary is required."),
  role: z.string().optional(),
  status: competitorNoteStatusSchema.default("intel"),
  createdByName: z.string().optional(),
});

const competitorNoteUpdateSchema = z.object({
  idToken: z.string().min(1),
  noteId: z.string().min(1),
  updates: z
    .object({
      title: z.string().min(1).optional(),
      summary: z.string().min(1).optional(),
      status: competitorNoteStatusSchema.optional(),
      role: z.string().optional(),
      order: z.number().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one update is required.",
    }),
});

const competitorNoteDeleteSchema = z.object({
  idToken: z.string().min(1),
  noteId: z.string().min(1),
});

type ActionItemServerDoc = {
  text: string;
  completed: boolean;
  isCustom?: boolean;
  ownerUid: string;
  ownerRole?: string | null;
  ownerName?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type CompetitorNoteServerDoc = {
  title: string;
  summary: string;
  status: z.infer<typeof competitorNoteStatusSchema>;
  role?: string | null;
  ownerUid: string;
  createdByName?: string | null;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

async function verifyToken(idToken: string) {
  try {
    return await adminAuth.verifyIdToken(idToken, true);
  } catch (error) {
    console.error("Failed to verify Firebase ID token", error);
    throw new Error("Authentication required.");
  }
}

const ROLE_LABELS: Record<string, string> = {
  procurement: "Procurement",
  production: "Production",
  logistics: "Logistics",
  sales: "Sales",
  teamleader: "Team Leader",
  "team-leader": "Team Leader",
  team_leader: "Team Leader",
  teamlead: "Team Leader",
  team: "Team",
};

function resolveRoleName(roleId?: string | null) {
  if (!roleId) return "Unassigned";
  return ROLE_LABELS[roleId] ?? roleId;
}

export async function createActionItemAction(
  input: z.infer<typeof actionItemCreateSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = actionItemCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid action item." };
  }

  try {
    const { idToken, text, ownerRole, ownerName, isCustom } = parsed.data;
    const decoded = await verifyToken(idToken);
    const collectionRef = adminFirestore
      .collection("users")
      .doc(decoded.uid)
      .collection("actionItems");
    const docRef = collectionRef.doc();
    const now = Timestamp.now();
    const payload: ActionItemServerDoc = {
      text,
      completed: false,
      isCustom: isCustom ?? true,
      ownerUid: decoded.uid,
      ownerRole: ownerRole ?? null,
      ownerName: ownerName ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(payload);
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error("createActionItemAction", error);
    return { success: false, error: "Unable to create action item." };
  }
}

export async function updateActionItemAction(
  input: z.infer<typeof actionItemUpdateSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = actionItemUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid action item." };
  }

  try {
    const { idToken, itemId, updates } = parsed.data;
    const decoded = await verifyToken(idToken);
    const docRef = adminFirestore
      .collection("users")
      .doc(decoded.uid)
      .collection("actionItems")
      .doc(itemId);

    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return { success: false, error: "Action item not found." };
    }

    const data = snapshot.data() as ActionItemServerDoc | undefined;
    if (!data || data.ownerUid !== decoded.uid) {
      return { success: false, error: "You are not allowed to modify this item." };
    }

    const updatePayload: Partial<ActionItemServerDoc> = {
      ...updates,
      ownerRole: updates.ownerRole ?? data.ownerRole ?? null,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updatePayload);
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error("updateActionItemAction", error);
    return { success: false, error: "Unable to update action item." };
  }
}

export async function deleteActionItemAction(
  input: z.infer<typeof actionItemDeleteSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = actionItemDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid action." };
  }

  try {
    const { idToken, itemId } = parsed.data;
    const decoded = await verifyToken(idToken);
    const docRef = adminFirestore
      .collection("users")
      .doc(decoded.uid)
      .collection("actionItems")
      .doc(itemId);

    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return { success: false, error: "Action item not found." };
    }

    const data = snapshot.data() as ActionItemServerDoc | undefined;
    if (!data || data.ownerUid !== decoded.uid) {
      return { success: false, error: "You are not allowed to delete this item." };
    }

    await docRef.delete();
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error("deleteActionItemAction", error);
    return { success: false, error: "Unable to delete action item." };
  }
}

export async function getTeamAlignmentSnapshotAction(
  input: z.infer<typeof teamAlignmentRequestSchema>
): Promise<
  ActionResult<{
    summaries: Array<{
      roleId: string;
      roleName: string;
      completed: number;
      total: number;
      pendingTitles: string[];
      lastUpdated: string | null;
    }>;
    updatedAt: string | null;
  }>
> {
  const parsed = teamAlignmentRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid request." };
  }

  try {
    const { idToken } = parsed.data;
    await verifyToken(idToken);

    const snapshot = await adminFirestore.collectionGroup("actionItems").get();

    const summariesMap = new Map<
      string,
      {
        roleId: string;
        roleName: string;
        completed: number;
        total: number;
        pendingTitles: string[];
        lastUpdated: Timestamp | null;
      }
    >();

    let mostRecentUpdate: Timestamp | null = null;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ActionItemServerDoc;
      const roleId = data.ownerRole ?? "unassigned";
      const roleName = resolveRoleName(roleId);
      const existing = summariesMap.get(roleId) ?? {
        roleId,
        roleName,
        completed: 0,
        total: 0,
        pendingTitles: [] as string[],
        lastUpdated: null as Timestamp | null,
      };

      existing.total += 1;
      if (data.completed) {
        existing.completed += 1;
      } else if (existing.pendingTitles.length < 3) {
        existing.pendingTitles.push(data.text);
      }

      if (!existing.lastUpdated || existing.lastUpdated.toMillis() < data.updatedAt.toMillis()) {
        existing.lastUpdated = data.updatedAt;
      }

      summariesMap.set(roleId, existing);

      if (!mostRecentUpdate || mostRecentUpdate.toMillis() < data.updatedAt.toMillis()) {
        mostRecentUpdate = data.updatedAt;
      }
    });

    const summaries = Array.from(summariesMap.values()).map((summary) => ({
      roleId: summary.roleId,
      roleName: summary.roleName,
      completed: summary.completed,
      total: summary.total,
      pendingTitles: summary.pendingTitles,
      lastUpdated: summary.lastUpdated
        ? new Date(summary.lastUpdated.toMillis()).toISOString()
        : null,
    }));

    summaries.sort((a, b) => a.roleName.localeCompare(b.roleName));

    return {
      success: true,
      data: {
        summaries,
        updatedAt: mostRecentUpdate
          ? new Date(mostRecentUpdate.toMillis()).toISOString()
          : null,
      },
    };
  } catch (error) {
    console.error("getTeamAlignmentSnapshotAction", error);
    return { success: false, error: "Unable to load team alignment." };
  }
}

export async function createCompetitorNoteAction(
  input: z.infer<typeof competitorNoteCreateSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = competitorNoteCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid note." };
  }

  try {
    const { idToken, title, summary, status, role, createdByName } = parsed.data;
    const decoded = await verifyToken(idToken);
    const collectionRef = adminFirestore.collection("competitorNotes");
    const docRef = collectionRef.doc();
    const now = Timestamp.now();
    const payload: CompetitorNoteServerDoc = {
      title,
      summary,
      status,
      role: role ?? null,
      ownerUid: decoded.uid,
      createdByName: createdByName ?? null,
      order: Date.now(),
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(payload);
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error("createCompetitorNoteAction", error);
    return { success: false, error: "Unable to create note." };
  }
}

export async function updateCompetitorNoteAction(
  input: z.infer<typeof competitorNoteUpdateSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = competitorNoteUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid update." };
  }

  try {
    const { idToken, noteId, updates } = parsed.data;
    await verifyToken(idToken);
    const docRef = adminFirestore.collection("competitorNotes").doc(noteId);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return { success: false, error: "Competitor note not found." };
    }

    const updatePayload: Partial<CompetitorNoteServerDoc> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updatePayload);
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error("updateCompetitorNoteAction", error);
    return { success: false, error: "Unable to update note." };
  }
}

export async function deleteCompetitorNoteAction(
  input: z.infer<typeof competitorNoteDeleteSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = competitorNoteDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid request." };
  }

  try {
    const { idToken, noteId } = parsed.data;
    await verifyToken(idToken);
    const docRef = adminFirestore.collection("competitorNotes").doc(noteId);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return { success: false, error: "Competitor note not found." };
    }

    await docRef.delete();
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error("deleteCompetitorNoteAction", error);
    return { success: false, error: "Unable to delete note." };
  }
}
