import { useState } from 'react';
import { RoomList } from '@/components/RoomList';
import { ChatRoom } from '@/components/ChatRoom';

interface Room {
  id: string;
  name: string;
  description: string;
  theme: string;
}

export const ChatInterface = () => {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const handleJoinRoom = (room: Room) => {
    setCurrentRoom(room);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      {currentRoom ? (
        <ChatRoom room={currentRoom} onLeaveRoom={handleLeaveRoom} />
      ) : (
        <RoomList onJoinRoom={handleJoinRoom} />
      )}
    </div>
  );
};