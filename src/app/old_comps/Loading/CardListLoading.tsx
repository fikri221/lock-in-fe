import React from "react";

export default function CardListLoading() {
  return (
    <div className="task-list">
      <div className="flex flex-col gap-1 p-4 mb-3 bg-white rounded-xl shadow transition hover:shadow-lg cursor-pointer border border-gray-200">
        <div className="flex items-center justify-between w-full">
          {/* Skeleton Placeholder untuk title */}
          <div className="h-4 w-1/3 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {/* Skeleton Placeholder untuk subtitle */}
          <div className="h-3 w-2/5 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
