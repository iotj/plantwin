import React from 'react';
import { Plant } from '../types';

interface CompanionPlantHeaderProps {
  plants: Plant[];
  onSelectPlant: (plantId: string) => void;
  activePlantId: string | null;
}

const CompanionPlantHeader: React.FC<CompanionPlantHeaderProps> = ({ plants, onSelectPlant, activePlantId }) => {
  return (
    <header className="fixed top-0 left-0 w-full bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800 p-2 z-10">
      <div className="flex items-center space-x-4 overflow-x-auto w-full px-4 pr-24">
        {plants.map(plant => {
          const firstEntry = plant.entries[0];
          const isActive = plant.id === activePlantId;
          return (
            <div key={plant.id} className="relative text-center group cursor-pointer flex flex-col items-center flex-shrink-0 py-2" title={plant.name} onClick={() => onSelectPlant(plant.id)}>
              <div className={`w-16 h-16 rounded-full overflow-hidden mb-1 border-2 group-hover:border-emerald-500 transition-colors flex-shrink-0 ${isActive ? 'border-emerald-500' : 'border-zinc-700'}`}>
                {firstEntry && (
                  <img
                    src={`data:${firstEntry.mimeType};base64,${firstEntry.imageBase64}`}
                    alt={plant.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className={`text-xs group-hover:text-emerald-400 transition-colors truncate w-20 px-1 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`}>{plant.name}</p>
            </div>
          );
        })}
      </div>
    </header>
  );
};

export default CompanionPlantHeader;