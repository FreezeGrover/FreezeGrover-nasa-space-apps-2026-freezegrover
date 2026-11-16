"use client";
import { FormattedResearchText } from "./FormattedResearchText";
import { useEffect, useState } from "react";
export function ConversationText({
  text,
  messageId,
  animate,
  onReveal,
  onDone,
}: {
  text: string;
  messageId: string;
  animate: boolean;
  onReveal: () => void;
  onDone: (id: string) => void;
}) {
  const [shown, setShown] = useState(animate ? 0 : text.length);
  useEffect(() => {
    if (
      !animate ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(text.length);
      onDone(messageId);
      return;
    }
    let count = 0;
    const timer = setInterval(() => {
      count = Math.min(
        text.length,
        count + Math.max(2, Math.ceil(text.length / 180)),
      );
      setShown(count);
      onReveal();
      if (count === text.length) {
        clearInterval(timer);
        onDone(messageId);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [text, messageId, animate, onReveal, onDone]);
  return (
    <FormattedResearchText
      text={text.slice(0, shown)}
      label={shown < text.length ? "Writing response" : undefined}
    />
  );
}
