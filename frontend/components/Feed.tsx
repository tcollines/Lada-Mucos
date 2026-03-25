
import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Plus,
  Send,
  User
} from 'lucide-react';
import { UserRole } from '../types';

interface FeedProps {
  data: any;
  updateData: (updater: (prev: any) => any) => void;
}

const Feed: React.FC<FeedProps> = ({ data, updateData }) => {
  const [newPost, setNewPost] = useState({ title: '', body: '' });
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const user = data.currentUser;
  const posts = [...data.posts].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handlePost = () => {
    if (!newPost.title || !newPost.body) return;

    const post = {
      id: 'post-' + Date.now(),
      adminId: user.id,
      title: newPost.title,
      body: newPost.body,
      images: ['https://picsum.photos/seed/' + Date.now() + '/800/400'],
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    updateData(prev => ({
      ...prev,
      posts: [post, ...prev.posts]
    }), { table: 'posts', data: post });
    setNewPost({ title: '', body: '' });
  };

  const handleLike = (postId: string) => {
    const post = posts.find((p: any) => p.id === postId);
    if (!post) return;

    const liked = post.likes.includes(user.id);
    const updatedLikes = liked ? post.likes.filter((id: string) => id !== user.id) : [...post.likes, user.id];
    const updatedPost = { ...post, likes: updatedLikes };

    updateData(prev => ({
      ...prev,
      posts: prev.posts.map((p: any) => p.id === postId ? updatedPost : p)
    }), { table: 'posts', data: updatedPost });
  };

  const handleComment = (postId: string) => {
    const text = commentText[postId];
    if (!text) return;

    const post = posts.find((p: any) => p.id === postId);
    if (!post) return;

    const updatedComments = [...post.comments, { userId: user.id, text, createdAt: new Date().toISOString() }];
    const updatedPost = { ...post, comments: updatedComments };

    updateData(prev => ({
      ...prev,
      posts: prev.posts.map((p: any) => p.id === postId ? updatedPost : p)
    }), { table: 'posts', data: updatedPost });
    setCommentText({ ...commentText, [postId]: '' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {user.role === UserRole.ADMIN && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-lg text-sac-green">Create New Post</h3>
          <input
            type="text"
            placeholder="Post Title"
            className="w-full bg-sac-beige p-3 rounded-xl outline-none focus:ring-1 focus:ring-sac-green font-bold"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <textarea
            placeholder="What's happening in the SACCO?"
            className="w-full bg-sac-beige p-3 rounded-xl outline-none focus:ring-1 focus:ring-sac-green min-h-[100px] resize-none"
            value={newPost.body}
            onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
          />
          <div className="flex justify-end">
            <button
              onClick={handlePost}
              className="bg-sac-green text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-800 transition-colors"
            >
              <Plus size={18} />
              Publish Post
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post: any) => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sac-green flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <p className="text-sm font-bold">Sacco Administration</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-black">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <h4 className="text-xl font-bold text-gray-900">{post.title}</h4>
              <p className="text-gray-600 leading-relaxed text-sm">{post.body}</p>
            </div>

            {post.images && post.images.length > 0 && (
              <div className="px-4">
                <img src={post.images[0]} className="w-full h-64 object-cover rounded-xl" alt="Post" />
              </div>
            )}

            <div className="p-4 flex items-center gap-6 border-t border-gray-50 mt-4">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.likes.includes(user.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
              >
                <Heart size={20} fill={post.likes.includes(user.id) ? 'currentColor' : 'none'} />
                {post.likes.length}
              </button>
              <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-sac-green">
                <MessageSquare size={20} />
                {post.comments.length}
              </button>
              <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-sac-green ml-auto">
                <Share2 size={20} />
              </button>
            </div>

            {post.comments.length > 0 && (
              <div className="bg-gray-50 px-4 py-4 space-y-4">
                {post.comments.slice(-3).map((comment: any, idx: number) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-sac-green/10 flex items-center justify-center text-sac-green text-xs font-bold shrink-0">
                      <User size={14} />
                    </div>
                    <div className="bg-white p-3 rounded-2xl text-xs shadow-sm border border-gray-100 flex-1">
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-white flex gap-3 border-t">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none border border-gray-100 focus:border-sac-green transition-all"
                value={commentText[post.id] || ''}
                onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
              />
              <button
                onClick={() => handleComment(post.id)}
                className="bg-sac-green text-white p-2 rounded-xl hover:bg-emerald-800 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
