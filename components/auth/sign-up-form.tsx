'use client';

import * as React from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FC, useState, useMemo } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "reactfire";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string(),
    agree: z.boolean().refine(val => val === true, {
      message: "You must agree to the Terms and Privacy Policy.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface SignUpFormProps {
  onSignUp?: () => void;
}

const PasswordStrengthIndicator = ({ password }: { password?: string }) => {
  const strengthChecks = useMemo(() => {
    const checks = {
      length: (password || "").length >= 8,
      lowercase: /[a-z]/.test(password || ""),
      uppercase: /[A-Z]/.test(password || ""),
      number: /\d/.test(password || ""),
      specialChar: /[^A-Za-z0-9]/.test(password || ""),
    };
    return [
      { label: "At least 8 characters", met: checks.length },
      { label: "Contains a lowercase letter", met: checks.lowercase },
      { label: "Contains an uppercase letter", met: checks.uppercase },
      { label: "Contains a number", met: checks.number },
      { label: "Contains a special character", met: checks.specialChar },
    ];
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-1 mt-2">
      {strengthChecks.map((check, index) => (
        <div key={index} className="flex items-center text-sm">
          {check.met ? (
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 mr-2 text-red-500" />
          )}
          <span>{check.label}</span>
        </div>
      ))}
    </div>
  );
};

export const SignUpForm: FC<SignUpFormProps> = ({ onSignUp }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agree: false,
    },
  });

  const auth = useAuth();
  const passwordValue = form.watch("password");

  const signup = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const { email, password } = data;
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (userCred?.user) {
        const token = await userCred.user.getIdToken();

        const res = await fetch("/api/create-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || "Failed to create user profile.");
        }

        toast({ title: "Account created!" });
        onSignUp?.();
        // Redirect to dashboard after successful signup
        router.push("/app");
      }
    } catch (err: any) {
      if ("code" in err && err.code.includes("already")) {
        toast({ title: "User already exists" });
      } else {
        toast({ title: "Error signing up", description: `${err.message}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(signup)}>
          <fieldset disabled={isLoading} className="space-y-4">
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
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <PasswordStrengthIndicator password={passwordValue} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agree"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        id="agree"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </FormControl>
                    <label htmlFor="agree" className="text-sm">
                      I agree to the{' '}
                      <Link href="/legal#terms" className="underline" target="_blank" rel="noopener noreferrer">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/legal#privacy" className="underline" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Sign Up</Button>
          </fieldset>
        </form>
      </Form>

      <p className="mt-4 text-sm">
        Already joined?{" "}
        <Button variant="link" asChild>
          <Link href="/login">Sign in instead.</Link>
        </Button>
      </p>
    </>
  );
};
