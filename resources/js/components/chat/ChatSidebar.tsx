import { useEffect, useState, useRef } from 'react';
import { Send, X, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface ChatSidebarProps {
  appointmentId: string;
  userId: string;
  onClose: () => void;
}

export function ChatSidebar({ appointmentId, userId, onClose }: ChatSidebarProps) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    loadChat();

    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    const socket = io(WS_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-user', userId);
    });

    socket.on('new-message', (message: Message) => {
      // Solo añadir si el mensaje pertenece a este chat (esto es una simplificación, 
      // idealmente el servidor debería filtrar por room)
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      
      // Notificación sonora/visual simple si está abierto
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          // Podríamos lanzar una notificación aquí si quisiéramos
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [appointmentId, userId]);

  useEffect(() => {
    if (chatId) {
      loadMessages(chatId);
      if (socketRef.current) {
        socketRef.current.emit('join-chat', chatId);
      }
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = async () => {
    try {
      const response = await api.get('/chats');
      // El backend devuelve id como appointmentId en el índice de chats
      const chat = response.data?.find((c: any) => c.id === appointmentId || c.appointment_id === appointmentId);
      if (chat) {
        setChatId(chat.id);
      }
    } catch (error) {
      console.error('Error loading chat for appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (id: string) => {
    try {
      const response = await api.get(`/chats/${id}/messages`);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Si aún no tenemos chatId, intentamos crearlo o buscarlo de nuevo
    let currentChatId = chatId;
    if (!currentChatId) {
        try {
            // Nota: El backend debería poder crear un chat basado en la cita
            const res = await api.post('/chats', { appointment_id: appointmentId });
            currentChatId = res.data.id;
            setChatId(currentChatId);
        } catch (e: any) {
            alert("Error al iniciar chat: " + (e.response?.data?.message || e.message));
            return;
        }
    }

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const response = await api.post(`/chats/${currentChatId}/messages`, {
        message: messageText,
      });

      setMessages([...messages, response.data]);

      if (socketRef.current) {
        socketRef.current.emit('send-message', {
          chatId: currentChatId,
          message: response.data,
        });
      }

      scrollToBottom();
    } catch (error: any) {
      alert("Error al enviar mensaje: " + (error.response?.data?.message || error.message));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full bg-white border-l w-full sm:w-80 shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-slate-800">Chat de Consulta</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
            <p className="text-sm">Inicia la conversación...</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === userId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border text-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed">{message.message}</p>
                  <p className={`text-[10px] mt-1 font-medium ${isOwn ? 'text-blue-100' : 'text-slate-400'}`}>
                    {format(new Date(message.created_at), "HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-4 border-t bg-white"
      >
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="rounded-xl border-slate-200 focus:ring-blue-500"
          />
          <Button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
