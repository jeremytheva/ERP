"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ROLE_ACTION_ITEMS, USER_PROFILES } from "@/lib/mock-data";
import { CheckCircle2 } from "lucide-react";

export function RoleTasks() {
  const allProfiles = [...USER_PROFILES, { id: 'team_leader', name: 'Team Leader', avatarUrl: '' }];

  return (
    <Accordion type="single" collapsible defaultValue="procurement">
      {allProfiles.map((profile) => {
        const tasks = ROLE_ACTION_ITEMS[profile.id];
        if (!tasks) return null;

        return (
          <AccordionItem value={profile.id} key={profile.id}>
            <AccordionTrigger className="font-semibold text-base hover:no-underline">
              {profile.name}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-3 pl-2">
                {tasks.map((task, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{task}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
