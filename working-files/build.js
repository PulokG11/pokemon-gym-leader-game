const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, LevelFormat, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, Footer, PageNumber } = require('docx');
const C = require('./data.js');

const order = ["health", "ai", "pm", "tech", "proj", "lead", "other"];
const NAVY = "1F3864", ACC = "2E75B6", GRAY = "6B7280";

function bullets(items, level) {
  const out = [];
  for (const it of items) {
    const [label, tags, kids] = it;
    const runs = [new TextRun({ text: label, bold: level === 0, size: level === 0 ? 24 : 22, color: level === 0 ? NAVY : "222222" })];
    if (tags && level > 0) runs.push(new TextRun({ text: "  [" + tags + "]", size: 18, color: GRAY, italics: true }));
    out.push(new Paragraph({ numbering: { reference: "b", level }, spacing: { before: level === 0 ? 140 : 20, after: 20 }, keepNext: level === 0, children: runs }));
    if (kids) out.push(...bullets(kids, level + 1));
  }
  return out;
}
function countKw(items) { let n = 0; for (const it of items) { if (it[2]) n += countKw(it[2]); else n += 1; } return n; }

const ch = [];
ch.push(new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 80 }, children: [new TextRun({ text: "Optum Senior & Lead Product Manager Roles", bold: true, size: 44, color: NAVY })] }));
ch.push(new Paragraph({ spacing: { after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACC, space: 6 } }, children: [new TextRun({ text: "Keyword Analysis of 10 Job Descriptions", size: 28, color: ACC })] }));

ch.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("How to read this document")] }));
const intro = [
  "Keywords are grouped into seven categories. Each category has sub-groups, then keywords, then sub-terms where a JD names them.",
  "Tags in brackets (e.g. [JD3, JD10]) show which job descriptions use the term. Terms tagged with several JDs are the strongest signals.",
  "Terms are normalized across JDs. Where JDs use different wording for the same concept, they are merged into one keyword.",
  "Company boilerplate and web-page noise (applicant statistics, related jobs, benefits blurbs) were excluded."];
for (const t of intro) ch.push(new Paragraph({ numbering: { reference: "b", level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: t, size: 22 })] }));

ch.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240 }, children: [new TextRun("Job descriptions analyzed")] }));
const jds = [
  ["JD1", "Senior Digital Product Manager – UnitedHealthcare App platform (Gurgaon)"],
  ["JD2", "Senior Tech Product Manager – RCM technology background preferred (Noida)"],
  ["JD3", "Senior Product Manager – Payer Agentic Platform (Hyderabad)"],
  ["JD4", "Senior Technical Product Manager – RCM Common Data Platform (Hyderabad)"],
  ["JD5", "Senior Product Manager – US Healthcare IT product (Hyderabad)"],
  ["JD6", "Senior Technical Product Manager – Ancillary Benefits Management data platform (Hyderabad)"],
  ["JD7", "Principal Technical Product Manager – AI Runtime, Agentic Platform & Compute (Chennai)"],
  ["JD8", "Senior / Lead Product Manager – Data Science, Machine Learning, Cloud (Hyderabad)"],
  ["JD9", "Lead Technical Product Manager – Payment integrity, audit & recovery (Noida)"],
  ["JD10", "Senior Product Manager – AI-native payment integrity products (Hyderabad)"]];
const bd = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const borders = { top: bd, bottom: bd, left: bd, right: bd };
const W = [1000, 8360];
function cell(t, w, hdr) {
  return new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    shading: hdr ? { fill: NAVY, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: t, size: 20, bold: !!hdr, color: hdr ? "FFFFFF" : "222222" })] })]
  });
}
ch.push(new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: W,
  rows: [new TableRow({ tableHeader: true, children: [cell("Ref", W[0], true), cell("Role", W[1], true)] }),
    ...jds.map(j => new TableRow({ children: [cell(j[0], W[0]), cell(j[1], W[1])] }))]
}));

ch.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280 }, children: [new TextRun("Strongest cross-JD signals")] }));
const sig = [
  "Product craft appears in nearly every JD: roadmap, vision/strategy, user stories, acceptance criteria, backlog, prioritization, KPIs.",
  "Agile delivery is named in most JDs; scaled Agile (PI planning, SAFe) in JD6.",
  "Aha! and Rally are the named product tools; Jira and Azure DevOps appear alongside.",
  "APIs, cloud platforms and integrations are the most common technical themes.",
  "AI is explicit in JD1, JD3, JD4, JD7, JD8 and JD10. Agentic AI is central to JD3, JD7 and JD10.",
  "Healthcare focus clusters into RCM (JD2, JD4), payer operations (JD3, JD5, JD6) and payment integrity (JD9, JD10).",
  "Influencing without authority, executive communication and cross-functional leadership are the leadership constants."];
for (const t of sig) ch.push(new Paragraph({ numbering: { reference: "b", level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: t, size: 22 })] }));

let n = 1;
for (const k of order) {
  const [title, desc, items] = C[k];
  ch.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(n + ". " + title)] }));
  ch.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: desc + "  (" + countKw(items) + " keywords)", italics: true, color: GRAY, size: 20 })] }));
  ch.push(...bullets(items, 0));
  n++;
}

const doc = new Document({
  creator: "Claude", title: "Optum PM Roles Keyword Analysis",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { size: 44, bold: true, color: NAVY, font: "Calibri" }, paragraph: { spacing: { after: 80 } } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 34, bold: true, color: NAVY, font: "Calibri" }, paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, color: ACC, font: "Calibri" }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 1 } }]
  },
  numbering: {
    config: [{
      reference: "b", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 270 } } } },
        { level: 2, format: LevelFormat.BULLET, text: "▪", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1620, hanging: 270 } } } }]
    }]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1260, right: 1440, bottom: 1260, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Optum PM Keyword Analysis  |  Page ", size: 18, color: GRAY }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GRAY })] })] }) },
    children: ch
  }]
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(process.argv[2], b); console.log("ok"); });
