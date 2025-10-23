"use client";

import { useState } from "react";
import { useActionItems } from "@/hooks/use-game-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActionItemsManager() {
  const { actionItems, addActionItem, toggleActionItem, removeActionItem } = useActionItems();
  const [newItemText, setNewItemText] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim()) {
      addActionItem(newItemText.trim());
      setNewItemText("");
    }
  };

  const pendingItems = actionItems.filter(item => !item.completed);
  const completedItems = actionItems.filter(item => item.completed);

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddItem} className="flex gap-2">
        <Input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add a new action item..."
        />
        <Button type="submit" disabled={!newItemText.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pending Items</h3>
        {pendingItems.length > 0 ? (
          <ul className="space-y-2">
            {pendingItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/50 group">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={item.completed}
                  onCheckedChange={() => toggleActionItem(item.id)}
                />
                <label
                  htmlFor={`item-${item.id}`}
                  className="flex-1 text-sm font-medium leading-none"
                >
                  {item.text}
                </label>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => removeActionItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No pending items. Great job!</p>
        )}
      </div>

      {completedItems.length > 0 && (
        <div className="space-y-4">
           <h3 className="text-lg font-semibold">Completed Items</h3>
            <ul className="space-y-2">
                {completedItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/30 group">
                        <Checkbox
                        id={`item-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={() => toggleActionItem(item.id)}
                        />
                        <label
                        htmlFor={`item-${item.id}`}
                        className={cn("flex-1 text-sm leading-none text-muted-foreground line-through")}
                        >
                        {item.text}
                        </label>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => removeActionItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
}
