import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "#/components/ui/dialog";
import { pinnedNotice } from "#/lib/notices";

const DISMISSED_KEY = "scms.notice.dismissed";

export function NoticeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const notice = pinnedNotice;

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    const dismissedNotice = dismissed ? JSON.parse(dismissed) : null;
    
    if (notice && (!dismissedNotice || dismissedNotice.id !== notice.id || dismissedNotice.version !== 1)) {
      setIsOpen(true);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && notice) {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify({ id: notice.id, version: 1, dismissedAt: Date.now() }));
    }
  };

  if (!isOpen || !notice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Important Notice
            </span>
            <DialogTitle className="mt-3 text-xl">{notice.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base mt-2">{notice.summary}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3 text-sm">
          {notice.body.map((paragraph, i) => (
            <p key={i} className="text-foreground">{paragraph}</p>
          ))}
          {notice.bullets && notice.bullets.length > 0 && (
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-sm text-muted-foreground">
              {notice.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          )}
          {notice.attachments && notice.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {notice.attachments.map((att, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-2 px-2.5 py-1 text-[11px] text-muted-foreground">
                  {att.name} ({att.kind}, {att.size})
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Ref: {notice.ref}</span>
          <span>Issued: {notice.dateAd} ({notice.dateBs})</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}