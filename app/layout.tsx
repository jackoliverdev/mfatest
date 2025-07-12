import { MyFirebaseProvider } from "@/components/auth/firebase-providers";
import Head from "next/head";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";

const font = Work_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Example LTD | Next.js Firebase Supabase Boilerplate",
  description:
    "Example LTD is a Next.js Firebase Supabase Shadcn/ui Tailwind boilerplate project to help you get started with your next project.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <title>Example LTD | Next.js Firebase Supabase Boilerplate</title>
        <meta name="description" content="Example LTD is a Next.js Firebase Supabase Shadcn/ui Tailwind boilerplate project to help you get started with your next project." />
      </Head>
      <body className={`${font.className} flex flex-col h-screen`}>
        <MyFirebaseProvider>
          {children}
          <Toaster />
        </MyFirebaseProvider>
      </body>
    </html>
  );
}
