"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useResearchActions } from "./ResearchActions";
import { answerReviewRequest } from "@/lib/qa/handoff";
import { ConversationText } from "./ConversationText";
import { ChatCircle } from "@phosphor-icons/react";
import { findInvestigationById } from "@/lib/research/catalog";
import { conversationHistory } from "@/lib/research/conversation-client";
import type { ResearchContext } from "@/types/conversation";
import type { Environment } from "@/types/research";
import type { useResearchConversation } from "./useResearchConversation";
import { ResearchDialog } from "./ResearchDialog";
import { ResearchSearch } from "./ResearchSearch";
import { ResourceStatementView } from "./OfficialResources";
import { SourceLink } from "./ui";

type Conversation = ReturnType<typeof useResearchConversation>;
const phases = {
  catalog: "Searching the local NASA investigation catalog",
  conditions: "Examining imported experimental conditions",
  answer: "Waiting for the AI scientific explanation",
  grounding: "Reviewing the answer against NASA evidence",
};
export function ResearchConversation({
  open,
  onClose,
  conversation,
  context,
  environment,
  onReview,
  onBrowse,
  onCompare,
}: {
  open: boolean;
  onClose: () => void;
  conversation: Conversation;
  context: ResearchContext;
  environment: Environment;
  onReview: (id: string, text: string) => void;
  onBrowse: () => void;
  onCompare: (ids: string[]) => void;
}) {
  const researchActions = useResearchActions();
  const [draft, setDraft] = useState("");
  const [below, setBelow] = useState(false);
  const writing = conversation.revealId;
  const log = useRef<HTMLDivElement>(null),
    follow = useRef(true);
  const reveal = useCallback(() => {
    const node = log.current;
    if (!node) return;
    if (follow.current) node.scrollTop = node.scrollHeight;
    setBelow(node.scrollHeight - node.scrollTop - node.clientHeight > 60);
  }, []);
  const done = useCallback(
    (id: string) => {
      conversation.finishReveal?.(id);
      reveal();
    },
    [conversation.finishReveal, reveal],
  );
  useEffect(() => {
    if (open) {
      follow.current = true;
      reveal();
    }
  }, [open, reveal]);
  useEffect(() => {
    if (!open && conversation.revealId)
      conversation.finishReveal?.(conversation.revealId);
  }, [open, conversation.revealId, conversation.finishReveal]);
  useEffect(reveal, [
    open,
    conversation.messages.length,
    conversation.pending,
    reveal,
  ]);
  const ids = context.recordIds
    .map((id) => findInvestigationById(id)?.name)
    .filter(Boolean);
  return (
    <ResearchDialog
      open={open}
      onClose={onClose}
      title="Research Conversation"
      className="research-dialog--conversation"
    >
      <div className="research-conversation">
        <div className="conversation-context">
          <p>
            Context: {context.tab}
            {ids.length ? " · " + ids.join(" / ") : ""} · {environment}
            {context.goal ? " · " + context.goal : ""}
          </p>
          <button
            disabled={conversation.pending || !conversation.messages.length}
            onClick={conversation.clear}
          >
            New conversation
          </button>
        </div>
        <p className="conversation-scope">
          NASA snapshot and imported table previews · interpretations remain
          unverified. Conversation is kept in this browser tab for the session.
        </p>
        {conversation.storageNotice && (
          <p role="status">{conversation.storageNotice}</p>
        )}
        {conversationHistory(conversation.messages).length <
          conversation.messages.filter(
            (message) => message.status === "complete",
          ).length && (
          <p className="conversation-scope">
            Older messages remain visible. The next request uses the most recent
            conversation context that fits the message window.
          </p>
        )}
        <div
          className="conversation-log"
          ref={log}
          role="log"
          aria-label="Research conversation"
          tabIndex={0}
          onScroll={() => {
            const node = log.current;
            if (node) {
              follow.current =
                node.scrollHeight - node.scrollTop - node.clientHeight < 60;
              setBelow(!follow.current);
            }
          }}
        >
          {!conversation.messages.length && (
            <div className="conversation-empty">
              <ChatCircle />
              <h3>Ask about the science.</h3>
              <p>
                Discuss NASA investigations, compare their conditions, or
                examine a statement in Scientific QA. Follow-up questions keep
                the conversation context.
              </p>
            </div>
          )}
          {conversation.messages.map((message) => (
            <article
              key={message.id}
              className={`conversation-message conversation-${message.role}`}
            >
              <div className="conversation-message-heading">
                <strong>
                  {message.role === "user" ? "You" : "Research assistant"}
                </strong>
                {message.elapsed !== undefined && (
                  <small>{message.elapsed}s elapsed</small>
                )}
              </div>
              {message.answer?.reply && (
                <ConversationText
                  messageId={message.id}
                  text={message.answer.reply}
                  animate={message.id === conversation.revealId}
                  onReveal={reveal}
                  onDone={done}
                />
              )}
              {message.answer?.reply &&
                message.id !== writing &&
                (message.answer.statements.length > 0 ||
                  !!message.answer.resourceStatements?.length) && (
                  <button
                    className="research-open-button"
                    onClick={() => {
                      const request = answerReviewRequest(message.answer!);
                      if (request && researchActions)
                        researchActions.review(request);
                      else if (request?.recordId)
                        onReview(request.recordId, request.statement);
                    }}
                  >
                    Review cited statement in Scientific QA ↗
                  </button>
                )}
              {message.answer?.reply && message.id !== writing && (
                <details className="conversation-paragraph">
                  <summary>Sources and scientific review</summary>
                  <p className="conversation-scope">{message.answer.notice}</p>
                  {message.answer.statements.map((statement, index) => {
                    const record = findInvestigationById(statement.recordId);
                    return record ? (
                      <div key={index}>
                        <p>
                          [{statement.citationNumber ?? index + 1}]{" "}
                          {statement.interpretation}
                        </p>
                        <blockquote>{statement.quote}</blockquote>
                        <SourceLink href={record.source} label={record.name} />
                        <button
                          className="research-open-button"
                          onClick={() =>
                            researchActions
                              ? researchActions.review(
                                  answerReviewRequest(
                                    message.answer!,
                                    statement,
                                  )!,
                                )
                              : onReview(record.id, statement.interpretation)
                          }
                        >
                          Review statement in Scientific QA ↗
                        </button>
                      </div>
                    ) : null;
                  })}
                  {message.answer.resourceStatements?.map(
                    (statement, index) => (
                      <ResourceStatementView
                        key={index}
                        statement={statement}
                        question={message.answer?.query}
                        answerText={message.answer?.reply}
                      />
                    ),
                  )}
                  <p className="conversation-scope">
                    {message.answer.audit?.checks.join(" · ")} ·{" "}
                    {message.answer.audit?.scientificStatus}
                  </p>
                  <small>
                    {message.answer.audit?.promptVersion} ·{" "}
                    {message.answer.audit?.frameworkVersion}
                  </small>
                </details>
              )}
              {!message.answer?.reply &&
              message.answer &&
              (message.answer.statements.length ||
                message.answer.resourceStatements?.length) ? (
                <>
                  {message.answer.statements.map((statement, index) => {
                    const record = findInvestigationById(statement.recordId);
                    if (!record) return null;
                    return (
                      <div className="conversation-paragraph" key={index}>
                        <p>{statement.interpretation}</p>
                        <details>
                          <summary>Evidence · {record.name}</summary>
                          <blockquote>{statement.quote}</blockquote>
                          <small>
                            {statement.field} · quote and numeric text checked;
                            scientific interpretation unverified
                          </small>
                          <SourceLink
                            href={record.source}
                            label={record.sourceLabel}
                          />
                          <button
                            className="research-open-button"
                            onClick={() =>
                              researchActions
                                ? researchActions.review(
                                    answerReviewRequest(
                                      message.answer!,
                                      statement,
                                    )!,
                                  )
                                : onReview(record.id, statement.interpretation)
                            }
                          >
                            Review statement in Scientific QA ↗
                          </button>
                        </details>
                      </div>
                    );
                  })}
                  {message.answer.resourceStatements?.map(
                    (statement, index) => (
                      <ResourceStatementView
                        key={"resource" + index}
                        statement={statement}
                        question={message.answer?.query}
                        answerText={message.answer?.reply}
                      />
                    ),
                  )}
                </>
              ) : !message.answer?.reply ? (
                <p className="conversation-text">{message.content}</p>
              ) : null}
              {message.answer && !message.answer.reply && (
                <>
                  {(message.answer.statements.length > 0 ||
                    !!message.answer.resourceStatements?.length ||
                    message.answer.clarification) && (
                    <p className="conversation-scope">
                      {message.answer.notice}
                    </p>
                  )}
                  {(message.answer.statements.length > 0 ||
                    !!message.answer.resourceStatements?.length) &&
                    message.answer.clarification && (
                      <p>{message.answer.clarification}</p>
                    )}
                  {message.answer.groundingIssues.map((issue, index) => (
                    <p className="conversation-scope" key={index}>
                      {issue}
                    </p>
                  ))}
                </>
              )}
              {message.role === "assistant" &&
                message.request &&
                !conversation.pending && (
                  <button
                    className="research-open-button"
                    onClick={() =>
                      conversation.send(
                        message.request!.message,
                        message.request,
                      )
                    }
                  >
                    Retry request
                  </button>
                )}
            </article>
          ))}
          {conversation.pending && (
            <div className="conversation-thinking" role="status">
              <strong>
                {conversation.phase
                  ? phases[conversation.phase]
                  : "Connecting to the research service"}
                …
              </strong>
              <span aria-label="Elapsed research time">
                {conversation.elapsed}s elapsed
              </span>
              <button onClick={conversation.cancel}>Cancel request</button>
            </div>
          )}
        </div>
        {below && (
          <button
            className="research-open-button conversation-jump"
            aria-label="Scroll to latest message"
            onClick={() => {
              follow.current = true;
              reveal();
            }}
          >
            ↓ Latest
          </button>
        )}
        {writing && (
          <span className="conversation-scope" role="status">
            Writing response
          </span>
        )}
        {conversation.messages.length > 0 &&
          !conversation.pending &&
          !writing && (
            <div className="conversation-source-actions">
              <button onClick={onBrowse}>Browse NASA investigations ↗</button>
              {conversation.answer?.recordIds.length === 2 &&
                conversation.answer.statements.length > 0 && (
                  <button
                    onClick={() => onCompare(conversation.answer!.recordIds)}
                  >
                    Compare these investigations ↗
                  </button>
                )}
            </div>
          )}
        <ResearchSearch
          value={draft}
          onChange={setDraft}
          onSearch={() => {
            if (draft.trim() && !conversation.pending && conversation.ready) {
              follow.current = true;
              void conversation.send(draft);
              setDraft("");
            }
          }}
          pending={conversation.pending || !conversation.ready}
          title="Continue the discussion"
          compact
        />
      </div>
    </ResearchDialog>
  );
}
