import React from 'react';
import { Plant } from '../types';

interface CompanionPlantSidebarProps {
  plants: Plant[];
  onSelectPlant: (plantId: string) => void;
  activePlantId: string | null;
}

const CompanionPlantSidebar: React.FC<CompanionPlantSidebarProps> = ({ plants, onSelectPlant, activePlantId }) => {
  return (
    <aside className="fixed top-0 left-0 h-screen w-24 bg-zinc-950 border-r border-zinc-800 p-2 flex flex-col items-center pt-8 z-10">
      <div className="flex flex-col items-center space-y-4 overflow-y-auto w-full">
        {plants.map(plant => {
          const firstEntry = plant.entries[0];
          const isActive = plant.id === activePlantId;
          return (
            <div key={plant.id} className="relative text-center group cursor-pointer flex flex-col items-center" title={plant.name} onClick={() => onSelectPlant(plant.id)}>
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
    </aside>
  );
};

export default CompanionPlantSidebar;