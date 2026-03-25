
import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  MessageSquare,
  Search,
  Plus,
  Send,
  MoreVertical,
  ChevronLeft,
  Smile,
  Paperclip
} from 'lucide-react';

interface GroupsProps {
  data: any;
  updateData: (updater: (prev: any) => any) => void;
}

const Groups: React.FC<GroupsProps> = ({ data, updateData }) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const user = data.currentUser;

  // Simulation: Find or Create a Group if user is not in one
  useEffect(() => {
    if (!user.groupId) {
      updateData(prev => {
        // FIFO Group Logic: Find groups with space
        let groupToJoin = prev.groups.find((g: any) => g.memberIds.length < 15);
        let persistenceTasks: any[] = [];

        if (!groupToJoin) {
          const newGroupId = 'group-' + Date.now();
          groupToJoin = {
            id: newGroupId,
            name: `Lada Group ${prev.groups.length + 1}`,
            memberIds: [user.id],
            chatId: 'chat-' + Date.now(),
            createdAt: new Date().toISOString()
          };
          persistenceTasks.push({ table: 'groups', data: groupToJoin });
          persistenceTasks.push({ table: 'users', data: { ...user, groupId: newGroupId } });

          return {
            data: {
              ...prev,
              groups: [...prev.groups, groupToJoin],
              users: prev.users.map((u: any) => u.id === user.id ? { ...u, groupId: newGroupId } : u)
            },
            persistence: persistenceTasks
          };
        } else {
          const updatedGroup = { ...groupToJoin, memberIds: [...groupToJoin.memberIds, user.id] };
          persistenceTasks.push({ table: 'groups', data: updatedGroup });
          persistenceTasks.push({ table: 'users', data: { ...user, groupId: groupToJoin.id } });

          return {
            data: {
              ...prev,
              groups: prev.groups.map((g: any) => g.id === groupToJoin.id ? updatedGroup : g),
              users: prev.users.map((u: any) => u.id === user.id ? { ...u, groupId: groupToJoin.id } : u)
            },
            persistence: persistenceTasks
          };
        }
      });
    }
  }, [user.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data.messages, selectedGroupId]);

  const activeGroup = data.groups.find((g: any) => g.id === user.groupId);
  const groupMessages = data.messages.filter((m: any) => m.groupId === user.groupId);

  const sendMessage = () => {
    if (!messageInput.trim() || !activeGroup) return;

    const newMessage = {
      id: 'msg-' + Date.now(),
      groupId: activeGroup.id,
      senderId: user.id,
      text: messageInput,
      createdAt: new Date().toISOString()
    };

    updateData(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }), { table: 'messages', data: newMessage });
    setMessageInput('');
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col sm:flex-row bg-white rounded-3xl border shadow-sm overflow-hidden animate-in fade-in duration-500">
      {/* Group Sidebar */}
      <div className={`w-full sm:w-80 flex flex-col border-r ${selectedGroupId ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-sac-green mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-sac-green"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeGroup ? (
            <div
              onClick={() => setSelectedGroupId(activeGroup.id)}
              className={`p-6 cursor-pointer border-l-4 transition-all hover:bg-emerald-50 ${selectedGroupId === activeGroup.id ? 'border-sac-green bg-emerald-50/50' : 'border-transparent'}`}
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sac-green flex items-center justify-center text-white shrink-0">
                  <Users size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-bold truncate text-sac-green">{activeGroup.name}</p>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Today</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {groupMessages.length > 0 ? groupMessages[groupMessages.length - 1].text : 'Start a conversation...'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 italic text-sm">
              Finding your group...
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedGroupId ? 'hidden sm:flex items-center justify-center bg-sac-beige/30' : 'flex'}`}>
        {selectedGroupId && activeGroup ? (
          <>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedGroupId(null)} className="sm:hidden p-1 text-gray-400"><ChevronLeft size={24} /></button>
                <div className="w-10 h-10 rounded-xl bg-sac-green flex items-center justify-center text-white font-bold">
                  {activeGroup.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sac-green">{activeGroup.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{activeGroup.memberIds.length} members online</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-sac-green"><MoreVertical size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-sac-beige/10">
              {groupMessages.map((msg: any) => {
                const isMe = msg.senderId === user.id;
                const sender = data.users.find((u: any) => u.id === msg.senderId);
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && <p className="text-[10px] font-bold text-gray-400 ml-2 uppercase">{sender?.fullName || 'User'}</p>}
                      <div className={`
                        px-4 py-3 rounded-[1.5rem] shadow-sm text-sm
                        ${isMe ? 'bg-sac-green text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}
                      `}>
                        {msg.text}
                      </div>
                      <p className="text-[9px] text-gray-400 px-2">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white border-t">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <button className="p-2 text-gray-400 hover:text-sac-green"><Smile size={20} /></button>
                <button className="p-2 text-gray-400 hover:text-sac-green"><Paperclip size={20} /></button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="bg-sac-green text-white p-2.5 rounded-xl shadow-lg shadow-emerald-900/10 hover:bg-emerald-800 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <MessageSquare size={64} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-400">Select a chat to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
