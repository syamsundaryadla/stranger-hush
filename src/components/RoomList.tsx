import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Gamepad2, MessageCircle, Monitor, Sparkles } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description: string;
  theme: string;
}

interface RoomListProps {
  onJoinRoom: (room: Room) => void;
}

const themeIcons = {
  study: BookOpen,
  fun: Sparkles,
  general: MessageCircle,
  tech: Monitor,
  gaming: Gamepad2,
};

const themeColors = {
  study: 'bg-blue-500/10 text-blue-600 border-blue-200',
  fun: 'bg-pink-500/10 text-pink-600 border-pink-200',
  general: 'bg-green-500/10 text-green-600 border-green-200',
  tech: 'bg-purple-500/10 text-purple-600 border-purple-200',
  gaming: 'bg-orange-500/10 text-orange-600 border-orange-200',
};

export const RoomList = ({ onJoinRoom }: RoomListProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
          Anonymous Chat Rooms
        </h1>
        <p className="text-muted-foreground text-lg">
          Join themed chat rooms and connect with people who share your interests
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const IconComponent = themeIcons[room.theme as keyof typeof themeIcons] || MessageCircle;
          const themeColor = themeColors[room.theme as keyof typeof themeColors] || themeColors.general;

          return (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${themeColor}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {room.theme}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{room.name}</CardTitle>
                <CardDescription>{room.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => onJoinRoom(room)} 
                  className="w-full"
                  size="lg"
                >
                  Join Room
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};