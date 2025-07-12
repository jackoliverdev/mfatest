import Link from "next/link";
import { Blog } from "@/lib/types";

interface BlogCardProps {
  blog: Blog;
}

export const BlogCard = ({ blog }: BlogCardProps) => {
  return (
    <div className="flex flex-col space-y-2 p-4 border rounded-lg hover:shadow-lg transition-shadow">
      {blog.cover_image && (
        <div className="w-full h-48 bg-gray-200 rounded-md overflow-hidden">
          <img 
            src={blog.cover_image} 
            alt={blog.blog_title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex-1 space-y-2">
        {blog.blog_category && (
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {blog.blog_category}
          </div>
        )}
        
        <Link href={`/blogs/${blog.id}`} className="group">
          <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
            {blog.blog_title}
          </h3>
        </Link>
        
        {blog.blog_excerpt && (
          <p className="text-gray-600 text-sm line-clamp-3">
            {blog.blog_excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          {blog.posted_date && (
            <span>
              {new Date(blog.posted_date).toLocaleDateString()}
            </span>
          )}
          {blog.reading_time && (
            <span>{blog.reading_time} min read</span>
          )}
        </div>
      </div>
    </div>
  );
}; 