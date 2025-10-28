import React from 'react';

interface MenuProps {
  onClose: () => void;
  onNavigate: (view: 'home' | 'plantList') => void;
}

const Menu: React.FC<MenuProps> = ({ onClose, onNavigate }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-emerald-400">메뉴</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-800 transition-colors" aria-label="메뉴 닫기">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-4">
          <button 
            onClick={() => onNavigate('home')} 
            className="w-full text-left p-4 bg-zinc-800 hover:bg-emerald-500/10 hover:text-emerald-300 rounded-lg transition-all flex items-center gap-4 text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-emerald-400">
              <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
            </svg>
            <span>홈 화면</span>
          </button>
          <button 
            onClick={() => onNavigate('plantList')} 
            className="w-full text-left p-4 bg-zinc-800 hover:bg-emerald-500/10 hover:text-emerald-300 rounded-lg transition-all flex items-center gap-4 text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-emerald-400">
              <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
            </svg>
            <span>성장 일기</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Menu;