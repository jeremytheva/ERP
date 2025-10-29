"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";
import { Users, RefreshCcw } from "lucide-react";

const ALL_ROLES: Role[] = ["Team Leader", "Sales", "Production", "Procurement", "Logistics"];

const ROLE_DESCRIPTIONS: Record<Role, { subtitle: string; helper: string }> = {
  "Team Leader": {
    subtitle: "Sets strategy & unlocks AI tools",
    helper: "See cross-role priorities and approvals.",
  },
  Sales: {
    subtitle: "Manages pricing & demand planning",
    helper: "Forecast volume, pricing and marketing tasks.",
  },
  Production: {
    subtitle: "Owns capacity & run schedule",
    helper: "Track lot sizes, MRP runs and production orders.",
  },
  Procurement: {
    subtitle: "Controls sourcing & sustainability",
    helper: "Monitor vendor choices and investment postings.",
  },
  Logistics: {
    subtitle: "Supervises transfers & inventory health",
    helper: "Balance DC inventory and transfer cadence.",
  },
};

export interface RoleSelectorProps {
  /**
   * Roles that should be selected when the component mounts.
   * When updated by the parent, local state realigns to match.
   */
  defaultValue?: Role[];
  /**
   * Called whenever the user toggles a checkbox. Receives the pending selection.
   */
  onChange?: (roles: Role[]) => void;
  /**
   * Called when the user presses the save button. Persist the selection here.
   */
  onSave?: (roles: Role[]) => void;
  className?: string;
  disabled?: boolean;
}

export function RoleSelector({
  defaultValue,
  onChange,
  onSave,
  className,
  disabled = false,
}: RoleSelectorProps) {
  const initialSelection = useMemo(() => {
    if (defaultValue && defaultValue.length > 0) {
      return ALL_ROLES.filter(role => defaultValue.includes(role));
    }
    return ALL_ROLES;
  }, [defaultValue]);

  const [pendingRoles, setPendingRoles] = useState<Role[]>(initialSelection);
  const [savedRoles, setSavedRoles] = useState<Role[]>(initialSelection);
  const hasInitialised = useRef(false);

  useEffect(() => {
    setPendingRoles(initialSelection);
    if (!hasInitialised.current) {
      setSavedRoles(initialSelection);
      hasInitialised.current = true;
    }
  }, [initialSelection]);

  const toggleRole = (role: Role, checked: boolean) => {
    setPendingRoles(prev => {
      const nextSelection = checked
        ? Array.from(new Set([...prev, role]))
        : prev.filter(item => item !== role);
      onChange?.(nextSelection);
      return nextSelection;
    });
  };

  const selectAll = () => {
    setPendingRoles(ALL_ROLES);
    onChange?.(ALL_ROLES);
  };

  const clearSelection = () => {
    setPendingRoles([]);
    onChange?.([]);
  };

  const handleSave = () => {
    setSavedRoles(pendingRoles);
    onSave?.(pendingRoles);
  };

  const hasChanges = useMemo(() => {
    if (pendingRoles.length !== savedRoles.length) return true;
    return pendingRoles.some(role => !savedRoles.includes(role));
  }, [pendingRoles, savedRoles]);

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-lg">Team Role Focus</CardTitle>
            <CardDescription>Select which roles to surface on the task board.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={selectAll} disabled={disabled}>
            Select all
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={clearSelection} disabled={disabled}>
            Clear
          </Button>
        </div>
        <div className="space-y-3">
          {ALL_ROLES.map(role => {
            const isChecked = pendingRoles.includes(role);
            const roleMeta = ROLE_DESCRIPTIONS[role];

            return (
              <label
                key={role}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  isChecked ? "border-primary/60 bg-primary/5" : "border-border hover:bg-muted/40",
                  disabled && "cursor-not-allowed opacity-70"
                )}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={value => toggleRole(role, Boolean(value))}
                  disabled={disabled}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{role}</span>
                    <Badge variant={isChecked ? "default" : "outline"}>
                      {isChecked ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{roleMeta.subtitle}</p>
                  <p className="text-xs text-muted-foreground/80">{roleMeta.helper}</p>
                </div>
              </label>
            );
          })}
        </div>
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || disabled}
            className="font-semibold"
          >
            Save selection
          </Button>
          {hasChanges && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCcw className="h-3.5 w-3.5" />
              Unsaved changes
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
