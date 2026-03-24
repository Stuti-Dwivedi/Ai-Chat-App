import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const getHistory = async () => {
    try {
      const res = await axios.get("http://localhost:9000/api/chat/history");
      setHistory(res.data.data);
    } catch (error) {
      console.log("History Error:", error);
    }
  };

  useEffect(() => {
    getHistory();
  }, []);

  const handleAsk = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    try {
      setLoading(true);

      await axios.post("http://localhost:9000/api/chat/ask", {
        question,
      });

      setQuestion("");
      getHistory();
    } catch (error) {
      console.log("Ask Error:", error);
      alert("Failed to generate response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="logo-circle">✦</div>
          <h1>AI Chat App</h1>
          <p>Ask anything and get smart AI-generated answers</p>
        </div>

        <form className="ask-box" onSubmit={handleAsk}>
          <textarea
            placeholder="Ask any question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Ask AI"}
          </button>
        </form>

<div className="chat-list">
  {history.length > 0 ? (
    history.map((item) => (
      <div className="chat-card" key={item._id}>
        <div className="user-bubble">{item.question}</div>

        <div className="ai-bubble">
          {item.answer}
        </div>

        {item.priority === "high" && (
          <span className="priority-badge">High Priority</span>
        )}
      </div>
    ))
  ) : (
    <p className="empty">No chats yet. Start by asking something.</p>
  )}
</div>
      </div>
    </div>
  );
};

export default App;