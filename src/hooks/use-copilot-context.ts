"use client";

import { useEffect, useState } from "react";
import { getCopilotContextAction } from "@/lib/copilot-context-actions";

export function useCopilotContext() {
  const [context, setContext] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      const result = await getCopilotContextAction();
      if (!mounted) return;
      if (result.success) {
        setContext(result.data);
      }
      setIsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { context, isLoading };
}
