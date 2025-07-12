import React from "react";

export default function LegalHero() {
  return (
    <section className="w-full py-8 md:py-12 lg:py-16 xl:py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Legal & Compliance
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Review our terms, privacy, and cookie policies. We are committed to transparency and compliance for all our business clients.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 