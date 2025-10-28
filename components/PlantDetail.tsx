import React, { useState } from 'react';
import { Plant, DiaryEntry } from '../types';
import AnalysisResult from './ToolCard';

interface PlantDetailProps {
  plant: Plant;
  onBack: () => void;
  onAddEntry: () => void;
}

const PlantDetail: React.FC<PlantDetailProps> = ({ plant, onBack, onAddEntry }) => {
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const sortedEntries = [...plant.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleEntryExpansion = (id: string) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
            목록으로
        </button>
         <button
          onClick={onAddEntry}
          className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          일기 쓰기
        </button>
      </div>

      <h2 className="text-3xl font-bold text-green-300">{plant.name}의 성장 일기</h2>
      
      <div className="space-y-4">
        {sortedEntries.map((entry) => (
          <div key={entry.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
             <div className="p-4 cursor-pointer hover:bg-slate-700/50" onClick={() => toggleEntryExpansion(entry.id)}>
                <div className="flex items-start gap-4">
                    <img 
                        src={`data:${entry.mimeType};base64,${entry.imageBase64}`} 
                        alt="Diary snapshot" 
                        className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                        <p className="font-semibold text-slate-300">{new Date(entry.date).toLocaleDateString('ko-KR')}</p>
                        <p className="text-sm text-slate-400">건강 상태: <span className="font-medium text-green-300">{entry.analysis.healthStatus}</span></p>
                        <p className="text-sm text-slate-400 truncate">진단: {entry.analysis.diagnosis}</p>
                    </div>
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
                        className={`w-5 h-5 text-slate-500 transition-transform ${expandedEntryId === entry.id ? 'rotate-180' : ''}`}>
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                </div>
             </div>
             {expandedEntryId === entry.id && (
                <div className="p-4 border-t border-slate-700">
                    <AnalysisResult analysis={entry.analysis} />
                </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlantDetail;
