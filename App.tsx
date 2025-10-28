import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { getPlantAnalysis, changeFlowerColor, generateBloomingImage } from './services/geminiService';
import { PlantAnalysis, ChatMessage } from './types';
import Header from './components/Header';
import AnalysisResult from './components/ToolCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import ChatInterface from './components/ChatInterface';

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

  const resetChat = () => {
    setChatSession(null);
    setChatMessages([]);
    setIsChatLoading(false);
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

    try {
      const { base64, mimeType } = await fileToGenerativePart(imageFile);
      const result = await getPlantAnalysis(base64, mimeType, question);
      setAnalysis(result);

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
          { role: 'model', text: '진단 결과를 바탕으로 궁금한 점이 더 있으신가요? 편하게 물어보세요! 예를 들어 "물은 며칠에 한 번 주는 게 좋을까?" 와 같이 질문할 수 있어요.' }
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

  return (
    <div className="min-h-screen bg-black font-sans">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
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
                disabled={isLoading}
              />
            </div>

            <button
                type="submit"
                disabled={isLoading || !imageFile}
                className="w-full px-6 py-4 bg-emerald-600 text-white font-bold text-lg rounded-xl hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-100"
            >
                {isLoading ? '분석 중...' : 'AI 진단받기'}
            </button>
          </form>

          {isLoading && <LoadingSpinner />}
          {error && <ErrorDisplay message={error} />}
          {analysis && (
            <div className="space-y-8">
              <AnalysisResult
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
                />
              )}
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
};

export default App;