import db from '@/database';
import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
};

export default function HomeScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useFocusEffect(
    useCallback(() => {
      const rows = db.getAllSync(`
        SELECT 
          c.id,
          c.title,
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

  const renderItem = ({ item }: { item: Conversation }) => (
    <View style={styles.chatRow}>
      <Link href={`/chat/${item.id}`} asChild>
        <Pressable style={styles.chatItem}>
          <Text style={styles.chatTitle}>{item.title}</Text>
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
          contentContainerStyle={
            conversations.length > 0
              ? styles.centerList
              : undefined
          }
        />
      )}

      <Pressable style={styles.fab} onPress={createNewChat}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatItem: {
    flex: 1,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteText: {
    fontSize: 18,
    color: '#FF3B30',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#000',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    color: '#FFF',
    fontSize: 26,
  },
  centerList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});