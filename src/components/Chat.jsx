import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { FaPaperPlane } from 'react-icons/fa';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatUser, setChatUser] = useState(null);
  const socketRef = useRef();
  const { chatId } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch chat user details
    const fetchChatUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/users/${chatId}`);
        const data = await response.json();
        setChatUser(data);
      } catch (error) {
        console.error('Error fetching chat user:', error);
      }
    };

    fetchChatUser();
  }, [chatId]);

  useEffect(() => {
    socketRef.current = io('http://localhost:3000', {
      withCredentials: true
    });

    socketRef.current.emit('join-chat', { chatId, userId: currentUser._id });

    socketRef.current.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chatId, currentUser._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketRef.current.emit('send-message', {
        chatId,
        userId: currentUser._id,
        message: newMessage,
        username: currentUser.username,
      });
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat header */}
      <div className="bg-white border-b px-6 py-4 flex items-center">
        {chatUser && (
          <>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <span className="text-blue-500 font-semibold text-lg">
                {chatUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{chatUser.name}</h2>
              <p className="text-sm text-gray-500">{chatUser.online ? 'Online' : 'Offline'}</p>
            </div>
          </>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.userId === currentUser._id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.userId === currentUser._id
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-gray-900 rounded-bl-none shadow'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat; 