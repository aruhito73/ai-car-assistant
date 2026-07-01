import React from 'react';
import GlassCard from './GlassCard';

export const LoadingSkeleton = ({
  width = 'w-full',
  height = 'h-4',
  variant = 'text', // text, circle, rect
  className = ''
}) => {
  const variantClasses = {
    text: 'rounded',
    circle: 'rounded-full',
    rect: 'rounded-xl'
  };

  return (
    <div
      className={`animate-pulse bg-white/10 dark:bg-white/5 ${width} ${height} ${variantClasses[variant]} ${className}`}
    />
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <GlassCard className={`flex flex-col gap-4 ${className}`}>
      {/* Header Skeleton */}
      <div className="flex items-center gap-3">
        <LoadingSkeleton variant="circle" width="w-10" height="h-10" />
        <div className="flex-1 flex flex-col gap-2">
          <LoadingSkeleton variant="text" width="w-1/3" height="h-4" />
          <LoadingSkeleton variant="text" width="w-1/2" height="h-3" />
        </div>
      </div>
      
      {/* Body Skeletons */}
      <div className="flex flex-col gap-2 my-2">
        <LoadingSkeleton variant="text" width="w-full" height="h-3" />
        <LoadingSkeleton variant="text" width="w-5/6" height="h-3" />
        <LoadingSkeleton variant="text" width="w-4/5" height="h-3" />
      </div>

      {/* Footer Button Skeleton */}
      <div className="flex justify-end mt-2">
        <LoadingSkeleton variant="rect" width="w-24" height="h-9" />
      </div>
    </GlassCard>
  );
};

export default LoadingSkeleton;
