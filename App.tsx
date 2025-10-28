import React, { useState, useCallback, useRef } from 'react';
import { getPlantAnalysis, changeFlowerColor } from './services/geminiService';
import { PlantAnalysis } from './types';
import Header from './components/Header';
import AnalysisResult from './components/ToolCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';

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

    try {
      const { base64, mimeType } = await fileToGenerativePart(imageFile);
      const result = await getPlantAnalysis(base64, mimeType, question);
      setAnalysis(result);
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

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Header />

        <main>
          <form onSubmit={handleSubmit} className="mb-8 space-y-6">
            <div>
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
                className="w-full h-48 flex flex-col items-center justify-center p-4 bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700 hover:border-green-500 transition-colors"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Plant preview" className="max-h-full max-w-full rounded-md object-contain" />
                ) : (
                  <div className="text-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <p>사진을 업로드하려면 클릭하세요</p>
                    <p className="text-sm">(.jpg, .png, .webp)</p>
                  </div>
                )}
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="궁금한 점을 물어보세요 (선택 사항)"
                className="w-full p-4 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
            </div>

            <button
                type="submit"
                disabled={isLoading || !imageFile}
                className="w-full px-6 py-3 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
                AI 진단받기
            </button>
          </form>

          {isLoading && <LoadingSpinner />}
          {error && <ErrorDisplay message={error} />}
          {analysis && (
            <AnalysisResult
              analysis={analysis}
              onColorChange={handleColorChange}
              editedImage={editedImage}
              isEditing={isEditing}
              editError={editError}
            />
          )}
          
        </main>
      </div>
    </div>
  );
};

export default App;
