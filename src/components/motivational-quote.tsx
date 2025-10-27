"use client";

import { useState, useEffect } from "react";
import { Quote, getDailyQuote } from "@/lib/quotes";
import { Quote as QuoteIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MotivationalQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuote = () => {
    setIsLoading(true);
    // Simulate a slight delay for better UX
    setTimeout(() => {
      const dailyQuote = getDailyQuote();
      setQuote(dailyQuote);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  if (!quote) {
    return (
      <div className="w-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-3 bg-purple-200 dark:bg-purple-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <QuoteIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              Daily Inspiration
            </h3>
          </div>

          <blockquote className="text-purple-800 dark:text-purple-200 text-lg italic leading-relaxed mb-3">
            &quot;{quote.text}&quot;
          </blockquote>

          <cite className="text-purple-700 dark:text-purple-300 text-sm not-italic flex items-center gap-1">
            — {quote.author}
          </cite>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchQuote}
          disabled={isLoading}
          className="ml-4 text-purple-600 hover:text-purple-800 hover:bg-purple-100 dark:text-purple-400 dark:hover:text-purple-200 dark:hover:bg-purple-800/20"
          title="Get another quote"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}