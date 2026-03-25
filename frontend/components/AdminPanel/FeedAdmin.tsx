import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface FeedAdminProps {
  updateData: (updater: (prev: any) => any, persistenceInfo?: { table: string, data: any }) => void;
  setActiveTab: (tab: any) => void;
}

const FeedAdmin: React.FC<FeedAdminProps> = ({ updateData, setActiveTab }) => {
  const [feedTitle, setFeedTitle] = useState('');
  const [feedBody, setFeedBody] = useState('');

  const handleCreatePost = () => {
    if (!feedTitle || !feedBody) return;
    const newPost = {
      id: 'post-' + Date.now(),
      adminId: 'admin1',
      title: feedTitle,
      body: feedBody,
      images: ['https://picsum.photos/seed/' + Date.now() + '/800/400'],
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    updateData(prev => ({
      ...prev,
      posts: [newPost, ...prev.posts]
    }), { table: 'posts', data: newPost });
    setFeedTitle('');
    setFeedBody('');
    setActiveTab('feed');
    alert("Post created successfully!");
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto animate-in slide-in-from-bottom duration-300">
      <h3 className="text-lg font-bold text-sac-green">Create Official Update</h3>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Announcement Title"
          className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-1 focus:ring-sac-green font-bold text-sm"
          value={feedTitle}
          onChange={e => setFeedTitle(e.target.value)}
        />
        <textarea
          placeholder="Write post content..."
          className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-1 focus:ring-sac-green min-h-[160px] text-sm resize-none"
          value={feedBody}
          onChange={e => setFeedBody(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            onClick={handleCreatePost}
            className="px-8 py-3 bg-sac-green text-white font-bold rounded-xl shadow-lg hover:bg-emerald-800 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Publish Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedAdmin;