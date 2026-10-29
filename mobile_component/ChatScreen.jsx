import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';

/**
 * ChatScreen Component for React Native / Expo
 * 
 * Demonstrates:
 * 1. React Native core primitives: <View>, <Text>, <FlatList>, <TextInput>, <TouchableOpacity>
 * 2. Mobile Flexbox layout & KeyboardAvoidingView for mobile keyboards
 * 3. Mobile WebSocket client lifecycle and real-time state management
 */
export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [channel, setChannel] = useState('general');
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  const WS_URL = 'ws://10.0.2.2:8080'; // 10.0.2.2 points to host localhost in Android Emulator

  useEffect(() => {
    // Initialize Mobile WebSocket Connection
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setConnected(true);
      console.log('Mobile connected to PulseChat server');
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'MESSAGE') {
        setMessages((prev) => [...prev, data]);
      } else if (data.type === 'HISTORY') {
        setMessages(data.messages || []);
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
      console.log('Mobile socket disconnected');
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const payload = {
      type: 'CHAT_MESSAGE',
      content: inputText.trim()
    };

    if (ws.current && connected) {
      ws.current.send(JSON.stringify(payload));
    } else {
      // Local demo fallback
      const localMsg = {
        username: 'MobileUser',
        content: inputText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, localMsg]);
    }

    setInputText('');
  };

  const renderMessageItem = ({ item }) => {
    const isMe = item.username === 'MobileUser';
    return (
      <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
        <Text style={styles.senderText}>{item.username} · {item.timestamp}</Text>
        <Text style={[styles.contentText, isMe ? styles.myText : styles.otherText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PulseChat Mobile (#{channel})</Text>
        <View style={[styles.statusBadge, connected ? styles.online : styles.offline]}>
          <Text style={styles.statusText}>{connected ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      {/* Message List */}
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.listContainer}
      />

      {/* Input Box */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#64748b"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc'
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  online: {
    backgroundColor: '#059669'
  },
  offline: {
    backgroundColor: '#d97706'
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  },
  listContainer: {
    padding: 16,
    flexGrow: 1
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '80%'
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4f46e5'
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b'
  },
  senderText: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 4
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20
  },
  myText: {
    color: '#ffffff'
  },
  otherText: {
    color: '#e2e8f0'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#020617'
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14
  }
});
