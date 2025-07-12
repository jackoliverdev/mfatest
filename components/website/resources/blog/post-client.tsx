"use client";

import { useEffect, useState } from "react";
import { Blog } from "@/lib/types";
import { BlogService } from "@/lib/blog-service";
import { PostHeader } from "./post-header";
import { PostBody } from "./post-body";
import { PostRelated } from "./post-related";

interface PostClientProps {
  blogId: string;
}

export const PostClient = ({ blogId }: PostClientProps) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await BlogService.getBlog(blogId);
        setBlog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (loading) {
    return (
      <div className="container px-4 md:px-6 py-24">
        <div className="text-center">Loading blog post...</div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container px-4 md:px-6 py-24">
        <div className="text-center text-red-500">
          {error || 'Blog post not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <PostHeader blog={blog} />
      <PostBody blog={blog} />
      <PostRelated blogId={blog.id} />
    </div>
  );
}; 