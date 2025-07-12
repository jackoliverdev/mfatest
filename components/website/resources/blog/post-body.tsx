import React from "react";
import ReactMarkdown from "react-markdown";
import { Blog } from "@/lib/types";

interface PostBodyProps {
  blog: Blog;
}

// Custom components for react-markdown to ensure proper spacing and font weights
const markdownComponents = {
  h1: (props: any) => <h1 className="text-3xl font-bold mt-8 mb-6" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-semibold mt-8 mb-4" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-semibold mt-6 mb-3" {...props} />,
  h4: (props: any) => <h4 className="text-lg font-semibold mt-5 mb-2" {...props} />,
  p: (props: any) => <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />,
  ul: (props: any) => <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />,
  ol: (props: any) => <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />,
  li: (props: any) => <li className="mb-1 text-gray-700 dark:text-gray-300" {...props} />,
  a: (props: any) => <a className="underline text-blue-600 hover:text-blue-800 font-medium" {...props} />,
  blockquote: (props: any) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600 dark:text-gray-400" {...props} />,
  strong: (props: any) => <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />,
  em: (props: any) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
  code: (props: any) => <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono" {...props} />,
  pre: (props: any) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
};

export const PostBody = ({ blog }: PostBodyProps) => {
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown components={markdownComponents}>
          {blog.blog_content}
        </ReactMarkdown>
        
        {/* Additional images if any */}
        {blog.additional_images && blog.additional_images.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold">Additional Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blog.additional_images.map((image, index) => (
                <div key={index} className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={image} 
                    alt={`Additional image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 