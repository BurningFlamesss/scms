import { useEffect, useMemo, useState } from "react";
import { Copy, Eye, EyeOff, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import {
  BLOCK_FIELDS,
  STYLE_ALIGNMENT,
  STYLE_BACKGROUNDS,
  STYLE_SPACING,
  rows,
  str,
  tags,
  type FieldDef,
} from "#/components/cms/block-fields";
import { Panel } from "#/components/common/Panel";
import { EmptyState } from "#/components/common/EmptyState";
import { RichTextEditor } from "#/components/common/RichTextEditor";
import { ImageUploader } from "#/components/common/ImageUploader";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Switch } from "#/components/ui/switch";
import { Separator } from "#/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { MousePointerClick } from "lucide-react";
import type { ContentBlock } from "#/types";

interface BlockInspectorProps {
  block: ContentBlock | null;
  canManage: boolean;
  saving: boolean;
  onSave: (fields: Record<string, unknown>) => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function BlockInspector({
  block,
  canManage,
  saving,
  onSave,
  onToggleVisibility,
  onDuplicate,
  onDelete,
}: BlockInspectorProps) {
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setDraft(block ? JSON.parse(JSON.stringify(block.fields)) : {});
    setTagInput("");
  }, [block?.id, block?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = useMemo(
    () => (block ? JSON.stringify(draft) !== JSON.stringify(block.fields) : false),
    [draft, block],
  );

  if (!block) {
    return (
      <Panel title="Inspector" testId="cms-inspector">
        <EmptyState
          compact
          icon={MousePointerClick}
          title="No section selected"
          description="Choose a section from the page outline to edit its content, style and visibility."
          testId="cms-inspector-empty"
        />
      </Panel>
    );
  }

  const set = (key: string, value: unknown) => setDraft((current) => ({ ...current, [key]: value }));

  const setItem = (listKey: string, index: number, itemKey: string, value: unknown) => {
    setDraft((current) => {
      const list = Array.isArray(current[listKey]) ? [...(current[listKey] as Record<string, unknown>[])] : [];
      list[index] = { ...list[index], [itemKey]: value };
      return { ...current, [listKey]: list };
    });
  };

  const addItem = (field: Extract<FieldDef, { kind: "list" }>) => {
    setDraft((current) => {
      const list = Array.isArray(current[field.key]) ? [...(current[field.key] as Record<string, unknown>[])] : [];
      const blank: Record<string, unknown> = {};
      field.itemFields.forEach((itemField) => {
        blank[itemField.key] = "";
      });
      return { ...current, [field.key]: [...list, blank] };
    });
  };

  const removeItem = (listKey: string, index: number) => {
    setDraft((current) => {
      const list = Array.isArray(current[listKey]) ? [...(current[listKey] as Record<string, unknown>[])] : [];
      list.splice(index, 1);
      return { ...current, [listKey]: list };
    });
  };

  const moveItem = (listKey: string, index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const list = Array.isArray(current[listKey]) ? [...(current[listKey] as Record<string, unknown>[])] : [];
      const target = index + direction;
      if (target < 0 || target >= list.length) return current;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...current, [listKey]: list };
    });
  };

  const addTag = (listKey: string) => {
    const value = tagInput.trim();
    if (!value) return;
    setDraft((current) => {
      const list = Array.isArray(current[listKey]) ? (current[listKey] as string[]) : [];
      if (list.includes(value)) return current;
      return { ...current, [listKey]: [...list, value] };
    });
    setTagInput("");
  };

  const removeTag = (listKey: string, value: string) => {
    setDraft((current) => {
      const list = Array.isArray(current[listKey]) ? (current[listKey] as string[]) : [];
      return { ...current, [listKey]: list.filter((item) => item !== value) };
    });
  };

  const fields = BLOCK_FIELDS[block.type] ?? [];

  const renderField = (field: FieldDef) => {
    const inputId = `cms-field-${block.id}-${field.key}`;

    if (field.kind === "list") {
      const items = rows(draft, field.key);
      return (
        <div key={field.key} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs">{field.label}</Label>
            <Button
              variant="outline"
              size="sm"
              className="h-6 gap-1 px-1.5 text-[11px]"
              disabled={!canManage}
              data-testid={`cms-list-add-${field.key}`}
              onClick={() => addItem(field)}
            >
              <Plus className="h-3 w-3" /> {field.addLabel}
            </Button>
          </div>
          {items.length === 0 && (
            <p className="rounded-lg border border-dashed border-hairline px-3 py-3 text-[11px] text-muted-foreground">
              No {field.label.toLowerCase()} yet.
            </p>
          )}
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-hairline bg-surface-2 p-2.5"
                data-testid={`cms-list-item-${field.key}-${index}`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="num text-[11px] font-semibold text-muted-foreground">
                    {field.itemLabel} {index + 1}
                  </p>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-[10px]"
                      aria-label="Move up"
                      disabled={index === 0 || !canManage}
                      data-testid={`cms-list-up-${field.key}-${index}`}
                      onClick={() => moveItem(field.key, index, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-[10px]"
                      aria-label="Move down"
                      disabled={index === items.length - 1 || !canManage}
                      data-testid={`cms-list-down-${field.key}-${index}`}
                      onClick={() => moveItem(field.key, index, 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      aria-label="Remove item"
                      disabled={!canManage}
                      data-testid={`cms-list-remove-${field.key}-${index}`}
                      onClick={() => removeItem(field.key, index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {field.itemFields.map((itemField) => {
                    const value = typeof item[itemField.key] === "string" ? (item[itemField.key] as string) : "";
                    if (itemField.kind === "image") {
                      return (
                        <ImageUploader
                          key={itemField.key}
                          value={value || undefined}
                          label={itemField.label}
                          aspect="aspect-[16/9]"
                          testId={`cms-item-image-${field.key}-${index}`}
                          onChange={(url: string | undefined) => setItem(field.key, index, itemField.key, url ?? "")}
                        />
                      );
                    }
                    if (itemField.kind === "textarea") {
                      return (
                        <div key={itemField.key} className="space-y-1">
                          <Label className="text-[11px]">{itemField.label}</Label>
                          <Textarea
                            rows={2}
                            value={value}
                            disabled={!canManage}
                            data-testid={`cms-item-input-${field.key}-${index}-${itemField.key}`}
                            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                              setItem(field.key, index, itemField.key, event.target.value)
                            }
                          />
                        </div>
                      );
                    }
                    return (
                      <div key={itemField.key} className="space-y-1">
                        <Label className="text-[11px]">{itemField.label}</Label>
                        <Input
                          value={value}
                          disabled={!canManage}
                          className="h-8 text-sm"
                          data-testid={`cms-item-input-${field.key}-${index}-${itemField.key}`}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            setItem(field.key, index, itemField.key, event.target.value)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (field.kind === "tags") {
      const values = tags(draft, field.key);
      return (
        <div key={field.key} className="space-y-1.5">
          <Label className="text-xs" htmlFor={inputId}>
            {field.label}
          </Label>
          <div className="flex gap-2">
            <Input
              id={inputId}
              value={tagInput}
              placeholder={field.placeholder}
              disabled={!canManage}
              className="h-8 text-sm"
              data-testid={`cms-tag-input-${field.key}`}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTagInput(event.target.value)}
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag(field.key);
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={!canManage || !tagInput.trim()}
              data-testid={`cms-tag-add-${field.key}`}
              onClick={() => addTag(field.key)}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {values.map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-2 px-2 py-0.5 text-[11px] text-foreground"
              >
                {value}
                <button
                  type="button"
                  aria-label={`Remove ${value}`}
                  disabled={!canManage}
                  data-testid={`cms-tag-remove-${field.key}-${value}`}
                  onClick={() => removeTag(field.key, value)}
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive focus-ring"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (field.kind === "image") {
      return (
        <ImageUploader
          key={field.key}
          value={str(draft, field.key) || undefined}
          label={field.label}
          testId={`cms-image-${field.key}`}
          onChange={(url: string | undefined) => set(field.key, url ?? "")}
        />
      );
    }

    if (field.kind === "richtext") {
      return (
        <div key={field.key} className="space-y-1.5">
          <Label className="text-xs">{field.label}</Label>
          <RichTextEditor
            value={str(draft, field.key, "<p></p>")}
            minHeight="min-h-[160px]"
            placeholder="Write this section's content…"
            testId={`cms-richtext-${field.key}`}
            onChange={(html: string) => set(field.key, html)}
          />
        </div>
      );
    }

    if (field.kind === "textarea") {
      return (
        <div key={field.key} className="space-y-1.5">
          <Label className="text-xs" htmlFor={inputId}>
            {field.label}
          </Label>
          <Textarea
            id={inputId}
            rows={3}
            value={str(draft, field.key)}
            disabled={!canManage}
            data-testid={`cms-input-${field.key}`}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => set(field.key, event.target.value)}
          />
          {field.help && <p className="text-[11px] text-muted-foreground">{field.help}</p>}
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-1.5">
        <Label className="text-xs" htmlFor={inputId}>
          {field.label}
        </Label>
        <Input
          id={inputId}
          type={field.kind === "number" ? "number" : field.kind === "date" ? "date" : "text"}
          value={str(draft, field.key)}
          placeholder={field.kind === "text" || field.kind === "url" ? field.placeholder : undefined}
          disabled={!canManage}
          className="h-9 text-sm"
          data-testid={`cms-input-${field.key}`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            set(field.key, field.kind === "number" ? Number(event.target.value) : event.target.value)
          }
        />
        {field.help && <p className="text-[11px] text-muted-foreground">{field.help}</p>}
      </div>
    );
  };

  return (
    <Panel
      eyebrow="Inspector"
      title={block.label}
      description={block.type.replace(/_/g, " ")}
      testId="cms-inspector"
      bodyClassName="p-0"
      footer={
        canManage ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground" data-testid="cms-inspector-dirty">
              {dirty ? "Unsaved changes" : "All changes saved"}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
                disabled={!dirty || saving}
                data-testid="cms-inspector-reset"
                onClick={() => setDraft(JSON.parse(JSON.stringify(block.fields)))}
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
              <Button
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
                disabled={!dirty || saving}
                data-testid="cms-inspector-save"
                onClick={() => onSave(draft)}
              >
                <Save className="h-3 w-3" /> {saving ? "Saving…" : "Save section"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">Your role can view but not edit website content.</p>
        )
      }
    >
      <Tabs defaultValue="content">
        <div className="border-b border-hairline px-3 pt-3">
          <TabsList className="h-8" data-testid="cms-inspector-tabs">
            <TabsTrigger value="content" className="h-6 px-2.5 text-xs" data-testid="cms-inspector-tab-content">
              Content
            </TabsTrigger>
            <TabsTrigger value="style" className="h-6 px-2.5 text-xs" data-testid="cms-inspector-tab-style">
              Style
            </TabsTrigger>
            <TabsTrigger value="visibility" className="h-6 px-2.5 text-xs" data-testid="cms-inspector-tab-visibility">
              Visibility
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="content" className="mt-0 space-y-4 p-4">
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">This section has no editable fields.</p>
          ) : (
            fields.map(renderField)
          )}
        </TabsContent>

        <TabsContent value="style" className="mt-0 space-y-4 p-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Background</Label>
            <Select
              value={str(draft, "styleBackground", "default")}
              onValueChange={(value: string) => set("styleBackground", value)}
            >
              <SelectTrigger data-testid="cms-style-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {STYLE_BACKGROUNDS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Vertical spacing</Label>
            <Select
              value={str(draft, "styleSpacing", "normal")}
              onValueChange={(value: string) => set("styleSpacing", value)}
            >
              <SelectTrigger data-testid="cms-style-spacing">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {STYLE_SPACING.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Text alignment</Label>
            <Select value={str(draft, "styleAlign", "left")} onValueChange={(value: string) => set("styleAlign", value)}>
              <SelectTrigger data-testid="cms-style-align">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {STYLE_ALIGNMENT.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Style choices apply to this section only and are reflected in the live preview once saved.
          </p>
        </TabsContent>

        <TabsContent value="visibility" className="mt-0 space-y-4 p-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-2 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">Show on the website</p>
              <p className="text-[11px] text-muted-foreground">Hidden sections keep their content</p>
            </div>
            <Switch
              checked={block.visible}
              disabled={!canManage}
              onCheckedChange={onToggleVisibility}
              aria-label="Toggle section visibility"
              data-testid="cms-inspector-visibility-switch"
            />
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={!canManage}
              data-testid="cms-inspector-visibility-toggle"
              onClick={onToggleVisibility}
            >
              {block.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {block.visible ? "Hide section" : "Show section"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={!canManage}
              data-testid="cms-inspector-duplicate"
              onClick={onDuplicate}
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs text-destructive"
              disabled={!canManage}
              data-testid="cms-inspector-delete"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete section
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Panel>
  );
}
