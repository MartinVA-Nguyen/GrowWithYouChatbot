import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

async function sendMessage() {
  if (!text.trim()) return;

  const userMessage = {
    role: 'user',
    text,
  };

  // shows user message immediately
  setMessages((prev) => [...prev, userMessage]);
  setText('');

  // start loading
  setLoading(true);

  try {
    const res = await fetch('n8n webhook url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage.text,
      }),
    });

    const data = await res.json();

    const botMessage = {
      role: 'bot',
      text: data.reply || 'No response',
    };

    setMessages((prev) => [...prev, botMessage]);
  } catch (error) {
    console.error(error);

    setMessages((prev) => [
      ...prev,
      {
        role: 'bot',
        text: 'Error connecting to server.',
      },
    ]);
  } finally {
    setLoading(false);
  }
}

return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={80}
  >
      <View style={styles.container}>
      <Text style={styles.header}>Chat: {id}</Text>

      {loading && (
        <Text style={{ marginBottom: 8, color: '#888' }}>
          Bot is typing...
        </Text>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{paddingBottom: 100,}}
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
          <Text style={{ color: 'white' }}>Send</Text>
        </Pressable>
      </View>
    </View>
  </KeyboardAvoidingView>
);}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
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
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
  },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
});