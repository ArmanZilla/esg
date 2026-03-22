import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/* ─── CSV Export ────────────────────────────────────── */

export function exportToCSV(
  columns: { key: string; label: string }[],
  data: Record<string, unknown>[],
  filename: string,
) {
  const BOM = '\uFEFF';
  const header = columns.map(c => `"${c.label}"`).join(',');
  const rows = data.map(row =>
    columns
      .map(c => {
        const v = row[c.key];
        if (v == null) return '';
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      })
      .join(','),
  );
  const csv = BOM + [header, ...rows].join('\r\n');
  download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename);
}

/* ─── PNG Export (high-resolution) ──────────────────── */

export async function exportToPNG(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const scale = window.devicePixelRatio >= 2 ? 2 : 3;
  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: scale,
    backgroundColor: '#020617',
    cacheBust: true,
    filter: (node: HTMLElement) => {
      // exclude interactive export buttons from the capture
      return !node?.classList?.contains?.('export-exclude');
    },
  });
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/* ─── PDF Export (structured, multi-page) ───────────── */

export interface PDFMetadata {
  title: string;
  subtitle?: string;
  university?: string;
  year?: number | string;
  faculty?: string;
  generatedAt: string;
  kpis: { label: string; value: string }[];
  sections: { title: string; element: HTMLElement }[];
  t: (key: string) => string;
}

export async function exportToPDF(meta: PDFMetadata): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const margin = 15;
  const contentW = W - margin * 2;

  /* ── Title Page ────────────────────── */
  // Dark background
  pdf.setFillColor(2, 6, 23); // #020617
  pdf.rect(0, 0, W, H, 'F');

  // Accent bar
  pdf.setFillColor(45, 212, 191); // #2dd4bf
  pdf.rect(0, 0, W, 4, 'F');

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor(241, 245, 249); // slate-100
  pdf.text(meta.title, margin, 50);

  if (meta.subtitle) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.text(meta.subtitle, margin, 62);
  }

  // Metadata block
  let metaY = 85;
  pdf.setFontSize(10);
  pdf.setTextColor(148, 163, 184);

  const metaLines: string[] = [];
  if (meta.university) metaLines.push(`${meta.t('university')}: ${meta.university}`);
  if (meta.year) metaLines.push(`${meta.t('col_year')}: ${meta.year}`);
  if (meta.faculty) metaLines.push(`${meta.t('col_faculty')}: ${meta.faculty}`);
  metaLines.push(`${meta.t('report_generated')}: ${meta.generatedAt}`);

  for (const line of metaLines) {
    pdf.text(line, margin, metaY);
    metaY += 7;
  }

  // Divider
  metaY += 5;
  pdf.setDrawColor(30, 41, 59); // slate-800
  pdf.setLineWidth(0.3);
  pdf.line(margin, metaY, W - margin, metaY);
  metaY += 10;

  /* ── KPI Summary Table ─────────────── */
  if (meta.kpis.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(241, 245, 249);
    pdf.text(meta.t('report_section_overview'), margin, metaY);
    metaY += 10;

    const colW = contentW / 2;
    const rowH = 10;

    for (let i = 0; i < meta.kpis.length; i++) {
      const kpi = meta.kpis[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = margin + col * colW;
      const y = metaY + row * rowH;

      // KPI card background
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.roundedRect(x, y - 5, colW - 4, rowH - 1, 2, 2, 'F');

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(kpi.label, x + 3, y);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(45, 212, 191);
      pdf.text(kpi.value, x + colW - 8, y, { align: 'right' });
    }
    metaY += Math.ceil(meta.kpis.length / 2) * rowH + 10;
  }

  /* ── Chart Sections (each on new page) ── */
  for (const section of meta.sections) {
    pdf.addPage();

    // Dark background
    pdf.setFillColor(2, 6, 23);
    pdf.rect(0, 0, W, H, 'F');

    // Accent bar
    pdf.setFillColor(45, 212, 191);
    pdf.rect(0, 0, W, 2, 'F');

    // Section title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(241, 245, 249);
    pdf.text(section.title, margin, 20);

    // Capture chart as image — use html2canvas for reliable rendering
    try {
      const canvas = await html2canvas(section.element, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
        removeContainer: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgW = contentW;
      const imgH = (canvas.height / canvas.width) * imgW;
      const maxH = H - 40;
      const finalH = Math.min(imgH, maxH);

      pdf.addImage(imgData, 'PNG', margin, 28, imgW, finalH);
    } catch {
      pdf.setFontSize(10);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Chart could not be rendered.', margin, 35);
    }
  }

  /* ── Footer on every page ───────────── */
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.text(meta.title, margin, H - 8);
    pdf.text(`${i} / ${totalPages}`, W - margin, H - 8, { align: 'right' });
  }

  pdf.save(`${meta.title.toLowerCase().replace(/\s+/g, '-')}-${meta.year || 'all'}.pdf`);
}

/* ─── Helper ────────────────────────────────────────── */

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
