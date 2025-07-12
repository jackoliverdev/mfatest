"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import LegalContent from "./legal-content";
import { Card, CardContent } from "@/components/ui/card";

const tabKeys = ["terms", "privacy", "cookie"] as const;
type TabKey = typeof tabKeys[number];

function LegalTabs({ initialTab = "terms" }: { initialTab?: TabKey }) {
  const [tab, setTab] = useState<TabKey>(initialTab);

  // Sync with hash
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash.replace("#", "");
        if (tabKeys.includes(hash as TabKey)) setTab(hash as TabKey);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Update hash when tab changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.hash = tab;
    }
  }, [tab]);

  return (
    <Tabs value={tab} onValueChange={v => setTab(v as TabKey)} className="w-full max-w-2xl mx-auto mt-4">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="terms">Terms</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="cookie">Cookie</TabsTrigger>
      </TabsList>
      <TabsContent value="terms">
        <Card className="bg-white dark:bg-card shadow-md">
          <CardContent className="pt-4 pb-4 px-6">
            <LegalContent type="terms" />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="privacy">
        <Card className="bg-white dark:bg-card shadow-md">
          <CardContent className="pt-4 pb-4 px-6">
            <LegalContent type="privacy" />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="cookie">
        <Card className="bg-white dark:bg-card shadow-md">
          <CardContent className="pt-4 pb-4 px-6">
            <LegalContent type="cookie" />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default LegalTabs; 