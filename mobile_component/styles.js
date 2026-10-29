import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
