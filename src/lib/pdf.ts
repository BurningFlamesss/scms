import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* --------------------------------------------------------------- *
 * Client-side "official document" generator.
 * Produces a genuinely downloadable PDF that mirrors the editorial
 * print language of the site: ink-navy type, hairline rules,
 * letterspaced eyebrows, monospaced reference numbers.
 * --------------------------------------------------------------- */

export type DocBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "keyvalues"; items: Array<[string, string]> }
  | { type: "table"; columns: string[]; rows: string[][]; caption?: string }
  | { type: "checklist"; items: string[] }
  | { type: "rule" }
  | { type: "spacer"; size?: number }
  | { type: "signature"; name: string; role: string };

export interface OfficialDocument {
  fileName: string;
  eyebrow: string;
  title: string;
  refNo?: string;
  dateLine?: string;
  stamp?: string;
  blocks: DocBlock[];
  footNote?: string;
}

const INK: [number, number, number] = [20, 27, 52];
const INK_SOFT: [number, number, number] = [96, 104, 122];
const ACCENT: [number, number, number] = [44, 99, 89];
const RULE: [number, number, number] = [206, 199, 187];
const PAPER: [number, number, number] = [243, 240, 233];

const SCHOOL = {
  name: "Everest English Boarding Secondary School",
  address: "Butwal-8, Rupandehi, Lumbini Province, Nepal",
  contact: "+977 71 540 118  ·  info@everestbutwal.edu.np",
  motto: "Climb Higher, Reason Deeper",
};

const PAGE = { w: 595.28, h: 841.89 };
const M = { left: 54, right: 54, top: 52, bottom: 62 };
const CONTENT_W = PAGE.w - M.left - M.right;

interface Ctx {
  doc: jsPDF;
  y: number;
}

function ensureSpace(ctx: Ctx, needed: number): void {
  if (ctx.y + needed > PAGE.h - M.bottom) {
    ctx.doc.addPage();
    ctx.y = M.top;
    drawRunningHeader(ctx);
  }
}

function drawRunningHeader(ctx: Ctx): void {
  const { doc } = ctx;
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK_SOFT);
  doc.text(SCHOOL.name, M.left, ctx.y);
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.5);
  doc.line(M.left, ctx.y + 7, PAGE.w - M.right, ctx.y + 7);
  ctx.y += 26;
}

function drawMasthead(ctx: Ctx, meta: OfficialDocument): void {
  const { doc } = ctx;

  // Accent bar
  doc.setFillColor(...ACCENT);
  doc.rect(M.left, ctx.y, 34, 3, "F");
  ctx.y += 20;

  // School name (serif, like Playfair on screen)
  doc.setFont("times", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...INK);
  doc.text(SCHOOL.name, M.left, ctx.y);
  ctx.y += 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK_SOFT);
  doc.text(SCHOOL.address, M.left, ctx.y);
  ctx.y += 11;
  doc.text(SCHOOL.contact, M.left, ctx.y);
  ctx.y += 16;

  doc.setDrawColor(...INK);
  doc.setLineWidth(1.1);
  doc.line(M.left, ctx.y, PAGE.w - M.right, ctx.y);
  ctx.y += 4;
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.5);
  doc.line(M.left, ctx.y, PAGE.w - M.right, ctx.y);
  ctx.y += 28;

  // Optional stamp, top-right
  if (meta.stamp) {
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setCharSpace(1.1);
    const label = meta.stamp.toUpperCase();
    const w = doc.getTextWidth(label) + 18;
    doc.roundedRect(PAGE.w - M.right - w, M.top + 4, w, 18, 9, 9, "S");
    doc.setTextColor(...ACCENT);
    doc.text(label, PAGE.w - M.right - w + 9, M.top + 16);
    doc.setCharSpace(0);
  }

  // Eyebrow
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...ACCENT);
  doc.setCharSpace(1.6);
  doc.text(meta.eyebrow.toUpperCase(), M.left, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 20;

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(21);
  doc.setTextColor(...INK);
  const titleLines = doc.splitTextToSize(meta.title, CONTENT_W) as string[];
  titleLines.forEach((line) => {
    doc.text(line, M.left, ctx.y);
    ctx.y += 24;
  });
  ctx.y += 2;

  // Ref / date line (monospaced, like Source Code Pro on screen)
  const bits: string[] = [];
  if (meta.refNo) bits.push(`Ref. ${meta.refNo}`);
  if (meta.dateLine) bits.push(meta.dateLine);
  if (bits.length) {
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...INK_SOFT);
    doc.text(bits.join("   |   "), M.left, ctx.y);
    ctx.y += 16;
  }

  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.5);
  doc.line(M.left, ctx.y, PAGE.w - M.right, ctx.y);
  ctx.y += 22;
}

