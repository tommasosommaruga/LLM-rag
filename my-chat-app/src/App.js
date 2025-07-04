import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([]);

  async function sendQuery(e) {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { sender: "user", text: query };
    setChat((c) => [...c, userMessage]);
    setQuery("");

    const loadingMessage = { sender: "bot", text: "..." };
    setChat((c) => [...c, loadingMessage]);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.text }),
      });
      const data = await res.json();

      setChat((c) => {
        // Replace the last message ("...") with the actual answer
        const updated = [...c];
        if (updated.length > 0 && updated[updated.length - 1].text === "...") {
          updated[updated.length - 1] = {
            sender: "bot",
            text: data.answer.result || data.answer || "No response",
          };
        }
        return updated;
      });
    } catch {
      setChat((c) => {
        const updated = [...c];
        if (updated.length > 0 && updated[updated.length - 1].text === "...") {
          updated[updated.length - 1] = {
            sender: "bot",
            text: "Error contacting server.",
          };
        }
        return updated;
      });
    }
  }


  return (
    <div className="App">
      <h1>Chat with LLM-RAG</h1>
      <div className="chatBox">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendQuery} className="form">
        <input
          type="text"
          placeholder="Ask something..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
        />
        <button type="submit" className="button">
          Send
        </button>
      </form>
    </div>
  );
}
