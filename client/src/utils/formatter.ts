function sanitizeLabel(label: string): string {
  return (
    label
      // remove invisible unicode
      .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
      // normalize smart quotes → nothing
      .replace(/[’‘]/g, "")
      .replace(/[“”]/g, "")
      // remove apostrophes completely (CRITICAL)
      .replace(/'/g, "")
      // collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

function canonicalizeMermaid(raw: string): string {
  if (!raw) return "";

  // 1. Normalize early (DO NOT preserve line breaks)
  const cleaned = raw
    .replace(/\r/g, "")
    .replace(/;/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 2. Extract graph direction safely
  const dirMatch = cleaned.match(/graph\s*(TD|LR|RL|BT)/i);
  const direction = dirMatch ? dirMatch[1].toUpperCase() : "TD";

  // 3. Extract edges structurally
  const edgeRegex = /"([^"]+)"\s*-->\s*"([^"]+)"/g;

  const edges: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = edgeRegex.exec(cleaned)) !== null) {
    const from = sanitizeLabel(match[1]);
    const to = sanitizeLabel(match[2]);

    if (from && to) {
      edges.push(`"${from}" --> "${to}"`);
    }
  }

  if (edges.length === 0) return "";

  // 4. Rebuild canonical Mermaid (ONLY this format)
  return [`graph ${direction}`, ...edges.map((e) => `  ${e}`)].join("\n");
}
function enforceMermaidFormatting(code: string): string {
  // 1. Force newline after graph header
  let fixed = code.replace(/^(graph\s+(TD|LR|RL|BT))\s*/i, (_, g) => `${g}\n`);

  // 2. Ensure first edge starts on a new indented line
  fixed = fixed.replace(/\n(")/, "\n  $1");

  return fixed;
}
