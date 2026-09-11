import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { BLOCK_LIBRARY } from "#/services/website";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { ScrollArea } from "#/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import type { BlockType } from "#/types";

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (type: BlockType) => void;
  busy?: boolean;
}

const GROUP_ORDER: ("Layout" | "Content" | "Dynamic" | "Contact")[] = ["Layout", "Content", "Dynamic", "Contact"];

export function AddBlockDialog({ open, onOpenChange, onAdd, busy = false }: AddBlockDialogProps) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const term = query.trim().toLowerCase();
    return GROUP_ORDER.map((group) => ({
      group,
      items: BLOCK_LIBRARY.filter(
        (item) =>
          item.group === group &&
          (!term || `${item.label} ${item.description}`.toLowerCase().includes(term)),
      ),
    })).filter((entry) => entry.items.length > 0);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover p-0 sm:max-w-xl" data-testid="cms-add-block-dialog">
        <DialogHeader className="border-b border-hairline px-5 py-4">
          <DialogTitle className="font-display">Add a section</DialogTitle>
          <DialogDescription>
            Sections are added to the bottom of the page — drag to reposition afterwards.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              placeholder="Search sections…"
              className="h-9 pl-8 text-sm"
              data-testid="cms-add-block-search"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="max-h-[54vh]">
          <div className="space-y-4 px-5 py-4">
            {grouped.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No sections match that search.</p>
            )}
            {grouped.map((entry) => (
              <div key={entry.group}>
                <p className="eyebrow-label mb-2">{entry.group}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {entry.items.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      disabled={busy}
                      data-testid={`cms-add-block-${item.type}`}
                      onClick={() => onAdd(item.type)}
                      className="group rounded-lg border border-hairline bg-surface-1 p-2.5 text-left transition-colors duration-150 hover:border-primary/40 hover:bg-surface-2 focus-ring disabled:opacity-60"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-medium text-foreground">{item.label}</span>
                        <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                      </span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">
                        {item.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end border-t border-hairline px-5 py-3.5">
          <Button variant="outline" size="sm" data-testid="cms-add-block-close" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
