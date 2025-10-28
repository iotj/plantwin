import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center p-4 md:p-6">
      <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-300 mb-2">
        AI 식물 집사
      </h1>
      <p className="text-slate-400 text-lg">
        AI와 함께 식물을 기록하고 관리하세요.
      </p>
    </header>
  );
};

export default Header;