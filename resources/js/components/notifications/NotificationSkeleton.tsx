export const NotificationSkeleton = () => {
  return (
    <div className="p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-5 w-5 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
};
