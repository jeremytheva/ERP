"use server";

import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/firebase/admin";

const DEFAULT_TEAM_ID = process.env.ERPSIM_TEAM_ID || "default";

const actionItemStatusSchema = z.enum([
  "backlog",
  "in_progress",
  "blocked",
  "done",
]);

const actionItemPrioritySchema = z.enum(["low", "medium", "high"]);

const ActionItemDataSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  ownerUid: z.string(),
  ownerProfileId: z.string(),
  ownerRole: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: actionItemStatusSchema,
  priority: actionItemPrioritySchema,
  dueRound: z.number().optional().nullable(),
  order: z.number(),
  createdAt: z.instanceof(Date),
  updatedAt: z.instanceof(Date),
});
type ActionItemData = z.infer<typeof ActionItemDataSchema>;

export type ActionItemRecord = Omit<ActionItemData, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

const competitorNoteStatusSchema = z.enum([
  "observation",
  "insight",
  "response",
  "watch",
]);

const competitorNotePrioritySchema = actionItemPrioritySchema;

const CompetitorNoteDataSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  ownerUid: z.string(),
  authorName: z.string(),
  competitor: z.string(),
  title: z.string(),
  summary: z.string(),
  status: competitorNoteStatusSchema,
  priority: competitorNotePrioritySchema,
  focusRoles: z.array(z.string()),
  order: z.number(),
  createdAt: z.instanceof(Date),
  updatedAt: z.instanceof(Date),
});
type CompetitorNoteData = z.infer<typeof CompetitorNoteDataSchema>;

export type CompetitorNoteRecord = Omit<CompetitorNoteData, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

const listActionItemsInputSchema = z.object({
  idToken: z.string(),
  ownerProfileId: z.string().optional(),
});

type ListActionItemsInput = z.infer<typeof listActionItemsInputSchema>;

const createActionItemInputSchema = z.object({
  idToken: z.string(),
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  ownerProfileId: z.string(),
  ownerRole: z.string(),
  priority: actionItemPrioritySchema.default("medium"),
});

type CreateActionItemInput = z.infer<typeof createActionItemInputSchema>;

const updateActionItemInputSchema = z.object({
  idToken: z.string(),
  id: z.string(),
  updates: z.object({
    title: z.string().optional(),
    description: z.string().optional().nullable(),
    status: actionItemStatusSchema.optional(),
    priority: actionItemPrioritySchema.optional(),
    dueRound: z.number().nullable().optional(),
    ownerProfileId: z.string().optional(),
    ownerRole: z.string().optional(),
    order: z.number().optional(),
  }),
});

type UpdateActionItemInput = z.infer<typeof updateActionItemInputSchema>;

const deleteActionItemInputSchema = z.object({
  idToken: z.string(),
  id: z.string(),
});

type DeleteActionItemInput = z.infer<typeof deleteActionItemInputSchema>;

const listCompetitorNotesInputSchema = z.object({
  idToken: z.string(),
});

type ListCompetitorNotesInput = z.infer<typeof listCompetitorNotesInputSchema>;

const createCompetitorNoteInputSchema = z.object({
  idToken: z.string(),
  title: z.string().min(3),
  summary: z.string().min(5),
  competitor: z.string().min(2),
  focusRoles: z.array(z.string()).min(1),
  status: competitorNoteStatusSchema.default("observation"),
  priority: competitorNotePrioritySchema.default("medium"),
  authorName: z.string().min(2),
});

type CreateCompetitorNoteInput = z.infer<typeof createCompetitorNoteInputSchema>;

const updateCompetitorNoteInputSchema = z.object({
  idToken: z.string(),
  id: z.string(),
  updates: z.object({
    title: z.string().optional(),
    summary: z.string().optional(),
    competitor: z.string().optional(),
    focusRoles: z.array(z.string()).optional(),
    status: competitorNoteStatusSchema.optional(),
    priority: competitorNotePrioritySchema.optional(),
    order: z.number().optional(),
  }),
});

