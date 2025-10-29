import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center p-4 md:p-6">
      <h1 className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">
        AI 식물 집사
      </h1>
      <p className="text-zinc-500 text-lg">
        AI와 함께 식물을 기록하고 관리하세요.
      </p>
    </header>
  );
};

export default Header;
