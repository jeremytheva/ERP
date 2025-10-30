"use server";

import { promises as fs } from "fs";
import path from "path";

type ContextResult = { success: true; data: string } | { success: false; error: string };

const CONTEXT_DOC_PATH = path.join(process.cwd(), "docs", "context-injection.md");

export async function getCopilotContextAction(): Promise<ContextResult> {
  try {
    const contents = await fs.readFile(CONTEXT_DOC_PATH, "utf-8").catch((error) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return "";
      }
      throw error;
    });

    return { success: true, data: contents };
  } catch (error) {
    console.error("getCopilotContextAction", error);
    return { success: false, error: "Unable to load context." };
  }
}
