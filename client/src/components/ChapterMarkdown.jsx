// Renderer markdown ringan khusus untuk format konten Bab (frontmatter sudah dipisah di query)
export default function ChapterMarkdown({ content }) {
  const lines = content.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", lang, text: codeLines.join("\n") });
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3) });
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2) });
      i++;
      continue;
    }
    if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (line.trim() === "" || line.trim() === "---") {
      i++;
      continue;
    }

    blocks.push({ type: "p", text: line, isPanel: line.trim().startsWith("**Panel") });
    i++;
  }

  function renderInline(text) {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) return <b key={idx}>{part.slice(2, -2)}</b>;
      if (part.startsWith("`") && part.endsWith("`")) return <code key={idx}>{part.slice(1, -1)}</code>;
      return part;
    });
  }

  return (
    <div className="chapter-content">
      {blocks.map((b, idx) => {
        if (b.type === "h1") return <h1 key={idx}>{b.text}</h1>;
        if (b.type === "h2") return <h2 key={idx}>{b.text}</h2>;
        if (b.type === "ul") return <ul key={idx}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>;
        if (b.type === "code") return <pre key={idx}><code>{b.text}</code></pre>;
        return <p key={idx} className={b.isPanel ? "panel" : ""}>{renderInline(b.text)}</p>;
      })}
    </div>
  );
}
