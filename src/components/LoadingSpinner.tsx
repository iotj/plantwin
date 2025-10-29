
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      <p className="text-zinc-200 text-lg font-medium">AI가 식물 상태를 꼼꼼히 살피고 있습니다...</p>
      <p className="text-zinc-400 text-sm">잠시만 기다려 주세요.</p>
    </div>
  );
};

export default LoadingSpinner;