import React, { useState, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { X, Send } from 'lucide-react-native';
import { Trash2 } from 'lucide-react-native';

interface ChatbotModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const GEMINI_API_KEY = 'AIzaSyBr0xxbWrSauQkCPX-LhvzQXA6OPX52t84'; 
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + GEMINI_API_KEY;

const ChatbotModal: React.FC<ChatbotModalProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now() + '-bot',
      text: "Hi, I'm Travie, your travel assistant! Ask me anything about hotels, flights, or tours and I'll help you plan your perfect trip.",
      sender: 'bot',
    },
  ]); // Start with Travie assistant intro
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { id: Date.now() + '-user', text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage.text }] }],
          // No generationConfig: maxOutputTokens
        }),
      });
      const data = await response.json();
      console.log('Gemini API response:', data); // Log the full response for debugging

      let botText = 'Sorry, I could not understand.';
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        botText = data.candidates[0].content.parts[0].text;
      } else if (data.error) {
        botText = `Error: ${data.error.message || JSON.stringify(data.error)}`;
      }
      const botMessage: Message = { id: Date.now() + '-bot', text: botText, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + '-bot', text: 'Error connecting to Gemini API.', sender: 'bot' }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isLongBotMsg = item.sender === 'bot' && item.text.length > 300;
    const isExpanded = expanded[item.id];
    return (
      <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
        <Text style={styles.bubbleText}>
          {isLongBotMsg && !isExpanded ? item.text.slice(0, 300) + '...' : item.text}
        </Text>
        {isLongBotMsg && (
          <TouchableOpacity onPress={() => setExpanded(prev => ({ ...prev, [item.id]: !isExpanded }))}>
            <Text style={{ color: '#4CBC71', marginTop: 4, fontWeight: 'bold' }}>{isExpanded ? 'Show less' : 'Show more'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI Chat Assistant</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setMessages([])} style={styles.clearBtn}>
                <Trash2 size={22} color="#4CBC71" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={24} color="#4CBC71" />
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
              placeholderTextColor="#A0A0A0"
              editable={!loading}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading || !input.trim()}>
              {loading ? <ActivityIndicator color="#fff" /> : <Send size={22} color="#fff" />}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 400,
    maxHeight: '80%',
    paddingBottom: 24,
    paddingTop: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CBC71',
  },
  closeBtn: {
    padding: 4,
  },
  chatContent: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#FFACC6',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
  },
  bubbleText: {
    fontSize: 15,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  sendBtn: {
    backgroundColor: '#4CBC71',
    borderRadius: 16,
    padding: 8,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    padding: 4,
    marginRight: 8,
  },
});

export default ChatbotModal; 