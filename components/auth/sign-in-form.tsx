'use client';

import * as React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FC, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "reactfire";
import { signInWithEmailAndPassword, getMultiFactorResolver } from "firebase/auth";
import { ModalForgotPassword } from "@/components/auth/modal-forgot-password";
import { MFAVerification } from "@/components/auth/mfa-verification";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const SignInForm: FC = () => {
  const auth = useAuth();
  const router = useRouter();
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [mfaResolver, setMfaResolver] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async ({ email, password }: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success!",
        description: "You have been signed in.",
      });
      // Redirect to dashboard after successful login
      router.push("/app");
    } catch (error: any) {
      if (error.code === 'auth/multi-factor-auth-required') {
        // MFA is required
        const resolver = getMultiFactorResolver(auth, error);
        setMfaResolver(resolver);
        toast({
          title: "Two-Factor Authentication Required",
          description: "Please verify your identity to complete sign-in.",
        });
      } else {
        toast({ title: "Error Signing In", description: `${error.message}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSuccess = () => {
    setMfaResolver(null);
    toast({
      title: "Success!",
      description: "You have been signed in.",
    });
    // Redirect to dashboard after successful MFA
    router.push("/app");
  };

  const handleMfaCancel = () => {
    setMfaResolver(null);
  };

  // Show MFA verification if required
  if (mfaResolver) {
    return (
      <MFAVerification
        resolver={mfaResolver}
        onSuccess={handleMfaSuccess}
        onCancel={handleMfaCancel}
      />
    );
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(login)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} {...field} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-sm">
        Forgot password?{" "}
        <Button variant="link" onClick={() => setIsResetOpen(true)}>
          Reset
        </Button>
      </p>
      <p className="text-sm">
        Not a member?{" "}
        <Button variant="link" asChild>
          <Link href="/signup">Sign up instead.</Link>
        </Button>
      </p>
      <ModalForgotPassword isOpen={isResetOpen} setIsOpen={setIsResetOpen} />
    </>
  );
};
