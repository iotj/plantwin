import React, { useState, useRef } from 'react';
import { Plant, DiaryEntry, PlantAnalysis } from '../types';
import AnalysisResult from './ToolCard';
import { getPlantAnalysis } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

interface PlantDetailProps {
  plant: Plant;
  onBack: () => void;
  onUpdatePlant: (updatedPlant: Plant) => void;
}

type Notification = {
  text: string;
  type: 'warning' | 'info' | 'success';
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    base64: await base64EncodedDataPromise,
    mimeType: file.type,
  };
};

const getNotifications = (plant: Plant): Notification[] => {
    const notifications: Notification[] = [];
    if (!plant.entries || plant.entries.length === 0) {
        return [];
    }
    const latestEntry = [...plant.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (!latestEntry) return [];
    
    const { analysis } = latestEntry;

    if (analysis.healthStatus && analysis.healthStatus !== '건강함') {
        notifications.push({ text: `현재 식물 상태가 좋지 않아요: ${analysis.healthStatus}.`, type: 'warning' });
    }
    if (analysis.hydrationInfo && (analysis.hydrationInfo.includes('부족') || analysis.hydrationInfo.includes('과습'))) {
        notifications.push({ text: `수분 관리가 필요해요: ${analysis.hydrationInfo}.`, type: 'warning' });
    }
    if (analysis.sunlightInfo && (analysis.sunlightInfo.includes('부족') || analysis.sunlightInfo.includes('과다') || analysis.sunlightInfo.includes('강함'))) {
        notifications.push({ text: `광량 조절이 필요해 보여요: ${analysis.sunlightInfo}.`, type: 'info' });
    }
     if (analysis.pestDiseaseInfo) {
        notifications.push({ text: '병충해가 의심됩니다. 진단 내용을 확인해보세요.', type: 'warning' });
    }
    if (analysis.repottingInfo) {
        notifications.push({ text: '분갈이가 필요할 수 있습니다. 진단 내용을 확인해보세요.', type: 'info' });
    }
    if (analysis.pruningInfo) {
        notifications.push({ text: '가지치기가 필요할 수 있습니다. 진단 내용을 확인해보세요.', type: 'info' });
    }

    if (notifications.length === 0) {
        return [{ text: "특별한 알림이 없어요. 식물이 건강하게 자라고 있습니다!", type: 'success' }];
    }

    return notifications;
};

const NotificationIcon: React.FC<{type: Notification['type']}> = ({ type }) => {
    switch (type) {
        case 'success':
            return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-400 shrink-0"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>;
        case 'warning':
            return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-400 shrink-0"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
        case 'info':
            return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-400 shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A.75.75 0 0010 14.25a.75.75 0 00.75-.75v-.253a.25.25 0 01-.244-.304l.459-2.066A.75.75 0 009 9z" clipRule="evenodd" /></svg>;
        default:
            return null;
    }
}

const PlantDetail: React.FC<PlantDetailProps> = ({ plant, onBack, onUpdatePlant }) => {
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [isAddingEntry, setIsAddingEntry] = useState<boolean>(false);
  
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addEntryError, setAddEntryError] = useState<string | null>(null);
  const [isPlantMismatch, setIsPlantMismatch] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  const sortedEntries = [...plant.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const notifications = getNotifications(plant);

  const toggleEntryExpansion = (id: string) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };
  
  const handleCancelAddEntry = () => {
    setIsAddingEntry(false);
    setNewImageFile(null);
    setNewImagePreview(null);
    setNewQuestion('');
    setAddEntryError(null);
    setIsSubmitting(false);
    setIsPlantMismatch(false);
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
      setAddEntryError(null);
      setIsPlantMismatch(false);
    }
  };

  const handleRetryUpload = () => {
    setIsPlantMismatch(false);
    setAddEntryError(null);
    if (newFileInputRef.current) {
        newFileInputRef.current.value = ''; // Reset file input
        newFileInputRef.current.click();
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    if (window.confirm("이 기록을 정말 삭제하시겠습니까?")) {
        const updatedEntries = plant.entries.filter(entry => entry.id !== entryId);
        const updatedPlant = { ...plant, entries: updatedEntries };
        onUpdatePlant(updatedPlant);
    }
  };

  const handleSubmitNewEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageFile) {
        setAddEntryError("성장 일기에 기록할 사진을 업로드해주세요.");
        return;
    }

    setIsSubmitting(true);
    setAddEntryError(null);
    setIsPlantMismatch(false);

    try {
        const { base64, mimeType } = await fileToGenerativePart(newImageFile);
        const newAnalysis = await getPlantAnalysis(base64, mimeType, newQuestion);

        // AI가 분석한 식물 종류가 현재 일기의 식물과 다른지 확인합니다.
        if (newAnalysis.plantName.trim() !== plant.name.trim()) {
            setAddEntryError('이 사진 속 식물은 현재 일기의 식물 종류와 다른 것 같아요. 한번 더 확인해주세요.');
            setIsPlantMismatch(true);
            return; // 추가 과정을 중단합니다.
        }

        const newEntry: DiaryEntry = {
            id: `entry-${Date.now()}`,
            date: new Date().toISOString(),
            imageBase64: base64,
            mimeType: mimeType,
            analysis: newAnalysis,
        };

        const updatedPlant: Plant = {
            ...plant,
            entries: [newEntry, ...plant.entries],
        };

        onUpdatePlant(updatedPlant);
        handleCancelAddEntry();
        setExpandedEntryId(newEntry.id);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "AI 진단 중 알 수 없는 오류가 발생했습니다.";
        setAddEntryError(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-300 hover:text-emerald-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
            목록으로
        </button>
        {!isAddingEntry && (
         <button
          onClick={() => setIsAddingEntry(true)}
          className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          새 일기 쓰기
        </button>
        )}
      </div>

      <h2 className="text-3xl font-bold text-emerald-400">{plant.name}의 성장 일기</h2>
      
      {isAddingEntry && (
        <form onSubmit={handleSubmitNewEntry} className="my-6 bg-zinc-900 border border-emerald-500/30 rounded-2xl p-6 space-y-6 animate-fade-in">
          <h3 className="text-xl font-bold text-zinc-100">새로운 성장 기록 추가</h3>
          <div>
            <label className="text-zinc-400 mb-2 block font-medium">1. 현재 식물 사진</label>
            <input type="file" accept="image/*" onChange={handleNewImageChange} className="hidden" ref={newFileInputRef} disabled={isSubmitting}/>
            <div className="relative">
                <button type="button" onClick={() => !isPlantMismatch && newFileInputRef.current?.click()} disabled={isSubmitting}
                    className="w-full h-48 flex flex-col items-center justify-center p-4 bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-xl transition-all duration-300 group hover:border-emerald-500"
                    style={{ cursor: isPlantMismatch ? 'default' : 'pointer' }}
                    >
                    {newImagePreview ? (
                        <img 
                            src={newImagePreview} 
                            alt="New plant preview" 
                            className="max-h-full max-w-full rounded-lg object-contain transition-all duration-300"
                            style={{ filter: isPlantMismatch ? 'brightness(0.3) blur(2px)' : 'none' }}
                        />
                    ) : (
                        <div className="text-center text-zinc-500 group-hover:text-emerald-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                            <p className="font-semibold">사진을 업로드하려면 클릭하세요</p>
                        </div>
                    )}
                </button>
                {isPlantMismatch && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <button
                            type="button"
                            onClick={handleRetryUpload}
                            className="p-3 bg-zinc-800/80 border border-zinc-600 rounded-full text-white hover:bg-emerald-600 hover:border-emerald-500 transition-all transform hover:scale-110"
                            aria-label="사진 다시 선택하기"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747M20 4v5h-5" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
          </div>
          <div>
              <label htmlFor="new-question-input" className="text-zinc-400 mb-2 block font-medium">2. 추가 질문 (선택)</label>
              <input id="new-question-input" type="text" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="예: 잎 끝이 갈색으로 변했어요"
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                  disabled={isSubmitting} />
          </div>
          {isSubmitting && !isPlantMismatch && <LoadingSpinner />}
          {addEntryError && <ErrorDisplay message={addEntryError} />}
          <div className="pt-2 flex items-center gap-4">
              <button type="submit" disabled={!newImageFile || isSubmitting || isPlantMismatch}
                  className="flex-grow px-6 py-3 bg-emerald-600 text-white font-bold text-base rounded-xl hover:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors">
                  {isSubmitting ? 'AI가 분석 중...' : 'AI 진단 및 일기 추가'}
              </button>
              <button type="button" onClick={handleCancelAddEntry} disabled={isSubmitting}
                  className="px-6 py-3 bg-zinc-700 text-white font-bold text-base rounded-xl hover:bg-zinc-600 transition-colors disabled:opacity-50">
                  취소
              </button>
          </div>
        </form>
      )}

      {notifications.length > 0 && (
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-3">
                <h3 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-zinc-400"><path d="M10 2a.75.75 0 01.75.75v.518a4.5 4.5 0 013.475 2.065l.348.519a.75.75 0 01-.368 1.033l-1.35.676a.75.75 0 01-.812-.045l-.473-.354a2.992 2.992 0 00-3.216 0l-.473.354a.75.75 0 01-.812.045l-1.35-.676a.75.75 0 01-.368-1.033l.348-.52A4.5 4.5 0 019.25 3.268V2.75A.75.75 0 0110 2zM5.003 7.23a.75.75 0 01.623.869l-.348 1.044a.75.75 0 01-1.033.368l-.676-1.35a.75.75 0 01.368-1.033l1.044-.348a.75.75 0 01.869.623zM14.997 7.23a.75.75 0 01.869-.623l1.044.348a.75.75 0 01.368 1.033l-.676 1.35a.75.75 0 01-1.033-.368l-.348-1.044a.75.75 0 01.623-.869zM10 12.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5a.75.75 0 01.75-.75z" /></svg>
                    주요 알림
                </h3>
                <ul className="list-none space-y-2">
                    {notifications.map((note, index) => (
                        <li key={index} className="flex items-start gap-3 text-zinc-300 text-sm">
                            <NotificationIcon type={note.type} />
                            <span>{note.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      
      <div className="space-y-4">
        {sortedEntries.map((entry) => (
          <div key={entry.id} className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
             <div className="p-4 cursor-pointer hover:bg-zinc-800/50 flex items-center gap-4" onClick={() => toggleEntryExpansion(entry.id)}>
                <img 
                    src={`data:${entry.mimeType};base64,${entry.imageBase64}`} 
                    alt="Diary snapshot" 
                    className="w-20 h-20 object-cover rounded-md border border-zinc-700"
                />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-300">{new Date(entry.date).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm text-zinc-400">건강 상태: <span className="font-medium text-emerald-400">{entry.analysis.healthStatus}</span></p>
                    <p className="text-sm text-zinc-400 truncate pr-4">{entry.analysis.diagnosis}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEntry(entry.id);
                        }}
                        className="p-2 rounded-full text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        aria-label="일기 삭제"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022a.75.75 0 01.764.764v8.5c0 1.517 1.233 2.75 2.75 2.75h5.5a2.75 2.75 0 002.75-2.75v-8.5a.75.75 0 01.764-.764l.149.022a.75.75 0 10.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
                        className={`w-5 h-5 text-zinc-500 transition-transform shrink-0 ${expandedEntryId === entry.id ? 'rotate-180' : ''}`}>
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                </div>
             </div>
             {expandedEntryId === entry.id && (
                <div className="p-4 border-t border-zinc-800 animate-fade-in">
                    <AnalysisResult 
                        analysis={entry.analysis} 
                        imageSrc={`data:${entry.mimeType};base64,${entry.imageBase64}`}
                    />
                </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlantDetail;