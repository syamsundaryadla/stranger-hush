import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Users, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  isUser: boolean;
}

interface ChatUser {
  id: string;
  username: string;
  status: string;
}

export const ChatInterface = () => {
  const [user, setUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [partnerStatus, setPartnerStatus] = useState<"waiting" | "connected" | "disconnected">("waiting");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate finding a partner after 2-4 seconds
    if (partnerStatus === "waiting") {
      const timeout = setTimeout(() => {
        setPartnerStatus("connected");
        toast({
          title: "Partner found!",
          description: "You're now connected to a stranger. Say hello!",
        });
        
        // Add a welcome message from partner
        setTimeout(() => {
          addPartnerMessage("Hello! How are you doing today?");
        }, 1000);
      }, Math.random() * 2000 + 2000);

      return () => clearTimeout(timeout);
    }
  }, [partnerStatus]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateUsername = () => {
    const adjectives = ["Anonymous", "Mystery", "Secret", "Hidden", "Phantom", "Shadow", "Ghost", "Unknown"];
    const numbers = Math.floor(Math.random() * 9999);
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${numbers}`;
  };

  const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const initializeUser = async () => {
    const username = generateUsername();
    const newUser = {
      id: generateId(),
      username,
      status: "online"
    };
    
    setUser(newUser);
    setPartnerStatus("waiting");
  };

  const addPartnerMessage = (content: string) => {
    const newMessage: Message = {
      id: generateId(),
      content,
      sender_id: "partner",
      created_at: new Date().toISOString(),
      isUser: false
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !user) return;

    const newMessage: Message = {
      id: generateId(),
      content: currentMessage.trim(),
      sender_id: user.id,
      created_at: new Date().toISOString(),
      isUser: true
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage("");

    // Simulate partner response (for demo purposes)
    if (partnerStatus === "connected") {
      setTimeout(() => {
        const responses = [
          "That's interesting!",
          "I agree with you.",
          "Tell me more about that.",
          "How do you feel about that?",
          "That's a great point.",
          "I've never thought about it that way.",
          "What made you think of that?",
          "That's really cool!",
          "I can relate to that.",
          "Thanks for sharing!"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addPartnerMessage(randomResponse);
      }, Math.random() * 2000 + 1000);
    }
  };

  const findNewPartner = async () => {
    setIsLoading(true);
    setMessages([]);
    setPartnerStatus("waiting");
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    toast({
      title: "Looking for a new partner",
      description: "Connecting you with someone new...",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Anonymous Chat
          </h1>
          <p className="text-muted-foreground mb-4">Connect with strangers around the world</p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {user.username}
            </Badge>
            <Badge 
              className={`flex items-center gap-2 ${
                partnerStatus === "connected" 
                  ? "bg-status-online text-white" 
                  : partnerStatus === "waiting" 
                  ? "bg-status-waiting text-white" 
                  : "bg-status-offline text-white"
              }`}
            >
              <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
              {partnerStatus === "connected" ? "Connected" : 
               partnerStatus === "waiting" ? "Finding partner..." : "Disconnected"}
            </Badge>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="bg-gradient-card border-border/50 backdrop-blur-sm shadow-xl animate-slide-up">
          <div className="h-[600px] flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {partnerStatus === "waiting" && (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 animate-pulse-glow">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Finding you a chat partner...</h3>
                  <p className="text-muted-foreground text-lg">This usually takes just a few seconds</p>
                  <div className="flex justify-center mt-6">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {partnerStatus === "connected" && messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-status-online/10 mb-4">
                    <Users className="h-8 w-8 text-status-online" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-status-online">Connected!</h3>
                  <p className="text-muted-foreground">You're now chatting with a stranger. Be nice and have fun!</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] ${
                      message.isUser
                        ? "bg-chat-bubble-user text-primary-foreground shadow-lg"
                        : "bg-chat-bubble-partner text-foreground border border-border/20"
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      partnerStatus === "connected" 
                        ? "Type your message..." 
                        : "Waiting for partner..."
                    }
                    disabled={partnerStatus !== "connected"}
                    className="bg-chat-input-bg border-border/50 pr-12 h-12 text-base"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || partnerStatus !== "connected"}
                    size="sm"
                    className="absolute right-2 top-2 h-8 w-8 p-0 bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={findNewPartner}
                  variant="secondary"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 transition-all duration-200 hover:scale-105"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {partnerStatus === "waiting" ? "Cancel Search" : "Next Partner"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Chat anonymously and respectfully. Be kind to strangers!</p>
        </div>
      </div>
    </div>
  );
};