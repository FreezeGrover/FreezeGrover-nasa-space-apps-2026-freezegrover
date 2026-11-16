import { Fragment, type ReactNode } from "react";

function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("`") && part.endsWith("`"))
        return <code key={index}>{part.slice(1, -1)}</code>;
      const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (link)
        return (
          <a
            key={index}
            href={link[2]}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link[1]} ↗
          </a>
        );
      return <Fragment key={index}>{part}</Fragment>;
    });
}
export function FormattedResearchText({
  text,
  label,
}: {
  text: string;
  label?: string;
}) {
  const lines = text.split("\n"),
    blocks: ReactNode[] = [];
  for (let i = 0; i < lines.length;) {
    if (!lines[i].trim()) {
      i++;
      continue;
    }
    const heading = lines[i].match(/^#{1,4}\s+(.+)/);
    if (heading) {
      blocks.push(<h3 key={i}>{inline(heading[1])}</h3>);
      i++;
      continue;
    }
    const bullet = lines[i].match(/^\s*(?:[-*•]|\d+[.)])\s+(.+)/);
    if (bullet) {
      const start = i,
        ordered = /^\s*\d+[.)]/.test(lines[i]),
        items: ReactNode[] = [];
      while (i < lines.length) {
        const match = lines[i].match(/^\s*(?:[-*•]|\d+[.)])\s+(.+)/);
        if (!match) break;
        items.push(<li key={i}>{inline(match[1])}</li>);
        i++;
      }
      blocks.push(
        ordered ? <ol key={start}>{items}</ol> : <ul key={start}>{items}</ul>,
      );
      continue;
    }
    const start = i,
      paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(?:#{1,4}\s|\s*(?:[-*•]|\d+[.)])\s)/.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i++;
    }
    if (i === start) paragraph.push(lines[i++]);
    blocks.push(<p key={start}>{inline(paragraph.join("\n"))}</p>);
  }
  return (
    <div
      className="conversation-text formatted-research-text"
      aria-label={label}
    >
      {blocks}
    </div>
  );
}
