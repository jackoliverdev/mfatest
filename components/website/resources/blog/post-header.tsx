import { Blog } from "@/lib/types";

interface PostHeaderProps {
  blog: Blog;
}

export const PostHeader = ({ blog }: PostHeaderProps) => {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      {blog.blog_category && (
        <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">
          {blog.blog_category}
        </div>
      )}
      
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
        {blog.blog_title}
      </h1>
      
      {blog.blog_excerpt && (
        <p className="text-xl text-gray-600 mb-6">
          {blog.blog_excerpt}
        </p>
      )}
      
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        {blog.posted_date && (
          <span>
            {new Date(blog.posted_date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        )}
        {blog.reading_time && (
          <span>{blog.reading_time} min read</span>
        )}
      </div>
      
      {blog.header_image && (
        <div className="w-full h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden mb-8">
          <img 
            src={blog.header_image} 
            alt={blog.blog_title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}; 