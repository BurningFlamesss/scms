import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { fileToDataUrl, STOCK_LIBRARY } from "#/lib/image";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
  aspect?: string;
  testId?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = "Featured image",
  aspect = "aspect-[16/9]",
  testId = "image-uploader",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG or WebP).");
      return;
    }
    setBusy(true);
    try {
      onChange(await fileToDataUrl(file));
      toast.success("Image ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid={testId}>
      <p className="mb-1.5 text-xs font-medium text-foreground">{label}</p>
      {value ? (
        <div className="group relative overflow-hidden rounded-lg border border-hairline">
          <img src={value} alt="" className={`w-full object-cover ${aspect}`} />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 gap-1 px-2 text-xs"
              data-testid={`${testId}-replace`}
              onClick={() => inputRef.current?.click()}
            >
              <UploadCloud className="h-3.5 w-3.5" /> Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 gap-1 px-2 text-xs text-destructive"
              data-testid={`${testId}-remove`}
              onClick={() => onChange(undefined)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="upload">
          <TabsList className="h-8">
            <TabsTrigger value="upload" className="h-6 text-xs" data-testid={`${testId}-tab-upload`}>
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="h-6 text-xs" data-testid={`${testId}-tab-url`}>
              From URL
            </TabsTrigger>
            <TabsTrigger value="library" className="h-6 text-xs" data-testid={`${testId}-tab-library`}>
              Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                void handleFiles(e.dataTransfer.files);
              }}
              data-testid={`${testId}-dropzone`}
              className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-7 text-center transition-colors focus-ring ${
                dragging ? "border-primary bg-primary/5" : "border-hairline bg-surface-2 hover:border-primary/40"
              }`}
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-xs font-medium text-foreground">Drop an image or click to browse</span>
              <span className="text-[11px] text-muted-foreground">PNG, JPG or WebP · resized automatically</span>
            </button>
          </TabsContent>

          <TabsContent value="url" className="mt-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={url}
                  placeholder="https://…"
                  className="h-9 pl-8 text-sm"
                  data-testid={`${testId}-url-input`}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                />
              </div>
              <Button
                type="button"
                size="sm"
                className="h-9"
                data-testid={`${testId}-url-apply`}
                disabled={!url.trim()}
                onClick={() => {
                  onChange(url.trim());
                  setUrl("");
                }}
              >
                Use image
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="library" className="mt-2">
            <div className="grid grid-cols-4 gap-2">
              {STOCK_LIBRARY.map((item) => (
                <button
                  key={item.url}
                  type="button"
                  title={item.label}
                  data-testid={`${testId}-library-item`}
                  onClick={() => onChange(item.url)}
                  className="overflow-hidden rounded-md border border-hairline transition-transform hover:scale-[1.02] focus-ring"
                >
                  <img src={item.url} alt={item.label} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        data-testid={`${testId}-file-input`}
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}
