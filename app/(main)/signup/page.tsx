import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PageTitle } from "@/components/auth/page-title";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { SocialAuth } from "@/components/auth/social-auth";

export default function SignupPage() {
  return (
    <AuthLayout>
      <PageTitle title="Example LTD Sign Up" />
      <AuthFormCard 
        title="Register" 
        description="Create an account to get started."
      >
        <SignUpForm />
      </AuthFormCard>
      <SocialAuth />
    </AuthLayout>
  );
} 