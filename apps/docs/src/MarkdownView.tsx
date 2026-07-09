type MarkdownViewProps = {
  markdown: string;
};

type MarkdownBlock =
  | { type: "code"; language?: string; lines: string[] }
  | { type: "table"; lines: string[] }
  | { type: "text"; line: string };

function splitBlocks(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let codeBlock: { language?: string; lines: string[] } | null = null;
  let tableLines: string[] = [];

  const flushTable = () => {
    if (tableLines.length > 0) {
      blocks.push({ type: "table", lines: tableLines });
      tableLines = [];
    }
  };

  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith("```")) {
      if (codeBlock) {
        blocks.push({
          type: "code",
          language: codeBlock.language,
          lines: codeBlock.lines
        });
        codeBlock = null;
      } else {
        flushTable();
        codeBlock = {
          language: line.replace("```", "").trim() || undefined,
          lines: []
        };
      }
      continue;
    }

    if (codeBlock) {
      codeBlock.lines.push(line);
      continue;
    }

    if (line.trim().startsWith("|")) {
      tableLines.push(line);
      continue;
    }

    flushTable();
    blocks.push({ type: "text", line });
  }

  if (codeBlock) {
    blocks.push({
      type: "code",
      language: codeBlock.language,
      lines: codeBlock.lines
    });
  }

  flushTable();
  return blocks;
}

function parseInlineCode(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }

    return part;
  });
}

function renderTextLine(line: string, index: number) {
  const trimmed = line.trim();

  if (!trimmed) {
    return <div aria-hidden="true" className="dv-docs-markdown__space" key={index} />;
  }

  const headingMatch = /^(#{1,4})\s+(.*)$/.exec(trimmed);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const HeadingTag = `h${Math.min(level + 1, 5)}` as
      | "h2"
      | "h3"
      | "h4"
      | "h5";
    return (
      <HeadingTag className={`dv-docs-markdown__heading dv-docs-markdown__heading--${level}`} key={index}>
        {parseInlineCode(headingMatch[2])}
      </HeadingTag>
    );
  }

  if (/^[-*]\s+/.test(trimmed)) {
    return (
      <div className="dv-docs-markdown__list-item" key={index}>
        {parseInlineCode(trimmed.replace(/^[-*]\s+/, ""))}
      </div>
    );
  }

  if (/^\d+\.\s+/.test(trimmed)) {
    return (
      <div className="dv-docs-markdown__list-item dv-docs-markdown__list-item--ordered" key={index}>
        {parseInlineCode(trimmed.replace(/^\d+\.\s+/, ""))}
      </div>
    );
  }

  if (trimmed.startsWith(">")) {
    return (
      <blockquote className="dv-docs-markdown__quote" key={index}>
        {parseInlineCode(trimmed.replace(/^>\s?/, ""))}
      </blockquote>
    );
  }

  return (
    <p className="dv-docs-markdown__paragraph" key={index}>
      {parseInlineCode(trimmed)}
    </p>
  );
}

function renderTable(lines: string[], index: number) {
  const rows = lines
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim())
    )
    .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
  const [header, ...body] = rows;

  if (!header) {
    return null;
  }

  return (
    <div className="dv-docs-table-wrap" key={index}>
      <table className="dv-docs-markdown__table">
        <thead>
          <tr>
            {header.map((cell) => (
              <th key={cell}>{parseInlineCode(cell)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={`${row.join("-")}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`}>{parseInlineCode(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MarkdownView({ markdown }: MarkdownViewProps) {
  const blocks = splitBlocks(markdown);

  return (
    <article className="dv-docs-markdown">
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <pre className="dv-docs-markdown__code" key={index}>
              <code>{block.lines.join("\n")}</code>
            </pre>
          );
        }

        if (block.type === "table") {
          return renderTable(block.lines, index);
        }

        return renderTextLine(block.line, index);
      })}
    </article>
  );
}
