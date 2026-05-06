import db, { getLastMessages, insertMessage } from '@/database';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const conversationId = Array.isArray(id) ? id[0] : id;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    const rows = db.getAllSync(
      `SELECT id, role, text FROM messages
       WHERE conversationId = ?
       ORDER BY createdAt ASC`,
      [conversationId]
    );

    setMessages(rows as any[]);
  }, [conversationId]);

async function sendMessage() {
  if (!text.trim() || !conversationId) return;

  const userMessage = {
    role: 'user',
    text,
  };

  // Retrieve X amount of last sent messages. Variable. If X = 10, then 5 user, 5 bot messages.
  const historyLimit = 10;
  const history = getLastMessages(conversationId, historyLimit);

  // show instantly
  setMessages((prev) => [...prev, userMessage]);

  // save user message
  insertMessage(conversationId, 'user', text);

  setText('');
  setLoading(true);

  // TODO: n8n webhook url
  try {
    const res = await fetch('n8n webhook url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          ...history,
          userMessage, // include current message
        ],
      }),
    });

    if (!res.ok) throw new Error('Request failed');

    const data = await res.json();

    const botMessage = {
      role: 'bot',
      text: data.reply || 'No response',
    };

    setMessages((prev) => [...prev, botMessage]);

    insertMessage(conversationId, 'bot', botMessage.text);
  } catch (error) {
    console.error(error);

    const errorMsg = {
      role: 'bot',
      text: 'Error connecting to server.',
    };

    setMessages((prev) => [...prev, errorMsg]);

    insertMessage(conversationId, 'bot', errorMsg.text);
  } finally {
    setLoading(false);
  }
}

return (
  <>
    <Stack.Screen
      options={{
        headerShown: false,
      }}
    />

    <View style={styles.appContainer}>
      <View style={styles.appHeader}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.appHeaderText}>Chatbot</Text>
        <View style={{ width: 40 }} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.container}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderText}>{conversationId}</Text>
          </View>

          {loading && (
            <Text style={{ marginBottom: 8, color: '#888' }}>
              Bot is typing...
            </Text>
          )}

          <FlatList
            data={messages}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.message,
                  item.role === 'user' ? styles.userMsg : styles.botMsg,
                ]}
              >
                <Text>{item.text}</Text>
              </View>
            )}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
            />

            <Pressable onPress={sendMessage} style={styles.button}>
              <Text style={{ color: 'black' }}>Send</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  </>
);}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F7FA', padding: 12 },
  header: { fontSize: 16, fontWeight: '600', marginBottom: 8 },

  message: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  botMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F1F1',
  },

  inputRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 8,
    borderWidth: 2,
    borderColor: '#333',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
  },
  button: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#E0F7FA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#00008B',
  },
  appHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  chatHeader: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
});