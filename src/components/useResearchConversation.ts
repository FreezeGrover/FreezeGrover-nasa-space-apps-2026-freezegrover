"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Environment } from "@/types/research";
import type {
  ConversationAnswer,
  ConversationInput,
  ConversationMessage,
  ResearchContext,
  ResearchPhase,
} from "@/types/conversation";
import {
  conversationHistory,
  readConversation,
  storedConversationSchema,
} from "@/lib/research/conversation-client";

const storageKey = "flames-research-conversation-v1";
export function useResearchConversation(
  environment: Environment,
  context: ResearchContext,
) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [revealId, setRevealId] = useState<string | null>(null);
  const [answer, setAnswer] = useState<ConversationAnswer | null>(null);
  const [submitted, setSubmitted] = useState("");
  const [pending, setPending] = useState(false);
  const [phase, setPhase] = useState<ResearchPhase | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [storageNotice, setStorageNotice] = useState("");
  const [ready, setReady] = useState(false);
  const active = useRef<{
    controller: AbortController;
    started: number;
    token: number;
    request: ConversationInput;
  } | null>(null);
  const sequence = useRef(0);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const saved = storedConversationSchema.parse(JSON.parse(raw));
        const last = saved.at(-1);
        if (last?.role === "user")
          saved.push({
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "The previous request was interrupted by a page reload. You can retry.",
            status: "failed",
            request: last.request,
          });
        setMessages(saved);
        const latest = [...saved].reverse().find((message) => message.answer);
        if (latest?.answer) {
          setAnswer(latest.answer);
          setSubmitted(latest.answer.query);
        }
      }
    } catch {
      setStorageNotice(
        "Saved conversation could not be restored. This discussion will continue in memory.",
      );
    }
    setReady(true);
    return () => {
      active.current?.controller.abort();
      active.current = null;
      sequence.current++;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      setStorageNotice(
        "Browser storage is unavailable or full. Keep this page open to retain the conversation.",
      );
    }
  }, [messages, ready]);
  useEffect(() => {
    if (!pending) return;
    const tick = () => {
      if (active.current)
        setElapsed(
          Math.floor((performance.now() - active.current.started) / 1000),
        );
    };
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [pending]);
  async function send(
    content: string,
    retry?: ConversationInput,
    contextOverride?: Partial<ResearchContext>,
  ) {
    if (active.current || !content.trim() || !ready) return;
    const request = retry ?? {
      message: content.trim(),
      environment,
      context: { ...context, ...contextOverride },
      history: conversationHistory(messages),
    };
    const controller = new AbortController(),
      token = ++sequence.current,
      started = performance.now();
    active.current = { controller, token, started, request };
    setSubmitted(request.message);
    setPending(true);
    setAnswer(null);
    setPhase(null);
    setElapsed(0);
    if (!retry)
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: request.message,
          status: "complete",
          request,
        },
      ]);
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 75000);
    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      const result = await readConversation(
        response,
        (value) => {
          if (sequence.current === token) setPhase(value);
        },
        controller.signal,
      );
      if (sequence.current !== token) return;
      const seconds = Math.floor((performance.now() - started) / 1000);
      setElapsed(seconds);
      setAnswer(result);
      const responseId = crypto.randomUUID();
      setRevealId(result.reply ? responseId : null);
      setMessages((previous) => [
        ...previous,
        {
          id: responseId,
          role: "assistant",
          content:
            result.reply ||
            [...result.statements, ...(result.resourceStatements ?? [])]
              .map((statement) => statement.interpretation)
              .join("\n\n") ||
            result.clarification ||
            result.notice,
          answer: result,
          status: result.retryable ? "failed" : "complete",
          elapsed: seconds,
          ...(result.retryable ? { request } : {}),
        },
      ]);
    } catch (error) {
      if (sequence.current !== token) return;
      const seconds = Math.floor((performance.now() - started) / 1000);
      setElapsed(seconds);
      const notice = timedOut
        ? "The request timed out. No partial answer was accepted. You can retry."
        : error instanceof Error && error.message.startsWith("The ")
          ? error.message
          : "The connection failed before a checked answer arrived. You can retry.";
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: notice,
          status: "failed",
          request,
          elapsed: seconds,
        },
      ]);
    } finally {
      clearTimeout(timeout);
      if (sequence.current === token) {
        active.current = null;
        setPending(false);
        setPhase(null);
      }
    }
  }
  function cancel() {
    const current = active.current;
    if (!current) return;
    sequence.current++;
    current.controller.abort();
    active.current = null;
    const seconds = Math.floor((performance.now() - current.started) / 1000);
    setElapsed(seconds);
    setPending(false);
    setPhase(null);
    setMessages((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Request cancelled. No partial answer was accepted. You can retry.",
        status: "cancelled",
        request: current.request,
        elapsed: seconds,
      },
    ]);
  }
  const finishReveal = useCallback(
    (id: string) => setRevealId((current) => (current === id ? null : current)),
    [],
  );
  function clear() {
    if (active.current) return;
    setRevealId(null);
    setMessages([]);
    setAnswer(null);
    setSubmitted("");
    setElapsed(0);
  }
  return {
    messages,
    revealId,
    finishReveal,
    answer,
    setAnswer,
    submitted,
    pending,
    phase,
    elapsed,
    storageNotice,
    ready,
    send,
    cancel,
    clear,
  };
}
