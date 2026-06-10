"use client";

import React from "react";

export default function LawyerCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col relative animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar skeleton */}
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        
        <div className="flex-1 min-w-0 space-y-2">
          {/* Name skeleton */}
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          {/* Specialty skeleton */}
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          {/* Location skeleton */}
          <div className="h-3 bg-gray-200 rounded w-1/3 mt-2" />
          {/* Language chips skeleton */}
          <div className="flex gap-2 mt-2">
            <div className="h-4 bg-gray-100 rounded w-12" />
            <div className="h-4 bg-gray-100 rounded w-16" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        {/* Match text skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-8" />
        </div>
        {/* Match bar skeleton */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gray-200 w-2/3 rounded-full" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {/* Tags skeleton */}
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
        <div className="h-6 bg-gray-100 rounded-full w-24" />
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
        <div className="space-y-2">
          {/* Rate skeleton */}
          <div className="h-5 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-100 rounded w-16" />
        </div>
        <div className="flex items-center gap-3">
          {/* Rating skeleton */}
          <div className="h-4 bg-gray-200 rounded w-12" />
          {/* Button skeleton */}
          <div className="h-8 bg-gray-200 rounded-lg w-16" />
        </div>
      </div>
    </div>
  );
}
