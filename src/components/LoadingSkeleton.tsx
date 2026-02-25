'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function QuizCardSkeleton({ count = 3 }: SkeletonProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="h-6 w-24 bg-gray-200 rounded-full" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-full bg-gray-200 rounded mb-4" />
          <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
          
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="h-6 w-16 bg-gray-200 rounded" />
            <div className="h-6 w-20 bg-gray-200 rounded" />
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuestionSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-5 w-16 bg-gray-200 rounded" />
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="h-6 w-full bg-gray-200 rounded mb-6" />
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-8" />

        {/* Options */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-full p-4 bg-gray-100 rounded-lg border-2 border-gray-200"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
                <div className="h-5 w-3/4 bg-gray-300 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="mt-6 flex justify-end">
          <div className="h-12 w-32 bg-gray-300 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedQuizSkeleton() {
  return (
    <div className="mb-8 animate-pulse">
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl p-8 h-64">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-16 bg-white/30 rounded-full" />
              <div className="h-4 w-32 bg-white/30 rounded" />
            </div>
            <div className="h-8 w-64 bg-white/40 rounded mb-3" />
            <div className="h-5 w-full bg-white/30 rounded mb-2" />
            <div className="h-5 w-2/3 bg-white/30 rounded mb-4" />
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="h-6 w-20 bg-white/30 rounded-full" />
              <div className="h-6 w-24 bg-white/30 rounded-full" />
              <div className="h-6 w-16 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Spinner({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`${className} animate-spin`}>
      <svg
        className="text-purple-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="w-12 h-12" />
    </div>
  );
}
