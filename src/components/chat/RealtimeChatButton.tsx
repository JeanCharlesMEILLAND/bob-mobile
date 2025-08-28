// src/components/chat/RealtimeChatButton.tsx - Bouton pour ouvrir le chat d'un échange/événement
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useSocket } from '../../services/socket.service';

interface RealtimeChatButtonProps {
  conversationId: string;
  title: string;
  subtitle?: string;
  unreadCount?: number;
  onPress: (conversationId: string) => void;
  disabled?: boolean;
}

export const RealtimeChatButton: React.FC<RealtimeChatButtonProps> = ({
  conversationId,
  title,
  subtitle,
  unreadCount = 0,
  onPress,
  disabled = false
}) => {
  const { connected } = useSocket();

  return (
    <TouchableOpacity
      onPress={() => onPress(conversationId)}
      disabled={disabled}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: connected ? '#EBF8FF' : '#F7FAFC',
          borderWidth: 1,
          borderColor: connected ? '#3182CE' : '#E2E8F0',
          borderRadius: 12,
          padding: 16,
          marginVertical: 4,
        },
        disabled && { opacity: 0.5 }
      ]}
    >
      {/* Indicateur de connexion */}
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: connected ? '#38A169' : '#E53E3E',
          marginRight: 12,
        }}
      />

      {/* Contenu */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#1A202C',
            marginBottom: 2,
          }}
        >
          💬 {title}
        </Text>
        
        {subtitle && (
          <Text
            style={{
              fontSize: 14,
              color: '#718096',
            }}
          >
            {subtitle}
          </Text>
        )}
        
        <Text
          style={{
            fontSize: 12,
            color: connected ? '#3182CE' : '#E53E3E',
            marginTop: 4,
          }}
        >
          {connected ? '🟢 Chat temps réel disponible' : '🔴 Reconnexion...'}
        </Text>
      </View>

      {/* Badge messages non lus */}
      {unreadCount > 0 && (
        <View
          style={{
            backgroundColor: '#E53E3E',
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 8,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}

      {/* Flèche */}
      <Text
        style={{
          fontSize: 18,
          color: '#A0AEC0',
          marginLeft: 8,
        }}
      >
        →
      </Text>
    </TouchableOpacity>
  );
};