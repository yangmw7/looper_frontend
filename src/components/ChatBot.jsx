import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';
import axios from 'axios';
import { FaRobot, FaTimes, FaPaperPlane, FaGamepad } from 'react-icons/fa';
import { GiSwordman } from 'react-icons/gi';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '안녕하세요! 😊\n게임 관련 궁금하신 사항을 물어보세요.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    const currentQuery = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Spring Boot MCP 서버 연동 API 호출
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      
      // /api/chat 엔드포인트 호출 (Spring Boot 경로)
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        question: currentQuery  // "question" 키로 전송 (Spring Boot와 일치)
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      console.log('챗봇 응답:', response.data);

      // 응답 처리 - String 또는 JSON 모두 처리
      let botResponse;
      
      if (typeof response.data === 'string') {
        // String 응답인 경우
        try {
          // JSON 문자열을 파싱 시도
          const parsedData = JSON.parse(response.data);
          botResponse = parsedData.answer || response.data;
        } catch (e) {
          // JSON이 아니면 그대로 사용
          botResponse = response.data;
        }
      } else if (typeof response.data === 'object') {
        // Object 응답인 경우
        botResponse = response.data.answer || JSON.stringify(response.data);
      } else {
        botResponse = '응답을 가져올 수 없습니다.';
      }
      
      setMessages(prev => [...prev, {
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('챗봇 응답 실패:', error);
      
      // 에러 메시지 처리
      let errorMessage;
      
      if (error.response) {
        // 서버 응답이 있는 경우
        console.error('서버 에러:', error.response.status, error.response.data);
        errorMessage = error.response.data || '서버에서 오류가 발생했습니다.';
      } else if (error.request) {
        // 요청은 보냈지만 응답이 없는 경우
        console.error('네트워크 에러:', error.request);
        errorMessage = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
      } else {
        errorMessage = '요청 중 오류가 발생했습니다.';
      }
      
      setMessages(prev => [...prev, {
        type: 'bot',
        text: errorMessage,
        timestamp: new Date()
      }]);
      
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    '화염의 검에 대해 알려줘',
    '숲 고블린 공략법은?',
    '초보자 가이드 보여줘',
    '생명의 물약 효과는?'
  ];

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <>
      {/* 챗봇 토글 버튼 */}
      <div 
        className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
      >
        {isOpen ? (
          <FaTimes size={24} />
        ) : (
          <FaRobot size={24} />
        )}
        {!isOpen && <div className="chatbot-toggle-pulse" />}
      </div>

      {/* 챗봇 창 */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        {/* 헤더 */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <GiSwordman size={24} />
            </div>
            <div className="chatbot-title">
              <h3>게임 도우미</h3>
              <span className="chatbot-status">
                <span className="status-dot"></span>
                온라인
              </span>
            </div>
          </div>
          <button className="chatbot-close" onClick={handleToggle}>
            <FaTimes size={20} />
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div key={index} className={`chatbot-message ${message.type}`}>
              {message.type === 'bot' && (
                <div className="message-avatar">
                  <FaGamepad size={16} />
                </div>
              )}
              <div className="message-content">
                <div className="message-bubble">
                  {message.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < message.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="chatbot-message bot">
              <div className="message-avatar">
                <FaGamepad size={16} />
              </div>
              <div className="message-content">
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 빠른 질문 (메시지가 1개일 때만 표시) */}
        {messages.length === 1 && (
          <div className="chatbot-quick-questions">
            <div className="quick-questions-title">자주 묻는 질문</div>
            <div className="quick-questions-list">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-question-btn"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 입력 영역 */}
        <div className="chatbot-input-area">
          <div className="chatbot-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              placeholder="메시지를 입력하세요..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="chatbot-input"
            />
            <button 
              className="chatbot-send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <FaPaperPlane size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}