import { useState, useEffect } from 'react';
import { Blog } from '@/lib/types';
import { BlogService } from '@/lib/blog-service';

export const useBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await BlogService.getBlogs();
      setBlogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return {
    blogs,
    loading,
    error,
    refetch: fetchBlogs,
  };
};

export const useBlog = (blogId: string) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const data = await BlogService.getBlog(blogId);
      setBlog(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  return {
    blog,
    loading,
    error,
    refetch: fetchBlog,
  };
};

export const useBlogsByCategory = (category: string) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await BlogService.getBlogsByCategory(category);
      setBlogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchBlogs();
    }
  }, [category]);

  return {
    blogs,
    loading,
    error,
    refetch: fetchBlogs,
  };
}; 