import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';

export default function ChatHeader({ channel, connected }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>PulseChat Mobile (#{channel})</Text>
      <View style={[styles.statusBadge, connected ? styles.online : styles.offline]}>
        <Text style={styles.statusText}>{connected ? 'Online' : 'Offline'}</Text>
      </View>
    </View>
  );
}
