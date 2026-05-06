import db from '@/database';
import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: number;
};

export default function HomeScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useFocusEffect(
    useCallback(() => {
      const rows = db.getAllSync(`
        SELECT 
          c.id,
          c.title,
          CAST(c.id AS INTEGER) as createdAt,
          (
            SELECT text 
            FROM messages m 
            WHERE m.conversationId = c.id 
            ORDER BY createdAt DESC 
            LIMIT 1
          ) as lastMessage
        FROM conversations c
        ORDER BY c.id DESC
      `);

      setConversations(rows as Conversation[]);
    }, [])
  );

  const createNewChat = () => {
    const newId = Date.now().toString();
    // For now, title is just id.
    // TODO: Make a function with LLM so that it produces a title based on first message, and set title to that.
    db.runSync(
      'INSERT INTO conversations (id, title) VALUES (?, ?)',
      [newId, newId]
    );

    router.push(`/chat/${newId}`);
};

  const deleteConversation = (id: string) => {
    db.runSync('DELETE FROM conversations WHERE id = ?', [id]);
    db.runSync('DELETE FROM messages WHERE conversationId = ?', [id]);

    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <View style={styles.chatRow}>
      <Link href={`/chat/${item.id}`} asChild>
        <Pressable style={styles.chatItem}>
          <Text style={styles.chatTitle}>{formatDate(item.createdAt)} - {item.id}</Text>
          <Text style={styles.chatPreview}>
            {item.lastMessage || 'No messages yet'}
          </Text>
        </Pressable>
      </Link>

      <Pressable
        onPress={() => deleteConversation(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>🗑</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.appHeader}>
        <Text style={styles.appHeaderText}>Chatbot</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Active:</Text>
          <Pressable style={styles.headerPlus} onPress={createNewChat}>
            <Text style={styles.headerPlusText}>＋</Text>
          </Pressable>
        </View>
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>Start a new chat</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  chatItem: {
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: 8,
  },
  deleteText: {
    fontSize: 18,
    color: '#FF3B30',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appHeader: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
  },
  appHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#E0F7FA',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 6,
    color: '#888',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatPreview: {
    color: '#666',
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerPlus: {
    backgroundColor: '#D3D3D3',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  headerPlusText: {
    color: '#000',
    fontSize: 20,
  },
});