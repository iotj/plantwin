
import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative my-4" role="alert">
      <strong className="font-bold">오류 발생: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default ErrorDisplay;
