'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ThumbsUp,
  Edit2,
  Trash2,
  User,
  Clock,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Reply {
  id: string;
  content: string;
  author: string;
  date: string;
  likes: number;
  isLiked: boolean;
}

interface Post {
  id: string;
  content: string;
  author: string;
  date: string;
  likes: number;
  isLiked: boolean;
  isEditing?: boolean;
  replies: Reply[];
  showReplies?: boolean;
}

export default function Community() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [newReply, setNewReply] = useState<{ [key: string]: string }>({});
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editReplyContent, setEditReplyContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(
          `
          *,
          profiles:author_id (nickname),
          likes!likes_post_id_fkey (
            user_id
          ),
          replies (
            id,
            content,
            created_at,
            profiles:author_id (nickname),
            likes!likes_reply_id_fkey (
              user_id
            )
          )
        `
        )
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const formattedPosts = postsData.map((post) => ({
        id: post.id,
        content: post.content,
        author: post.profiles.nickname,
        date: new Date(post.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        likes: post.likes.length,
        isLiked: user
          ? post.likes.some(
              (like: { user_id: string }) => like.user_id === user.id
            )
          : false,
        replies: post.replies.map(
          (reply: {
            id: any;
            content: any;
            profiles: { nickname: any };
            created_at: string | number | Date;
            likes: { user_id: string }[];
          }) => ({
            id: reply.id,
            content: reply.content,
            author: reply.profiles.nickname,
            date: new Date(reply.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            likes: reply.likes.length,
            isLiked: user
              ? reply.likes.some(
                  (like: { user_id: string }) => like.user_id === user.id
                )
              : false,
          })
        ),
        showReplies: false,
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/signin');
      return;
    }

    if (newPost.trim().length === 0 || newPost.length > 1000) return;

    try {
      const { error } = await supabase.from('posts').insert({
        content: newPost,
        author_id: user.id,
      });

      if (error) throw error;

      await fetchPosts();
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    }
  };

  const handleReplySubmit = async (postId: string) => {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (
      !newReply[postId] ||
      newReply[postId].trim().length === 0 ||
      newReply[postId].length > 1000
    )
      return;

    try {
      const { error } = await supabase.from('replies').insert({
        content: newReply[postId],
        post_id: postId,
        author_id: user.id,
      });

      if (error) throw error;

      await fetchPosts();
      setNewReply({ ...newReply, [postId]: '' });
    } catch (error) {
      console.error('Error creating reply:', error);
      setError('Failed to create reply');
    }
  };

  const toggleReplies = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            showReplies: !post.showReplies,
          };
        }
        return post;
      })
    );
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      router.push('/signin');
      return;
    }

    try {
      const post = posts.find((p) => p.id === postId);
      if (!post || post.author === user.user_metadata?.nickname) return;

      if (post.isLiked) {
        await supabase
          .from('likes')
          .delete()
          .match({ post_id: postId, user_id: user.id });
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
      }

      await fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
      setError('Failed to update like');
    }
  };

  const handleReplyLike = async (postId: string, replyId: string) => {
    if (!user) {
      router.push('/signin');
      return;
    }

    try {
      const reply = posts
        .find((p) => p.id === postId)
        ?.replies.find((r) => r.id === replyId);

      if (!reply || reply.author === user.user_metadata?.nickname) return;

      if (reply.isLiked) {
        await supabase
          .from('likes')
          .delete()
          .match({ reply_id: replyId, user_id: user.id });
      } else {
        await supabase
          .from('likes')
          .insert({ reply_id: replyId, user_id: user.id });
      }

      await fetchPosts();
    } catch (error) {
      console.error('Error toggling reply like:', error);
      setError('Failed to update like');
    }
  };

  const handleEdit = async (postId: string) => {
    if (editContent.trim().length === 0 || editContent.length > 1000) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editContent })
        .eq('id', postId)
        .eq('author_id', user?.id);

      if (error) throw error;

      await fetchPosts();
      setEditingPost(null);
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post');
    }
  };

  const handleEditReply = async (replyId: string) => {
    if (editReplyContent.trim().length === 0 || editReplyContent.length > 1000)
      return;

    try {
      const { error } = await supabase
        .from('replies')
        .update({ content: editReplyContent })
        .eq('id', replyId)
        .eq('author_id', user?.id);

      if (error) throw error;

      await fetchPosts();
      setEditingReply(null);
    } catch (error) {
      console.error('Error updating reply:', error);
      setError('Failed to update reply');
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user?.id);

      if (error) throw error;

      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      const { error } = await supabase
        .from('replies')
        .delete()
        .eq('id', replyId)
        .eq('author_id', user?.id);

      if (error) throw error;

      await fetchPosts();
    } catch (error) {
      console.error('Error deleting reply:', error);
      setError('Failed to delete reply');
    }
  };

  return (
    <div
      id="community-section"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-6 font-display">
          Community <span className="text-primary-600">Voices</span>
        </h1>
        <p className="text-xl text-gray-50">
          Join Converstaion! What can Spark Your Saving Journey?
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handlePostSubmit} className="mb-12">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your banking experience... (1000 characters max)"
            className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors resize-none"
            rows={4}
            maxLength={1000}
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              {1000 - newPost.length} characters remaining
            </span>
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-all duration-300"
            >
              Post
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No posts yet. Be the first to share your thoughts!
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {post.author}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
              </div>

              {editingPost === post.id ? (
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors resize-none"
                    rows={4}
                    maxLength={1000}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingPost(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEdit(post.id)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mb-4">{post.content}</p>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    disabled={user?.user_metadata?.nickname === post.author}
                    className={`flex items-center space-x-2 transition-colors ${
                      post.isLiked
                        ? 'text-primary-600'
                        : 'text-gray-500 hover:text-primary-600'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() => toggleReplies(post.id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.replies.length}</span>
                    {post.showReplies ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {user && post.author === user.user_metadata?.nickname && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingPost(post.id);
                        setEditContent(post.content);
                      }}
                      className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {post.showReplies && (
                <div className="mt-4 space-y-4">
                  {/* Only show reply input if user is not the post author */}
                  {user && post.author !== user.user_metadata?.nickname && (
                    <div className="pl-6 border-l-2 border-gray-100">
                      <div className="flex space-x-2">
                        <textarea
                          value={newReply[post.id] || ''}
                          onChange={(e) =>
                            setNewReply({
                              ...newReply,
                              [post.id]: e.target.value,
                            })
                          }
                          placeholder="Write a reply... (1000 characters max)"
                          className="flex-1 p-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors resize-none text-sm"
                          rows={2}
                          maxLength={1000}
                        />
                        <button
                          onClick={() => handleReplySubmit(post.id)}
                          disabled={
                            !newReply[post.id] ||
                            newReply[post.id].trim().length === 0
                          }
                          className="self-end px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}

                  {post.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="pl-6 border-l-2 border-gray-100"
                    >
                      <div className="bg-gray-50 rounded-lg p-4">
                        {editingReply === reply.id ? (
                          <div className="space-y-4">
                            <textarea
                              value={editReplyContent}
                              onChange={(e) =>
                                setEditReplyContent(e.target.value)
                              }
                              className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors resize-none"
                              rows={3}
                              maxLength={1000}
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setEditingReply(null)}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleEditReply(reply.id)}
                                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900 text-sm">
                                  {reply.author}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{reply.date}</span>
                              </div>
                            </div>

                            <p className="text-gray-600 text-sm">
                              {reply.content}
                            </p>

                            <div className="flex items-center justify-between mt-2">
                              <button
                                onClick={() =>
                                  handleReplyLike(post.id, reply.id)
                                }
                                disabled={
                                  user?.user_metadata?.nickname === reply.author
                                }
                                className={`flex items-center space-x-1 text-sm transition-colors ${
                                  reply.isLiked
                                    ? 'text-primary-600'
                                    : 'text-gray-500 hover:text-primary-600'
                                }`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>{reply.likes}</span>
                              </button>

                              {user &&
                                reply.author ===
                                  user.user_metadata?.nickname && (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        setEditingReply(reply.id);
                                        setEditReplyContent(reply.content);
                                      }}
                                      className="p-1 text-gray-500 hover:text-primary-600 transition-colors"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteReply(reply.id)
                                      }
                                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
