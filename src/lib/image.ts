/** Downscale an uploaded image in the browser so the mock store stays small. */
export function fileToDataUrl(file: File, maxWidth = 1200, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("That file is not a readable image"));
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const STOCK_LIBRARY: { label: string; url: string }[] = [
  { label: "Campus exterior", url: "https://picsum.photos/seed/nfa-campus/1200/800" },
  { label: "Library commons", url: "https://picsum.photos/seed/nfa-library/1200/800" },
  { label: "Science lab", url: "https://picsum.photos/seed/nfa-lab/1200/800" },
  { label: "Sports ground", url: "https://picsum.photos/seed/nfa-sports/1200/800" },
  { label: "Arts studio", url: "https://picsum.photos/seed/nfa-arts/1200/800" },
  { label: "Assembly hall", url: "https://picsum.photos/seed/nfa-hall/1200/800" },
  { label: "Classroom", url: "https://picsum.photos/seed/nfa-class/1200/800" },
  { label: "Graduation", url: "https://picsum.photos/seed/nfa-grad/1200/800" },
];
