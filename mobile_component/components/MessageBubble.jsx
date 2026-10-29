import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';

export default function MessageBubble({ message, isMe }) {
  return (
    <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
      <Text style={styles.senderText}>{message.username} · {message.timestamp}</Text>
      <Text style={[styles.contentText, isMe ? styles.myText : styles.otherText]}>
        {message.content}
      </Text>
    </View>
  );
}
