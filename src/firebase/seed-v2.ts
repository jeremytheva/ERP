import { writeBatch, doc, Firestore } from "firebase/firestore";
import { ALL_TASKS } from "@/data/tasks-v2";

export async function mergeV2Tasks(firestore: Firestore) {
  const batch = writeBatch(firestore);
  for (const task of ALL_TASKS) {
    batch.set(doc(firestore, "tasks", task.id), task, { merge: true });
  }
  await batch.commit();
}
