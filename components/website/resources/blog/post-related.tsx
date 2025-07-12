"use client";

import { useEffect, useState } from "react";
import { Blog } from "@/lib/types";
import { BlogService } from "@/lib/blog-service";
import { BlogCard } from "./card";

interface PostRelatedProps {
  blogId: string;
}

export const PostRelated = ({ blogId }: PostRelatedProps) => {
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        const data = await BlogService.getRelatedBlogs(blogId);
        setRelatedBlogs(data);
      } catch (err) {
        console.error('Failed to fetch related blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedBlogs();
  }, [blogId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center">Loading related posts...</div>
      </div>
    );
  }

  if (relatedBlogs.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedBlogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  );
}; 