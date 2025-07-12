'use client';

import { useEffect, useState } from "react";
import { useUser } from "reactfire";
import { UserProfile } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
});

export const ProfileSettings = () => {
  const { data: user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setIsLoading(true);
        const token = await user.getIdToken();
        const res = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          form.reset({
            name: data.name || "",
            bio: data.bio || "",
          });
        } else {
            console.error("Error fetching profile", await res.text());
        }
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    const token = await user.getIdToken();

    const res = await fetch("/api/profile", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
    });

    if (!res.ok) {
      toast({
        title: "Error updating profile",
        description: await res.text(),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated!",
      });
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Input placeholder="Tell us a little about yourself" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}; 