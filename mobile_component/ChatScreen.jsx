import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StatusBar, FlatList } from 'react-native';
import { styles } from './styles';
import ChatHeader from './components/ChatHeader';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [channel, setChannel] = useState('general');
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  const WS_URL = 'ws://10.0.2.2:8080';

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setConnected(true);
      console.log('Connected to PulseChat');
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'MESSAGE') {
          setMessages((prev) => [...prev, data]);
        } else if (data.type === 'HISTORY') {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    ws.current.onclose = () => setConnected(false);

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const payload = {
      type: 'CHAT_MESSAGE',
      content: inputText.trim()
    };

    if (ws.current && connected) {
      ws.current.send(JSON.stringify(payload));
    } else {
      const localMsg = {
        username: 'MobileUser',
        content: inputText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, localMsg]);
    }

    setInputText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ChatHeader channel={channel} connected={connected} />
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <MessageBubble message={item} isMe={item.username === 'MobileUser'} />
        )}
        contentContainerStyle={styles.listContainer}
      />
      <ChatInput
        inputText={inputText}
        onChangeText={setInputText}
        onSend={handleSendMessage}
      />
    </SafeAreaView>
  );
}
