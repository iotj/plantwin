import React from 'react';
import { Plant } from '../types';

interface PlantListProps {
  plants: Plant[];
  onSelectPlant: (plantId: string) => void;
  onAddPlant: () => void;
}

const PlantList: React.FC<PlantListProps> = ({ plants, onSelectPlant, onAddPlant }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-200">나의 식물 목록</h2>
        <button
          onClick={onAddPlant}
          className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          새 식물 추가
        </button>
      </div>
      {plants.length === 0 ? (
        <div className="text-center py-12 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-slate-400">아직 등록된 식물이 없어요.</p>
          <p className="text-slate-500 text-sm mt-1">'새 식물 추가' 버튼을 눌러 첫 번째 식물 일기를 시작해보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plants.map((plant) => {
            const latestEntry = plant.entries[plant.entries.length - 1];
            return (
              <div
                key={plant.id}
                onClick={() => onSelectPlant(plant.id)}
                className="bg-slate-800 rounded-lg border border-slate-700 p-4 cursor-pointer hover:border-green-500 hover:bg-slate-700/50 transition-all group"
              >
                <div className="w-full h-40 bg-slate-900 rounded-md mb-3 overflow-hidden">
                  {latestEntry && (
                    <img
                      src={`data:${latestEntry.mimeType};base64,${latestEntry.imageBase64}`}
                      alt={plant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <h3 className="text-lg font-bold text-green-300 truncate">{plant.name}</h3>
                <p className="text-sm text-slate-400">
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
