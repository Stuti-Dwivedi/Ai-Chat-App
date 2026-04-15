import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const App = () => {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [currentChat, setCurrentChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const chatEndRef = useRef(null);

  // 🔁 Get History
  const getHistory = async () => {
    try {
      const res = await axios.get("http://localhost:9000/api/chat/history");
      setHistory(res.data.data.reverse());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getHistory();
  }, []);

  // 📜 Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat]);

  // 💬 Ask Question
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:9000/api/chat/ask",
        { question }
      );

      const newMsg = {
        question,
        answer: res.data.data?.answer || "No response",
      };

      setCurrentChat((prev) => [...prev, newMsg]);
      setQuestion("");
      getHistory();
    } catch (error) {
      console.log(error);
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  // 🆕 New Chat
  const handleNewChat = () => {
    setCurrentChat([]);
  };

  // 📂 Open Chat from sidebar
  const handleOpenChat = (item) => {
    setCurrentChat([item]);
  };

  // 🎤 Voice Input
  const handleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in your browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript); // 🎯 text me aa jayega
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      alert("Voice error");
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <div className="app">
      
      {/* 🔹 Sidebar */}
      <div className="sidebar">
        <button className="new-chat" onClick={handleNewChat}>
          + New Chat
        </button>

        <div className="history">
          {history.map((item) => (
            <div
              key={item._id}
              className="history-item"
              onClick={() => handleOpenChat(item)}
            >
              {item.question.slice(0, 25)}...
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 Main Chat */}
      <div className="main">
        <div className="header">
          <h1>AI Chat</h1>
        </div>

        <div className="chat-area">
          {currentChat.length === 0 && (
            <p className="empty">Start a new conversation 🚀</p>
          )}

          {currentChat.map((item, index) => (
            <div key={index}>
              <div className="message user fade-in">
                {item.question}
              </div>

              <div className="message ai fade-in">
                {item.answer === "No response"
                  ? "🤖 Thinking..."
                  : item.answer}
              </div>
            </div>
          ))}

          {loading && <div className="message ai">Typing...</div>}

          <div ref={chatEndRef}></div>
        </div>

        {/* 🔻 Input Box with MIC */}
        <form className="input-box" onSubmit={handleAsk}>
          <input
            type="text"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          {/* 🎤 MIC */}
          <button
            type="button"
            className={`mic-btn ${listening ? "active" : ""}`}
            onClick={handleVoice}
          >
            🎤
          </button>

          <button disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};
 
export default App;