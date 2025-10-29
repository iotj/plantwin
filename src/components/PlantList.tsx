import React from 'react';
import { Plant } from '../types';

interface PlantListProps {
  plants: Plant[];
  onSelectPlant: (plantId: string) => void;
  onAddPlant: () => void;
  onDeletePlant: (plantId: string) => void;
  onGoHome: () => void;
}

const PlantList: React.FC<PlantListProps> = ({ plants, onSelectPlant, onAddPlant, onDeletePlant, onGoHome }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <button onClick={onGoHome} className="flex items-center gap-2 text-zinc-300 hover:text-emerald-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
            </svg>
            홈으로
        </button>
        <button
          onClick={onAddPlant}
          className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          새 식물 추가
        </button>
      </div>
      
      <h2 className="text-3xl font-bold text-emerald-400">나의 성장 일기</h2>
      
      {plants.length === 0 ? (
        <div className="text-center py-16 px-6 bg-zinc-900 rounded-lg border border-zinc-800">
          <p className="text-zinc-400">아직 등록된 식물이 없어요.</p>
          <p className="text-zinc-500 text-sm mt-1">'새 식물 추가' 버튼을 눌러 첫 번째 식물 일기를 시작해보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plants.map((plant) => {
            const latestEntry = plant.entries[plant.entries.length - 1];
            return (
              <div
                key={plant.id}
                onClick={() => onSelectPlant(plant.id)}
                className="relative bg-zinc-900 rounded-lg border border-zinc-800 p-4 cursor-pointer hover:border-emerald-500 hover:bg-zinc-800/50 transition-all group"
              >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlant(plant.id);
                    }}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-zinc-900/50 rounded-full text-zinc-400 hover:bg-red-500/80 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    aria-label={`${plant.name} 식물 삭제`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022a.75.75 0 01.764.764v8.5c0 1.517 1.233 2.75 2.75 2.75h5.5a2.75 2.75 0 002.75-2.75v-8.5a.75.75 0 01.764-.764l.149.022a.75.75 0 10.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                </button>
                <div className="w-full h-48 bg-zinc-800 rounded-md mb-3 overflow-hidden">
                  {latestEntry && (
                    <img
                      src={`data:${latestEntry.mimeType};base64,${latestEntry.imageBase64}`}
                      alt={plant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <h3 className="text-lg font-bold text-emerald-300 truncate">{plant.name}</h3>
                <p className="text-sm text-zinc-400">
                  {plant.entries.length}개의 기록
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlantList;