import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const InboxScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showMessages, setShowMessages] = useState(false);

  const updateItems = [
    {
      id: 1,
      thumbnail: 'https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=UI',
      description: 'Your aesthetic taste is on another level',
      timestamp: '16 giờ',
      unread: true,
    },
    {
      id: 2,
      thumbnail: 'https://via.placeholder.com/60x40/7ED321/FFFFFF?text=UI',
      description: 'These ideas are very suitable for you',
      timestamp: '23 giờ',
      unread: true,
    },
    {
      id: 3,
      thumbnail: 'https://via.placeholder.com/60x40/9013FE/FFFFFF?text=UI',
      description: 'Your aesthetic taste is on another level',
      timestamp: '1 ngày',
      unread: true,
    },
    {
      id: 4,
      thumbnail: 'https://via.placeholder.com/60x40/50E3C2/FFFFFF?text=UI',
      description: 'You will feel something with this Pin',
      timestamp: '1 ngày',
      unread: true,
    },
    {
      id: 5,
      thumbnail: 'https://via.placeholder.com/60x40/9013FE/FFFFFF?text=UI',
      description: 'Similar to your style',
      timestamp: '2 ngày',
      unread: true,
    },
    {
      id: 6,
      thumbnail: 'https://via.placeholder.com/60x40/F5A623/FFFFFF?text=UI',
      description: 'You will like these Pins',
      timestamp: '2 ngày',
      unread: true,
    },
    {
      id: 7,
      thumbnail: 'https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=UI',
      description: 'Still searching? Explore ideas related to "Booking App Background"',
      timestamp: '3 ngày',
      unread: true,
    },
  ];

  const contacts = [
    {
      id: 1,
      name: 'Invite friends',
      subtitle: 'Connect to start chatting',
      icon: 'user-plus',
      hasArrow: false,
    },
    {
      id: 2,
      name: 'Behance',
      subtitle: 'Say hello 👋',
      icon: 'https://via.placeholder.com/40x40/1769FF/FFFFFF?text=Bē',
      hasArrow: true,
    },
    {
      id: 3,
      name: 'Cuded Art & Design',
      subtitle: 'Say hello 👋',
      icon: 'https://via.placeholder.com/40x40/9B9B9B/FFFFFF?text=CA',
      hasArrow: true,
    },
    {
      id: 4,
      name: 'kickassthings.com',
      subtitle: 'Say hello 👋',
      icon: 'https://via.placeholder.com/40x40/9B9B9B/FFFFFF?text=KT',
      hasArrow: true,
    },
  ];

  const renderMessagesTab = () => {
    console.log('renderMessagesTab called, showMessages:', showMessages);
    return (
      <Modal
        visible={showMessages}
        animationType="slide"
        onRequestClose={() => setShowMessages(false)}
      >
        <View style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowMessages(false)}
          >
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Messages</Text>
          <TouchableOpacity style={styles.editButton}>
            <Feather name="edit-3" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Contacts Section */}
          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>Contacts</Text>
            {contacts.map((contact) => (
              <TouchableOpacity key={contact.id} style={styles.contactRow}>
                <View style={styles.contactLeft}>
                  {contact.icon.startsWith('http') ? (
                    <Image source={{ uri: contact.icon }} style={styles.contactAvatar} />
                  ) : (
                    <View style={styles.contactIconContainer}>
                      <Feather name={contact.icon as any} size={20} color="#666" />
                    </View>
                  )}
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactSubtitle}>{contact.subtitle}</Text>
                  </View>
                </View>
                {contact.hasArrow && (
                  <Feather name="chevron-right" size={20} color="#666" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
    );
  };

  console.log('InboxScreen render, showMessages:', showMessages);
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity style={styles.editButton}>
          <Feather name="edit-3" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Messages Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Messages</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => {
                console.log('See all button pressed, setting showMessages to true');
                setShowMessages(true);
              }}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Feather name="chevron-right" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.messageCard}>
            <View style={styles.messageCardContent}>
              <View style={styles.messageIconContainer}>
                <Feather name="user-plus" size={24} color="#666" />
              </View>
              <View style={styles.messageTextContainer}>
                <Text style={styles.messageTitle}>Find people to message</Text>
                <Text style={styles.messageSubtitle}>Connect to start chatting</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Updates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Updates</Text>
          
          {updateItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.updateItem}>
              <View style={styles.updateLeft}>
                {item.unread && <View style={styles.unreadDot} />}
                <Image source={{ uri: item.thumbnail }} style={styles.updateThumbnail} />
                <View style={styles.updateTextContainer}>
                  <Text style={styles.updateDescription}>{item.description}</Text>
                </View>
              </View>
              <View style={styles.updateRight}>
                <Text style={styles.updateTimestamp}>{item.timestamp}</Text>
                <TouchableOpacity style={styles.updateOptions}>
                  <Feather name="more-vertical" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Messages Modal */}
      {renderMessagesTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#666',
  },
  messageCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  messageCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  messageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageTextContainer: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  messageSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  updateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  updateThumbnail: {
    width: 60,
    height: 40,
    borderRadius: 8,
  },
  updateTextContainer: {
    flex: 1,
  },
  updateDescription: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  updateRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  updateTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  updateOptions: {
    padding: 4,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalContent: {
    flex: 1,
  },
  contactsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default InboxScreen;