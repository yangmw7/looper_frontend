// src/components/ChatWidget.jsx
import { useState } from "react";
import "./ChatWidget.css";

export default function ChatWidget({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "안녕하세요! 무엇을 도와드릴까요? 😊" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", text: input }]);
    setInput("");

    // 📌 TODO: Spring Boot → MCP → GPT 연결
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "이건 임시 응답이에요. 🚀 (API 연동 예정)" }
      ]);
    }, 500);
  };

  return (
    <div className="chat-widget">
      {/* Header */}
      <div className="chat-header">
        <span>챗봇 상담</span>
        <button onClick={onClose}>✖</button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${msg.role === "bot" ? "bot" : "user"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
}
