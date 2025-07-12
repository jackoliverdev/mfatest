import { SignInForm } from "@/components/auth/sign-in-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PageTitle } from "@/components/auth/page-title";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { SocialAuth } from "@/components/auth/social-auth";

export default function LoginPage() {
  return (
    <AuthLayout>
      <PageTitle title="Example LTD Sign In" />
      <AuthFormCard 
        title="Sign In" 
        description="Welcome back. Please sign in to continue."
      >
        <SignInForm />
      </AuthFormCard>
      <SocialAuth />
    </AuthLayout>
  );
}
