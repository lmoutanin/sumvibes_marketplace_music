import { useState, useEffect } from 'react';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: {
    id: string;
    username: string;
    artistName: string;
  };
  _count?: {
    replies: number;
    likes: number;
  };
  createdAt: string;
}

interface ForumReply {
  id: string;
  content: string;
  author: {
    username: string;
    artistName: string;
  };
  createdAt: string;
}

export function useForum() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch('/api/forum/posts?limit=20&sort=latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching forum posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: { title: string; content: string; category: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (res.ok) {
        await fetchPosts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating post:', error);
      return false;
    }
  };

  const getReplies = async (postId: string): Promise<ForumReply[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];

      const res = await fetch(`/api/forum/posts/${postId}/replies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        return data.replies || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching replies:', error);
      return [];
    }
  };

  const addReply = async (postId: string, content: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const res = await fetch(`/api/forum/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      return res.ok;
    } catch (error) {
      console.error('Error adding reply:', error);
      return false;
    }
  };

  const likePost = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const res = await fetch(`/api/forum/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await fetchPosts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error liking post:', error);
      return false;
    }
  };

  return {
    posts,
    loading,
    createPost,
    getReplies,
    addReply,
    likePost,
    refreshPosts: fetchPosts
  };
}
