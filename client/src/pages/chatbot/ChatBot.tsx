import { useState } from 'react';
import axios from 'axios';

function ChatBot() {
  const [userInput, setUserInput] = useState('');
  const [chat, setChat] = useState<{ sender: string; text: string }[]>([]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newChat = [...chat, { sender: 'user', text: userInput }];
    setChat(newChat);
    setUserInput('');

    try {
      const response = await axios.post('http://localhost:5000/api/ask-doctor', {
        message: userInput,
      });

      setChat([...newChat, { sender: 'doctor', text: response.data.reply }]);
    } catch (err) {
      console.error(err);
      setChat([...newChat, { sender: 'doctor', text: 'Sorry, something went wrong.' }]);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Virtual Doctor</h1>
      <div className="border p-4 h-96 overflow-y-auto bg-gray-100 rounded mb-4">
        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <span className={`inline-block px-3 py-2 rounded ${msg.sender === 'user' ? 'bg-blue-200' : 'bg-green-200'}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-grow p-2 border rounded"
          type="text"
          placeholder="Ask your virtual doctor..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBot;
