import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { getPlantAnalysis, changeFlowerColor, generateBloomingImage } from './services/geminiService';
import { PlantAnalysis, ChatMessage, Plant, DiaryEntry } from './types';
import Header from './components/Header';
import AnalysisResult from './components/ToolCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import ChatInterface from './components/ChatInterface';
import CompanionPlantHeader from './components/CompanionPlantSidebar';
import PlantDetail from './components/PlantDetail';
import { getPlants, savePlants } from './services/storageService';
import Menu from './components/Menu';
import PlantList from './components/PlantList';


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

const App: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PlantAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [bloomingImages, setBloomingImages] = useState<Record<string, string>>({});
  const [isGeneratingBloom, setIsGeneratingBloom] = useState<string | null>(null);
  const [bloomError, setBloomError] = useState<Record<string, string>>({});

  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isPlantRegistered, setIsPlantRegistered] = useState<boolean>(false);
  const [isRegisterPromptVisible, setIsRegisterPromptVisible] = useState<boolean>(false);

  const [view, setView] = useState<'home' | 'detail' | 'plantList'>('home');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setPlants(getPlants());
  }, []);

  const selectedPlant = view === 'detail' ? plants.find(p => p.id === selectedPlantId) : null;

  useEffect(() => {
    if (view === 'detail' && !selectedPlant && selectedPlantId) {
      setView('plantList');
      setSelectedPlantId(null);
    }
  }, [view, selectedPlant, selectedPlantId, plants]);


  const resetChat = () => {
    setChatSession(null);
    setChatMessages([]);
    setIsChatLoading(false);
  };

  const handleReset = () => {
    setQuestion('');
    setImageFile(null);
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    setEditedImage(null);
    setEditError(null);
    setBloomingImages({});
    setIsGeneratingBloom(null);
    setBloomError({});
    resetChat();
    setIsPlantRegistered(false);
    setIsRegisterPromptVisible(false);
    setView('home');
    setSelectedPlantId(null);
    setIsMenuOpen(false);
  };

  const handleSelectPlant = (plantId: string) => {
    setView('detail');
    setSelectedPlantId(plantId);
  };

  const handleRegisterPlant = async () => {
    if (!analysis || !imageFile || isPlantRegistered) return;

    const { base64, mimeType } = await fileToGenerativePart(imageFile);
    
    const newEntry: DiaryEntry = {
        id: `entry-${Date.now()}`,
        date: new Date().toISOString(),
        imageBase64: base64,
        mimeType: mimeType,
        analysis: analysis,
    };

    const newPlant: Plant = {
        id: `plant-${Date.now()}`,
        name: analysis.plantName,
        entries: [newEntry],
    };

    const updatedPlants = [...plants, newPlant];
    setPlants(updatedPlants);
    savePlants(updatedPlants);

    setIsPlantRegistered(true);
    setIsRegisterPromptVisible(false);
    setChatMessages(prev => [
        ...prev,
        { role: 'model', text: `${analysis.plantName}이(가) 반려 식물로 등록되었습니다! 앞으로 성장 일기를 기록할 수 있어요.` }
    ]);
  };
  
  const handleRegistrationChoice = (choice: boolean) => {
    setIsRegisterPromptVisible(false);
    if (choice) {
        handleRegisterPlant();
    } else {
        setChatMessages(prev => [
            ...prev,
            { role: 'model', text: '알겠습니다. 등록하지 않고 계속 대화할 수 있습니다.' }
        ]);
    }
  };

  const handleUpdatePlant = (updatedPlant: Plant) => {
    const updatedPlants = plants.map(p => p.id === updatedPlant.id ? updatedPlant : p);
    setPlants(updatedPlants);
    savePlants(updatedPlants);
  };

  const handleDeletePlant = (plantId: string) => {
    if (window.confirm("이 식물의 모든 기록이 삭제됩니다. 정말 삭제하시겠습니까?")) {
      const updatedPlants = plants.filter(p => p.id !== plantId);
      setPlants(updatedPlants);
      savePlants(updatedPlants);
      if (selectedPlantId === plantId) {
        setView('plantList');
        setSelectedPlantId(null);
      }
    }
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setAnalysis(null);
      setError(null);
      setEditedImage(null);
      setEditError(null);
      setBloomingImages({});
      setIsGeneratingBloom(null);
      setBloomError({});
      resetChat();
      setIsPlantRegistered(false);
      setIsRegisterPromptVisible(false);
    }
  };
  
  const handleColorChange = useCallback(async (color: string) => {
    if (!imageFile) return;

    setIsEditing(true);
    setEditError(null);
    setEditedImage(null);

    try {
        const { base64, mimeType } = await fileToGenerativePart(imageFile);
        const newImageBase64 = await changeFlowerColor(base64, mimeType, color);
        setEditedImage(newImageBase64);
    } catch (err) {
        if (err instanceof Error) {
            setEditError(err.message);
        } else {
            setEditError("이미지 색상 변경 중 알 수 없는 오류가 발생했습니다.");
        }
    } finally {
        setIsEditing(false);
    }
  }, [imageFile]);

  const handleGenerateBloom = useCallback(async (color: string) => {
    if (!imageFile || !analysis?.plantName) return;

    setIsGeneratingBloom(color);
    setBloomError(prev => ({ ...prev, [color]: '' }));

    try {
        const { base64, mimeType } = await fileToGenerativePart(imageFile);
        const newImageBase64 = await generateBloomingImage(base64, mimeType, analysis.plantName, color);
        setBloomingImages(prev => ({ ...prev, [color]: newImageBase64 }));
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "꽃 피우기 중 알 수 없는 오류가 발생했습니다.";
        setBloomError(prev => ({...prev, [color]: errorMessage}));
    } finally {
        setIsGeneratingBloom(null);
    }
  }, [imageFile, analysis]);


  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError("식물 사진을 업로드해 주세요.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setEditedImage(null);
    setEditError(null);
    setBloomingImages({});
    setIsGeneratingBloom(null);
    setBloomError({});
    resetChat();
    setIsPlantRegistered(false);

    try {
      const { base64, mimeType } = await fileToGenerativePart(imageFile);
      const result = await getPlantAnalysis(base64, mimeType, question);
      setAnalysis(result);
      setIsRegisterPromptVisible(true);

      // FIX: Switched from import.meta.env.VITE_API_KEY to process.env.API_KEY to align with coding guidelines and resolve TypeScript errors.
      if (!process.env.API_KEY) {
        throw new Error("API_KEY is not set in environment variables.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: `당신은 사용자의 식물에 대한 전문가입니다. 사용자는 방금 자신의 식물에 대해 AI 진단을 받았습니다. 이제부터 이 진단 내용을 바탕으로 사용자의 추가 질문에 답변해주세요. 진단 정보: ${JSON.stringify(result)}`,
          },
      });
      setChatSession(chat);
      setChatMessages([
          { role: 'model', text: '진단 결과를 바탕으로 궁금한 점이 더 있으신가요? 편하게 물어보세요!' },
          { role: 'model', text: '이 식물을 반려 식물로 등록하시겠습니까?' }
      ]);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, question]);

  const handleSendChatMessage = useCallback(async (message: string) => {
    if (!chatSession) return;

    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    setIsChatLoading(true);
    setIsRegisterPromptVisible(false);

    try {
        const response = await chatSession.sendMessage({ message });
        const modelResponse = response.text;
        setChatMessages(prev => [...prev, { role: 'model', text: modelResponse }]);
    } catch (err) {
        const errorMessage = err instanceof Error ? `오류: ${err.message}` : "메시지 전송 중 오류가 발생했습니다.";
        setChatMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
        setIsChatLoading(false);
    }
  }, [chatSession]);

  const handleMenuClick = () => {
    setIsMenuOpen(true);
  };
  
  const handleNavigate = (targetView: 'home' | 'plantList') => {
    if (targetView === 'home') {
        handleReset();
    } else {
        setView(targetView);
        setSelectedPlantId(null);
        setIsMenuOpen(false);
    }
  };

  const handleBackFromDetail = () => {
    setView('plantList');
    setSelectedPlantId(null);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans">
      <CompanionPlantHeader 
        plants={plants} 
        onSelectPlant={handleSelectPlant} 
        activePlantId={selectedPlantId}
      />
      <div className="pt-28">
        <div className="container mx-auto px-4 py-8 max-w-2xl relative">
          <button
            onClick={handleMenuClick}
            className="fixed top-6 right-6 z-20 w-12 h-12 flex items-center justify-center bg-zinc-800/50 border border-zinc-700/50 rounded-full text-zinc-300 hover:bg-zinc-700 hover:text-emerald-400 transition-all"
            aria-label="메뉴 열기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          
          {isMenuOpen && <Menu onClose={() => setIsMenuOpen(false)} onNavigate={handleNavigate} />}

          {view === 'home' && (
            <>
              <Header />
              <main>
                <form onSubmit={handleSubmit} className="mb-8 space-y-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <div>
                    <label className="text-zinc-400 mb-2 block font-medium">1. 식물 사진</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      ref={fileInputRef}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="w-full h-48 flex flex-col items-center justify-center p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-800 hover:border-emerald-500 transition-all duration-300 group"
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Plant preview" className="max-h-full max-w-full rounded-lg object-contain" />
                      ) : (
                        <div className="text-center text-zinc-500 group-hover:text-emerald-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                          </svg>
                          <p className="font-semibold">사진을 업로드하려면 클릭하세요</p>
                          <p className="text-sm text-zinc-600 group-hover:text-emerald-500">(.jpg, .png, .webp)</p>
                        </div>
                      )}
                    </button>
                  </div>
                  
                  <div>
                    <label htmlFor="question-input" className="text-zinc-400 mb-2 block font-medium">2. 추가 질문 (선택)</label>
                    <input
                      id="question-input"
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="예: 잎이 자꾸 노랗게 변해요"
                      className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                      disabled={isLoading || !!analysis}
                    />
                  </div>

                  <div className="pt-2">
                    {isLoading ? (
                        <button
                            type="button"
                            disabled
                            className="w-full px-6 py-4 bg-zinc-800 text-zinc-500 font-bold text-lg rounded-xl cursor-not-allowed"
                        >
                            분석 중...
                        </button>
                    ) : analysis ? (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={handleRegisterPlant}
                                disabled={isPlantRegistered}
                                className="w-full px-6 py-3 bg-emerald-600 text-white font-bold text-base rounded-xl hover:bg-emerald-700 disabled:bg-emerald-900 disabled:text-emerald-500 disabled:cursor-not-allowed transition-colors"
                            >
                                {isPlantRegistered ? '✓ 등록 완료' : '반려 식물로 등록'}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full px-6 py-3 bg-zinc-700 text-white font-bold text-base rounded-xl hover:bg-zinc-600 transition-colors"
                            >
                                새로 시작하기
                            </button>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            disabled={!imageFile}
                            className="w-full px-6 py-4 bg-emerald-600 text-white font-bold text-lg rounded-xl hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-100"
                        >
                            AI 진단받기
                        </button>
                    )}
                  </div>
                </form>

                {isLoading && <LoadingSpinner />}
                {error && <ErrorDisplay message={error} />}
                {analysis && (
                  <div className="space-y-8">
                    <AnalysisResult
                      imageSrc={imagePreview}
                      analysis={analysis}
                      onColorChange={handleColorChange}
                      editedImage={editedImage}
                      isEditing={isEditing}
                      editError={editError}
                      onGenerateBloom={handleGenerateBloom}
                      bloomingImages={bloomingImages}
                      isGeneratingBloom={isGeneratingBloom}
                      bloomError={bloomError}
                    />
                    {chatSession && (
                      <ChatInterface 
                        messages={chatMessages}
                        onSendMessage={handleSendChatMessage}
                        isLoading={isChatLoading}
                        isRegisterPromptVisible={isRegisterPromptVisible}
                        onRegistrationChoice={handleRegistrationChoice}
                      />
                    )}
                  </div>
                )}
              </main>
            </>
          )}

          {view === 'plantList' && (
            <PlantList 
              plants={plants} 
              onSelectPlant={handleSelectPlant} 
              onAddPlant={handleReset}
              onDeletePlant={handleDeletePlant}
              onGoHome={handleReset}
            />
          )}
          
          {view === 'detail' && selectedPlant && (
             <PlantDetail 
                plant={selectedPlant} 
                onBack={handleBackFromDetail} 
                onUpdatePlant={handleUpdatePlant} 
             />
          )}

          {view === 'detail' && !selectedPlant && (
            <LoadingSpinner />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;