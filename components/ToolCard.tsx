import React, { useState } from 'react';
import { PlantAnalysis } from '../types';

interface AnalysisResultProps {
  analysis: PlantAnalysis;
  imageSrc?: string;
  onColorChange?: (color: string) => void;
  editedImage?: string | null;
  isEditing?: boolean;
  editError?: string | null;
  onGenerateBloom?: (color: string) => void;
  bloomingImages?: Record<string, string>;
  isGeneratingBloom?: string | null;
  bloomError?: Record<string, string>;
}

const downloadImage = (base64Image: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = `data:image/jpeg;base64,${base64Image}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const StatusItem: React.FC<{ icon: React.ReactNode; label: string; value: string; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full bg-zinc-800/60 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-zinc-400">{label}</p>
            <p className={`text-sm font-semibold ${colorClass}`}>{value}</p>
        </div>
    </div>
);

const InfoBadge: React.FC<{ icon: React.ReactNode; text: string; color: string }> = ({ icon, text, color }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${color}`}>
       {icon}
       <span>{text}</span>
    </div>
  );
};


const AnalysisResult: React.FC<AnalysisResultProps> = ({ 
    analysis, 
    imageSrc,
    onColorChange, 
    editedImage, 
    isEditing, 
    editError,
    onGenerateBloom,
    bloomingImages,
    isGeneratingBloom,
    bloomError 
}) => {
  const [visibleGuide, setVisibleGuide] = useState<'blue' | 'pink' | null>(null);
  const showBloomingFeature = analysis.potentialFlowerColors && analysis.potentialFlowerColors.length > 0;

  const healthStatusStyles: { [key: string]: string } = {
    '건강함': 'text-emerald-400',
    '주의 필요': 'text-yellow-400',
    '아픔': 'text-red-400',
  };
  const healthStatusColor = healthStatusStyles[analysis.healthStatus] || 'text-zinc-300';

  const getHydrationTextColor = (info: string | undefined | null) => {
    if (!info) return 'text-zinc-300';
    if (info.includes('부족')) return 'text-yellow-400';
    if (info.includes('과습')) return 'text-red-400';
    return 'text-blue-400';
  };

  const getSunlightTextColor = (info: string | undefined | null) => {
    if (!info) return 'text-zinc-300';
    if (info.includes('부족')) return 'text-zinc-400';
    if (info.includes('과다') || info.includes('강함')) return 'text-orange-400';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/20 animate-fade-in space-y-6">
      {imageSrc && (
          <>
              <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2 w-full">
                      <img src={imageSrc} alt={analysis.plantName} className="rounded-xl object-cover w-full aspect-square" />
                  </div>
                  <div className="md:w-1/2 w-full flex flex-col justify-center space-y-4">
                      <h3 className="text-lg font-semibold text-zinc-100 border-b border-zinc-700 pb-2 mb-2">주요 상태 요약</h3>
                      
                      <StatusItem 
                          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 2a.75.75 0 01.75.75v.518a4.5 4.5 0 013.475 2.065l.348.519a.75.75 0 01-.368 1.033l-1.35.676a.75.75 0 01-.812-.045l-.473-.354a2.992 2.992 0 00-3.216 0l-.473.354a.75.75 0 01-.812.045l-1.35-.676a.75.75 0 01-.368-1.033l.348-.52A4.5 4.5 0 019.25 3.268V2.75A.75.75 0 0110 2zM5.003 7.23a.75.75 0 01.623.869l-.348 1.044a.75.75 0 01-1.033.368l-.676-1.35a.75.75 0 01.368-1.033l1.044-.348a.75.75 0 01.869.623zM14.997 7.23a.75.75 0 01.869-.623l1.044.348a.75.75 0 01.368 1.033l-.676 1.35a.75.75 0 01-1.033-.368l-.348-1.044a.75.75 0 01.623-.869zM10 12.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5a.75.75 0 01.75-.75z" /></svg>}
                          label="건강 상태"
                          value={analysis.healthStatus} 
                          colorClass={healthStatusColor}
                      />

                      {analysis.hydrationInfo && (
                           <StatusItem 
                              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 1a5.5 5.5 0 00-5.465 6.435L10 18l5.465-10.565A5.5 5.5 0 0010 1zm0 3.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" /></svg>}
                              label="수분 상태"
                              value={analysis.hydrationInfo} 
                              colorClass={getHydrationTextColor(analysis.hydrationInfo)}
                          />
                      )}

                      {analysis.sunlightInfo && (
                          <StatusItem 
                              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 4.343a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm-9.192 9.192a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM4.343 4.343a.75.75 0 011.06 0l1.06 1.061a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm9.192 9.192a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zM15 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0115 10z" /></svg>}
                              label="일조량"
                              value={analysis.sunlightInfo} 
                              colorClass={getSunlightTextColor(analysis.sunlightInfo)}
                          />
                      )}
                      
                      {analysis.harvestInfoSummary && (
                        <StatusItem 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.5a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11zM10 12a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V12.75A.75.75 0 0110 12z" clipRule="evenodd" /></svg>}
                            label="수확 정보"
                            value={analysis.harvestInfoSummary} 
                            colorClass="text-purple-400"
                        />
                      )}

                      {analysis.repottingInfoSummary && (
                        <StatusItem 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>}
                            label="분갈이 정보"
                            value={analysis.repottingInfoSummary} 
                            colorClass="text-cyan-400"
                        />
                      )}

                      {analysis.pruningInfoSummary && (
                        <StatusItem 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.622-3.385m-5.043-.025a15.998 15.998 0 01-3.388-1.621m7.447 1.027a3 3 0 00-5.78-1.128 2.25 2.25 0 01-2.4-2.245 4.5 4.5 0 008.4 2.245c0 .399-.078.78-.22 1.128zm0 0a15.998 15.998 0 00-3.388 1.622m5.043.025a15.998 15.998 0 01-1.622 3.385m-5.043-.025a15.998 15.998 0 00-1.622 3.385m-3.388-1.622a15.998 15.998 0 001.622 3.385" /></svg>}
                            label="가지치기 정보"
                            value={analysis.pruningInfoSummary} 
                            colorClass="text-orange-400"
                        />
                      )}
                  </div>
              </div>
              <div className="border-t border-zinc-800"></div>
          </>
      )}

      <header className="space-y-4">
        <div>
          <p className="text-emerald-400 font-semibold text-sm mb-1">AI가 분석한 식물 종류</p>
          <h2 className="text-3xl font-bold text-white">
            {analysis.plantName}
            {analysis.commonKoreanName && <span className="text-2xl font-medium text-zinc-400 ml-2">({analysis.commonKoreanName})</span>}
          </h2>
          {analysis.scientificName && (
            <p className="text-zinc-500 text-sm font-mono tracking-tight">{analysis.scientificName}</p>
          )}
        </div>

        {analysis.flowerLanguage && (
            <div className="flex items-start gap-3 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5">
                <path d="M11.423 2.306a.75.75 0 00-1.012.287L5.533 12.25H2.75a.75.75 0 000 1.5h3.262a.75.75 0 00.723-.513l.255-1.023c.04-.158.197-.264.357-.264h2.242a.75.75 0 000-1.5H7.723l4.768-8.583a.75.75 0 00-.287-1.012zM12.25 10a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM14.25 8a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM16.25 6a.75.75 0 000 1.5h.01a.75.75 0 000-1.5h-.01zM17 12.25a.75.75 0 011.5 0v.01a.75.75 0 01-1.5 0v-.01zM15 14.25a.75.75 0 011.5 0v.01a.75.75 0 01-1.5 0v-.01zM13 16.25a.75.75 0 011.5 0v.01a.75.75 0 01-1.5 0v-.01z" />
              </svg>
              <div>
                <h4 className="font-semibold text-zinc-300">꽃말</h4>
                <p className="text-zinc-400 text-sm">{analysis.flowerLanguage}</p>
              </div>
            </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
           {analysis.soilPhInfo && <InfoBadge icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l.75 4.5a2.25 2.25 0 002.246 2.003h12.008a2.25 2.25 0 002.246-2.003l.75-4.5M3 13.5V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v6" /><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h13.5" /></svg>} text={analysis.soilPhInfo} color="bg-amber-500/10 text-amber-400" />}
        </div>
      </header>
      
      <div className="border-t border-zinc-800 pt-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-3">AI 진단 결과</h3>
        <p className="text-zinc-300 whitespace-pre-wrap">{analysis.diagnosis}</p>
      </div>

      {[
        { info: analysis.harvestInfo, title: '수확 정보', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 text-emerald-400"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.5a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11zM10 12a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V12.75A.75.75 0 0110 12z" clipRule="evenodd" /></svg> },
        { info: analysis.repottingInfo, title: '분갈이 필요성', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-emerald-400"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg> },
        { info: analysis.pruningInfo, title: '가지치기 필요성', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-emerald-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.622-3.385m-5.043-.025a15.998 15.998 0 01-3.388-1.621m7.447 1.027a3 3 0 00-5.78-1.128 2.25 2.25 0 01-2.4-2.245 4.5 4.5 0 008.4 2.245c0 .399-.078.78-.22 1.128zm0 0a15.998 15.998 0 00-3.388 1.622m5.043.025a15.998 15.998 0 01-1.622 3.385m-5.043-.025a15.998 15.998 0 00-1.622 3.385m-3.388-1.622a15.998 15.998 0 001.622 3.385" /></svg> },
      ].map((section) => section.info && (
        <div key={section.title} className="border-t border-zinc-800 pt-6">
          <h3 className="text-lg font-semibold text-zinc-100 mb-3 flex items-center">{section.icon}{section.title}</h3>
          <p className="text-zinc-300 whitespace-pre-wrap">{section.info}</p>
        </div>
      ))}

      <div className="border-t border-zinc-800 pt-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-3">관리 가이드</h3>
        <ul className="space-y-3 text-zinc-300">
          {analysis.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {showBloomingFeature && onGenerateBloom && bloomingImages && bloomError && (
        <div className="border-t border-zinc-800 pt-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-emerald-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
                '{analysis.plantName}' 꽃 피었을 때 모습 미리보기
            </h3>
            <p className="text-zinc-400 mb-4 text-sm">
                AI가 이 식물이 만개했을 때의 모습을 예측해봤어요. 보고 싶은 색상을 선택해보세요.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {analysis.potentialFlowerColors?.map(color => (
                    <div key={color} className="w-full flex flex-col bg-zinc-800 rounded-xl border border-zinc-700 p-3 space-y-3">
                        <div className="flex-grow min-h-[12rem] flex items-center justify-center rounded-lg bg-black/20">
                            {bloomingImages[color] && !bloomError?.[color] ? (
                                <img src={`data:image/jpeg;base64,${bloomingImages[color]}`} alt={`${color} blooming flower`} className="w-full h-full rounded-lg object-contain" />
                            ) : isGeneratingBloom === color ? (
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
                                    <p className="text-zinc-400 text-sm mt-2">'{color}' 꽃을 피우고 있어요...</p>
                                </div>
                            ) : bloomError?.[color] ? (
                                <div className="text-red-400 text-sm p-2 text-center">{bloomError[color]}</div>
                            ) : (
                                <div className="text-zinc-500 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto mb-2 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                                    <p>버튼을 눌러 미리보기</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onGenerateBloom(color)}
                                disabled={isGeneratingBloom === color || !!bloomingImages[color]}
                                className="flex-grow px-3 py-2 bg-zinc-700 text-white font-semibold rounded-lg hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                               {bloomingImages[color] ? '생성 완료' : `'${color}' 색으로 보기`}
                            </button>
                            {bloomingImages[color] && (
                                <button
                                    onClick={() => downloadImage(bloomingImages[color], `${analysis.plantName}-${color}.jpg`)}
                                    className="p-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors text-sm shrink-0"
                                    aria-label={`${color} 이미지 저장`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                                        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5a1.25 1.25 0 01-1.25 1.25H4.75A1.25 1.25 0 013.5 15.25v-2.5z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )}

      {analysis.isColorChangingFlower && onColorChange && (
        <div className="border-t border-zinc-800 pt-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-emerald-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402a3.75 3.75 0 0 0-.625-6.25a3.75 3.75 0 0 0-6.25-.625l-6.402 6.401a3.75 3.75 0 0 0 0 5.304Zm1.13-1.13a2.25 2.25 0 0 1 0-3.182l6.402-6.402a2.25 2.25 0 0 1 3.182 0l.001.001a2.25 2.25 0 0 1 0 3.182L8.82 18.82a2.25 2.25 0 0 1-3.182 0l-.001-.001Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 5.25-1.5-1.5" />
                </svg>
                꽃 색깔 미리보기 &amp; 가이드
            </h3>
            <p className="text-zinc-400 mb-4 text-sm">
                흙의 산도(pH)를 조절하면 다른 색의 꽃을 볼 수 있어요! 원하는 색을 선택해 미리 확인하고, 관리법도 알아보세요.
            </p>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => { onColorChange('파란색'); setVisibleGuide('blue'); }}
                    disabled={isEditing}
                    className="flex-1 px-4 py-2 bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    파란색으로
                </button>
                <button
                    onClick={() => { onColorChange('분홍색'); setVisibleGuide('pink'); }}
                    disabled={isEditing}
                    className="flex-1 px-4 py-2 bg-pink-500/10 text-pink-300 border border-pink-500/20 hover:bg-pink-500/20 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    분홍색으로
                </button>
            </div>
            
            {visibleGuide && analysis.colorChangeGuide && (
                <div className="mb-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700 animate-fade-in">
                    <h4 className="font-semibold text-emerald-400 mb-2">
                        {visibleGuide === 'blue' ? '💙 파란색 꽃 만들기 가이드' : '💗 분홍색 꽃 만들기 가이드'}
                    </h4>
                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">
                        {visibleGuide === 'blue' ? analysis.colorChangeGuide.toBlue : analysis.colorChangeGuide.toPink}
                    </p>
                    <p className="text-xs text-zinc-500 mt-3">
                        *주의: AI의 추정치이므로, 식물의 상태를 관찰하며 양을 조절해주세요.
                    </p>
                </div>
            )}

            <div className="w-full min-h-[12rem] flex items-center justify-center bg-zinc-800 rounded-xl border border-zinc-700 p-2">
                {isEditing && (
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                        <p className="text-zinc-400 text-sm">AI가 꽃 색을 바꾸고 있어요...</p>
                    </div>
                )}
                {editError && (
                    <div className="text-red-400 p-4 text-center">{editError}</div>
                )}
                {editedImage && !isEditing && !editError && (
                    <img src={`data:image/jpeg;base64,${editedImage}`} alt="Edited flower" className="max-h-full max-w-full rounded-md object-contain" />
                )}
                {!isEditing && !editError && !editedImage && (
                     <p className="text-zinc-500">색상을 선택하면 결과가 여기에 표시됩니다.</p>
                )}
            </div>
        </div>
    )}
    </div>
  );
};

export default AnalysisResult;