type UpdateCompetitorNoteInput = z.infer<typeof updateCompetitorNoteInputSchema>;

const deleteCompetitorNoteInputSchema = z.object({
  idToken: z.string(),
  id: z.string(),
});

type DeleteCompetitorNoteInput = z.infer<typeof deleteCompetitorNoteInputSchema>;

export type ServerActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function verifyIdToken(idToken: string) {
  const { auth } = getFirebaseAdmin();
  try {
    return await auth.verifyIdToken(idToken);
  } catch (error) {
    console.error("Failed to verify Firebase ID token", error);
    throw new Error("Unauthorized request.");
  }
}

function mapActionItem(doc: FirebaseFirestore.DocumentSnapshot): ActionItemRecord {
  const data = doc.data();
  if (!data) {
    throw new Error("Invalid action item payload.");
  }
  const parsed = ActionItemDataSchema.parse({
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  });
  return {
    ...parsed,
    createdAt: parsed.createdAt.toISOString(),
    updatedAt: parsed.updatedAt.toISOString(),
  };
}

function mapCompetitorNote(doc: FirebaseFirestore.DocumentSnapshot): CompetitorNoteRecord {
  const data = doc.data();
  if (!data) {
    throw new Error("Invalid competitor note payload.");
  }
  const parsed = CompetitorNoteDataSchema.parse({
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  });
  return {
    ...parsed,
    createdAt: parsed.createdAt.toISOString(),
    updatedAt: parsed.updatedAt.toISOString(),
  };
}

export async function listActionItemsAction(
  input: ListActionItemsInput
): Promise<ServerActionResult<ActionItemRecord[]>> {
  const parsed = listActionItemsInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request parameters." };
  }

  try {
    await verifyIdToken(parsed.data.idToken);
    const { firestore } = getFirebaseAdmin();
    const snapshot = await firestore
      .collection("actionItems")
      .where("teamId", "==", DEFAULT_TEAM_ID)
      .get();

    const items = snapshot.docs
      .map(mapActionItem)
      .filter((item) =>
        parsed.data.ownerProfileId
          ? item.ownerProfileId === parsed.data.ownerProfileId
          : true
      )
      .sort((a, b) => b.order - a.order);

    return { success: true, data: items };
  } catch (error) {
    console.error("Failed to list action items", error);
    return { success: false, error: "Unable to load action items." };
  }
}

export async function createActionItemAction(
  input: CreateActionItemInput
): Promise<ServerActionResult<ActionItemRecord>> {
  const parsed = createActionItemInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request parameters." };
  }

  try {
    const decoded = await verifyIdToken(parsed.data.idToken);
    const { firestore } = getFirebaseAdmin();
    const docRef = firestore.collection("actionItems").doc();
    const now = Timestamp.now();
    const payload = {
      id: docRef.id,
      teamId: DEFAULT_TEAM_ID,
      ownerUid: decoded.uid,
      ownerProfileId: parsed.data.ownerProfileId,
      ownerRole: parsed.data.ownerRole,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      status: "backlog" as const,
      priority: parsed.data.priority,
      dueRound: null,
      order: Date.now(),
      createdAt: now,
      updatedAt: now,
    } satisfies Record<string, unknown>;

    await docRef.set(payload);
    const stored = await docRef.get();
    return { success: true, data: mapActionItem(stored) };
  } catch (error) {
    console.error("Failed to create action item", error);
    return { success: false, error: "Unable to create action item." };
  }
}

export async function updateActionItemAction(
  input: UpdateActionItemInput
): Promise<ServerActionResult<ActionItemRecord>> {
  const parsed = updateActionItemInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request parameters." };
  }

  try {
    await verifyIdToken(parsed.data.idToken);
    const { firestore } = getFirebaseAdmin();
    const docRef = firestore.collection("actionItems").doc(parsed.data.id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return { success: false, error: "Action item not found." };
    }

    const updates = {
      ...parsed.data.updates,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updates);
    const updatedSnapshot = await docRef.get();
    return { success: true, data: mapActionItem(updatedSnapshot) };
  } catch (error) {
    console.error("Failed to update action item", error);
    return { success: false, error: "Unable to update action item." };
  }
}

