import { PostClient } from "@/components/website/resources/blog/post-client";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return <PostClient blogId={params.slug} />;
} 