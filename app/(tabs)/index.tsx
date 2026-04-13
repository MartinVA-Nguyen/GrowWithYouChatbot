import { Link, router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
};

export default function HomeScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

const createNewChat = () => {
  const newId = Date.now().toString();

  const newConversation = {
    id: newId,
    title: newId, 
    lastMessage: '',
  };

  setConversations(prev => [newConversation, ...prev]);

  router.push(`/chat/${newId}`);
};

  const renderItem = ({ item }: { item: Conversation }) => (
    <Link href={`/chat/${item.id}`} asChild>
      <Pressable style={styles.chatItem}>
        <Text style={styles.chatTitle}>{item.title}</Text>
        <Text style={styles.chatPreview}>{item.lastMessage || 'No messages yet'}</Text>
      </Pressable>
    </Link>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#000',
  },
  centerList: {
    flexGrow: 1,
    justifyContent: 'center',
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
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  emptySubtext: {
    marginTop: 6,
    color: '#888',
  },
  chatItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
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
});