export async function deleteActionItemAction(
  input: DeleteActionItemInput
): Promise<ServerActionResult<null>> {
  const parsed = deleteActionItemInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request parameters." };
  }

  try {
    await verifyIdToken(parsed.data.idToken);
    const { firestore } = getFirebaseAdmin();
    await firestore.collection("actionItems").doc(parsed.data.id).delete();
    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to delete action item", error);
    return { success: false, error: "Unable to delete action item." };
  }
}

export async function listCompetitorNotesAction(
  input: ListCompetitorNotesInput
): Promise<ServerActionResult<CompetitorNoteRecord[]>> {
  const parsed = listCompetitorNotesInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request parameters." };
  }

  try {
    await verifyIdToken(parsed.data.idToken);
    const { firestore } = getFirebaseAdmin();
    const snapshot = await firestore
      .collection("competitorNotes")
      .where("teamId", "==", DEFAULT_TEAM_ID)
      .get();

    const notes = snapshot.docs.map(mapCompetitorNote).sort((a, b) => b.order - a.order);
    return { success: true, data: notes };
  } catch (error) {
    console.error("Failed to list competitor notes", error);
    return { success: false, error: "Unable to load competitor notes." };
  }
}

export async function createCompetitorNoteAction(
  input: CreateCompetitorNoteInput
): Promise<ServerActionResult<CompetitorNoteRecord>> {
  const parsed = createCompetitorNoteInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request parameters." };
  }

  try {
    const decoded = await verifyIdToken(parsed.data.idToken);
    const { firestore } = getFirebaseAdmin();
    const docRef = firestore.collection("competitorNotes").doc();
    const now = Timestamp.now();
    const payload = {
      id: docRef.id,
      teamId: DEFAULT_TEAM_ID,
      ownerUid: decoded.uid,
      authorName: parsed.data.authorName,
      competitor: parsed.data.competitor,
      title: parsed.data.title,
      summary: parsed.data.summary,
      status: parsed.data.status,
      priority: parsed.data.priority,
      focusRoles: parsed.data.focusRoles,
      order: Date.now(),
      createdAt: now,
      updatedAt: now,
    } satisfies Record<string, unknown>;

    await docRef.set(payload);
    const stored = await docRef.get();
    return { success: true, data: mapCompetitorNote(stored) };
  } catch (error) {
    console.error("Failed to create competitor note", error);
    return { success: false, error: "Unable to create competitor note." };
  }
}

export async function updateCompetitorNoteAction(
  input: UpdateCompetitorNoteInput
): Promise<ServerActionResult<CompetitorNoteRecord>> {
  const parsed = updateCompetitorNoteInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request parameters." };
  }

  try {
    await verifyIdToken(parsed.data.idToken);
    const { firestore } = getFirebaseAdmin();
    const docRef = firestore.collection("competitorNotes").doc(parsed.data.id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return { success: false, error: "Competitor note not found." };
    }

    const updates = {
      ...parsed.data.updates,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updates);
    const updatedSnapshot = await docRef.get();
    return { success: true, data: mapCompetitorNote(updatedSnapshot) };
  } catch (error) {
    console.error("Failed to update competitor note", error);
    return { success: false, error: "Unable to update competitor note." };
  }
}

export async function deleteCompetitorNoteAction(
  input: DeleteCompetitorNoteInput
): Promise<ServerActionResult<null>> {
  const parsed = deleteCompetitorNoteInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request parameters." };
  }

  try {
    await verifyIdToken(parsed.data.idToken);
    const { firestore } = getFirebaseAdmin();
    await firestore.collection("competitorNotes").doc(parsed.data.id).delete();
    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to delete competitor note", error);
    return { success: false, error: "Unable to delete competitor note." };
  }
}