function renderBlock(ctx: Ctx, block: DocBlock): void {
  const { doc } = ctx;

  switch (block.type) {
    case "heading": {
      ensureSpace(ctx, 40);
      doc.setFont("times", "bold");
      doc.setFontSize(12.5);
      doc.setTextColor(...INK);
      doc.text(block.text, M.left, ctx.y);
      ctx.y += 8;
      doc.setDrawColor(...RULE);
      doc.setLineWidth(0.5);
      doc.line(M.left, ctx.y, M.left + 42, ctx.y);
      ctx.y += 16;
      break;
    }

    case "paragraph": {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      const lines = doc.splitTextToSize(block.text, CONTENT_W) as string[];
      lines.forEach((line) => {
        ensureSpace(ctx, 16);
        doc.text(line, M.left, ctx.y);
        ctx.y += 14;
      });
      ctx.y += 8;
      break;
    }

    case "bullets":
    case "checklist": {
      const isCheck = block.type === "checklist";
      block.items.forEach((item) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        const lines = doc.splitTextToSize(item, CONTENT_W - 22) as string[];
        ensureSpace(ctx, lines.length * 14 + 6);
        if (isCheck) {
          doc.setDrawColor(...INK_SOFT);
          doc.setLineWidth(0.6);
          doc.rect(M.left + 1, ctx.y - 7.5, 8.5, 8.5, "S");
        } else {
          doc.setFillColor(...ACCENT);
          doc.circle(M.left + 4, ctx.y - 3.2, 1.6, "F");
        }
        doc.setTextColor(...INK);
        lines.forEach((line, i) => {
          doc.text(line, M.left + 20, ctx.y + i * 14);
        });
        ctx.y += lines.length * 14 + 4;
      });
      ctx.y += 6;
      break;
    }

    case "keyvalues": {
      block.items.forEach(([k, v]) => {
        ensureSpace(ctx, 20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...INK_SOFT);
        doc.setCharSpace(0.9);
        doc.text(k.toUpperCase(), M.left, ctx.y);
        doc.setCharSpace(0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...INK);
        const lines = doc.splitTextToSize(v, CONTENT_W - 150) as string[];
        lines.forEach((line, i) => doc.text(line, M.left + 150, ctx.y + i * 13));
        ctx.y += Math.max(18, lines.length * 13 + 5);
      });
      ctx.y += 6;
      break;
    }

    case "table": {
      ensureSpace(ctx, 90);
      autoTable(doc, {
        head: [block.columns],
        body: block.rows,
        startY: ctx.y,
        margin: { left: M.left, right: M.right },
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 8.5,
          cellPadding: 6,
          textColor: INK,
          lineColor: RULE,
          lineWidth: 0.4,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: PAPER,
          textColor: INK_SOFT,
          fontStyle: "bold",
          fontSize: 7.5,
        },
        alternateRowStyles: { fillColor: [250, 249, 246] },
      });
      const last = (doc as unknown as { lastAutoTable?: { finalY: number } })
        .lastAutoTable;
      ctx.y = (last ? last.finalY : ctx.y) + 14;
      if (block.caption) {
        doc.setFont("courier", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...INK_SOFT);
        doc.text(block.caption, M.left, ctx.y);
        ctx.y += 16;
      }
      break;
    }

    case "rule": {
      ensureSpace(ctx, 20);
      doc.setDrawColor(...RULE);
      doc.setLineWidth(0.5);
      doc.line(M.left, ctx.y, PAGE.w - M.right, ctx.y);
      ctx.y += 18;
      break;
    }

    case "spacer": {
      ctx.y += block.size ?? 12;
      break;
    }

    case "signature": {
      ensureSpace(ctx, 70);
      ctx.y += 26;
      doc.setDrawColor(...INK_SOFT);
      doc.setLineWidth(0.6);
      doc.line(PAGE.w - M.right - 170, ctx.y, PAGE.w - M.right, ctx.y);
      ctx.y += 13;
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      doc.text(block.name, PAGE.w - M.right - 170, ctx.y);
      ctx.y += 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...INK_SOFT);
      doc.text(block.role, PAGE.w - M.right - 170, ctx.y);
      ctx.y += 14;
      break;
    }

    default:
      break;
  }
}

function drawFooters(doc: jsPDF, footNote?: string): void {
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    const y = PAGE.h - 38;
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.5);
    doc.line(M.left, y - 12, PAGE.w - M.right, y - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...INK_SOFT);
    doc.text(footNote ?? SCHOOL.motto, M.left, y);

    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    const label = `Page ${page} of ${total}`;
    doc.text(label, PAGE.w - M.right - doc.getTextWidth(label), y);
  }
}

/** Build and download the document. Returns the final filename. */
export function downloadOfficialPdf(meta: OfficialDocument): string {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  doc.setLineHeightFactor(1.35);

  const ctx: Ctx = { doc, y: M.top };
  drawMasthead(ctx, meta);
  meta.blocks.forEach((block) => renderBlock(ctx, block));
  drawFooters(doc, meta.footNote);

  const fileName = meta.fileName.endsWith(".pdf")
    ? meta.fileName
    : `${meta.fileName}.pdf`;
  doc.save(fileName);
  return fileName;
}

/** Rough size estimate so the UI can show file metadata before download. */
export function estimateSize(blocks: DocBlock[]): string {
  const weight = blocks.reduce((sum, b) => {
    if (b.type === "table") return sum + b.rows.length * 3 + 24;
    if (b.type === "paragraph") return sum + Math.ceil(b.text.length / 90) * 4;
    if (b.type === "bullets" || b.type === "checklist")
      return sum + b.items.length * 3;
    return sum + 2;
  }, 46);
  return `${(weight / 100 + 0.6).toFixed(1)} MB`.replace(
    /^(\d+)\.(\d) MB$/,
    (_m, a: string, b: string) => `${a}.${b} MB`,
  );
}

export const SCHOOL_PRINT_META = SCHOOL;
