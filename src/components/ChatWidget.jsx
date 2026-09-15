import { useEffect, useRef, useState } from "react";
import {
  MessageCircleIcon,
  XIcon,
  SendIcon,
  SparklesIcon,
} from "lucide-react";
import {
  greetingFor,
  OPENING_SUGGESTIONS,
  answerFor,
  answerForLabel,
} from "../lib/chatbot";

export default function ChatWidget({ userName }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [seen, setSeen] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const replyTimer = useRef(null);
  const nextId = useRef(0);

  const newId = () => `m${nextId.current++}`;

  useEffect(() => {
    if (!open || messages.length) return;
    setMessages([
      {
        id: newId(),
        from: "bot",
        text: greetingFor(userName),
        suggestions: OPENING_SUGGESTIONS,
      },
    ]);
  }, [open, messages.length, userName]);

  useEffect(() => {
    const box = scrollRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => () => clearTimeout(replyTimer.current), []);

  function reply(responseFor, question) {
    setMessages((prev) => [
      ...prev,
      { id: newId(), from: "user", text: question },
    ]);
    setTyping(true);

    const answer = responseFor(question);
    const pause = Math.min(1100, 380 + answer.text.length * 1.5);

    clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          from: "bot",
          text: answer.text,
          suggestions: answer.suggestions,
        },
      ]);
    }, pause);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const question = draft.trim();
    if (!question || typing) return;
    setDraft("");
    reply(answerFor, question);
  }

  function handleSuggestion(label) {
    if (typing) return;
    reply(answerForLabel, label);
  }

  function toggle() {
    setOpen((wasOpen) => !wasOpen);
    setSeen(true);
  }

  return (
    <div className="chat-widget">
      {open && (
        <section
          className="chat-panel"
          role="dialog"
          aria-label="Ajo assistant"
        >
          <header className="chat-panel-head">
            <span className="chat-avatar">
              <SparklesIcon size={17} />
            </span>
            <div className="chat-head-text">
              <h4>Ajo assistant</h4>
              <span className="chat-status">
                <i className="chat-status-dot" />
                Answers instantly
              </span>
            </div>
            <button
              type="button"
              className="chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <XIcon size={18} />
            </button>
          </header>

          <div className="chat-log" ref={scrollRef} aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`chat-turn ${message.from}`}>
                <div className="chat-bubble">
                  {
}
                  {message.text.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {message.from === "bot" && message.suggestions?.length > 0 && (
                  <div className="chat-chips">
                    {message.suggestions.map((label) => (
                      <button
                        key={label}
                        type="button"
                        className="chat-chip"
                        onClick={() => handleSuggestion(label)}
                        disabled={typing}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="chat-turn bot">
                <div className="chat-bubble chat-typing" aria-label="Typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          <form className="chat-input-row" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a question…"
              aria-label="Your question"
              maxLength={300}
            />
            <button
              type="submit"
              className="chat-send"
              disabled={!draft.trim() || typing}
              aria-label="Send"
            >
              <SendIcon size={17} />
            </button>
          </form>

          <p className="chat-foot">
            A bot, not a person. For anything account-specific, email{" "}
            <a href="mailto:support@ajo.app">support@ajo.app</a>.
          </p>
        </section>
      )}

      <button
        type="button"
        className={`chat-launcher ${open ? "is-open" : ""}`}
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Ask a question"}
      >
        {open ? <XIcon size={22} /> : <MessageCircleIcon size={22} />}
        {!seen && <span className="chat-launcher-dot" />}
      </button>
    </div>
  );
}
