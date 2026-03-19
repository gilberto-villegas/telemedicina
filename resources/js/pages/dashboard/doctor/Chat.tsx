;

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import io from 'socket.io-client';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  sender?: {
    first_name: string;
    last_name: string;
  };
}

interface Chat {
  id: string;
  doctor?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  last_message?: Message;
  unread_count?: number;
}

export default function DoctorChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient');

  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/auth/login');
      return;
    }

    const currentUser = authService.getUser();
    if (!currentUser || currentUser.type !== 'doctor') {
      navigate(`/dashboard/${currentUser?.type || 'patient'}`);
      return;
    }

    setUser(currentUser);
    loadChats();

    // Conectar al socket
    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    const socket = io(WS_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-user', currentUser.id);
    });

    socket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      if (socketRef.current) {
        socketRef.current.emit('join-chat', selectedChat.id);
      }
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      const response = await api.get('/chats');
      setChats(response.data || []);

      if (patientId) {
        const existingChat = response.data?.find((chat: Chat) => chat.patient?.id === patientId);
        if (existingChat) {
          setSelectedChat(existingChat);
        } else {
          createChat(patientId);
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (patientId: string) => {
    try {
      const response = await api.post('/chats', { patient_id: patientId });
      setSelectedChat(response.data);
      setChats([...chats, response.data]);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const response = await api.post(`/chats/${selectedChat.id}/messages`, {
        message: messageText,
      });

      setMessages([...messages, response.data]);

      if (socketRef.current) {
        socketRef.current.emit('send-message', {
          chatId: selectedChat.id,
          message: response.data,
        });
      }

      scrollToBottom();
    } catch (error) {
      alert('Error al enviar el mensaje');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="h-[calc(100vh-12rem)] flex gap-4">
        {/* Lista de Chats */}
        <div className="w-80 border-r">
          <div className="p-4 border-b flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/doctor')}
              className="h-8 w-8 text-gray-500 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-lg">Conversaciones</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-16rem)]">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No tienes conversaciones</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {chat.patient
                          ? `${chat.patient.first_name} ${chat.patient.last_name}`
                          : chat.doctor
                            ? `Dr. ${chat.doctor.first_name} ${chat.doctor.last_name}`
                            : 'Chat'
                        }
                      </h3>
                      {chat.last_message && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {chat.last_message.message}
                        </p>
                      )}
                    </div>
                    {chat.unread_count && chat.unread_count > 0 && (
                      <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold">
                  {selectedChat.patient
                    ? `${selectedChat.patient.first_name} ${selectedChat.patient.last_name}`
                    : selectedChat.doctor
                      ? `Dr. ${selectedChat.doctor.first_name} ${selectedChat.doctor.last_name}`
                      : 'Chat'
                  }
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-900'
                          }`}
                      >
                        <p>{message.message}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'
                          }`}>
                          {format(new Date(message.created_at), "HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Escribe un mensaje..."
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Selecciona una conversación para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

