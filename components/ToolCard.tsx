import React, { useState } from 'react';
import { PlantAnalysis } from '../types';

interface AnalysisResultProps {
  analysis: PlantAnalysis;
  onColorChange?: (color: string) => void;
  editedImage?: string | null;
  isEditing?: boolean;
  editError?: string | null;
}

const HealthStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusStyles: { [key: string]: string } = {
    '건강함': 'bg-green-500/20 text-green-300 border border-green-600',
    '주의 필요': 'bg-yellow-500/20 text-yellow-300 border border-yellow-600',
    '아픔': 'bg-red-500/20 text-red-300 border border-red-600',
  };

  const style = statusStyles[status] || 'bg-slate-600 text-slate-200';

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${style}`}>
      {status}
    </span>
  );
};

const HydrationBadge: React.FC<{ info: string }> = ({ info }) => {
  let colorClass = 'bg-blue-500/20 text-blue-300 border-blue-600'; // Default for '적절함'
  if (info.includes('부족')) {
    colorClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-600';
  } else if (info.includes('과습')) {
    colorClass = 'bg-red-500/20 text-red-300 border-red-600';
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full border ${colorClass}`}>
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 1a5.5 5.5 0 00-5.465 6.435L10 18l5.465-10.565A5.5 5.5 0 0010 1zm0 3.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
      </svg>
      <span>{info}</span>
    </div>
  );
};

const SunlightBadge: React.FC<{ info: string }> = ({ info }) => {
  let colorClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-600'; // Default for '충분'
  if (info.includes('부족')) {
    colorClass = 'bg-slate-500/20 text-slate-300 border-slate-600';
  } else if (info.includes('과다') || info.includes('강함')) {
    colorClass = 'bg-orange-500/20 text-orange-300 border-orange-600';
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full border ${colorClass}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 4.343a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm-9.192 9.192a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM4.343 4.343a.75.75 0 011.06 0l1.06 1.061a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm9.192 9.192a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zM15 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0115 10z" />
      </svg>
      <span>{info}</span>
    </div>
  );
};

const HarvestBadge: React.FC = () => {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full border bg-purple-500/20 text-purple-300 border-purple-600`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.5a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11zM10 12a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V12.75A.75.75 0 0110 12z" clipRule="evenodd" />
      </svg>
      <span>수확 가능</span>
    </div>
  );
};

const SoilPhBadge: React.FC<{ info: string }> = ({ info }) => {
  const colorClass = 'bg-amber-800/30 text-amber-300 border-amber-700';
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full border ${colorClass}`}>
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
         <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l.75 4.5a2.25 2.25 0 002.246 2.003h12.008a2.25 2.25 0 002.246-2.003l.75-4.5M3 13.5V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v6" />
         <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h13.5" />
       </svg>
       <span>{info}</span>
    </div>
  );
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, onColorChange, editedImage, isEditing, editError }) => {
  const [visibleGuide, setVisibleGuide] = useState<'blue' | 'pink' | null>(null);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-green-300">{analysis.plantName}</h2>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
           <HealthStatusBadge status={analysis.healthStatus} />
           {analysis.hydrationInfo && <HydrationBadge info={analysis.hydrationInfo} />}
           {analysis.sunlightInfo && <SunlightBadge info={analysis.sunlightInfo} />}
           {analysis.soilPhInfo && <SoilPhBadge info={analysis.soilPhInfo} />}
           {analysis.harvestInfo && <HarvestBadge />}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">AI 진단 결과</h3>
        <p className="text-slate-300 whitespace-pre-wrap">{analysis.diagnosis}</p>
      </div>

      {analysis.harvestInfo && (
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-green-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 12.75h.008v.008H12v-.008Z" />
            </svg>
            수확 정보
          </h3>
          <p className="text-slate-300 whitespace-pre-wrap">{analysis.harvestInfo}</p>
        </div>
      )}

      {analysis.repottingInfo && (
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-green-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            분갈이 필요성
          </h3>
          <p className="text-slate-300 whitespace-pre-wrap">{analysis.repottingInfo}</p>
        </div>
      )}

      {analysis.pruningInfo && (
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-green-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.622-3.385m-5.043-.025a15.998 15.998 0 01-3.388-1.621m7.447 1.027a3 3 0 00-5.78-1.128 2.25 2.25 0 01-2.4-2.245 4.5 4.5 0 008.4 2.245c0 .399-.078.78-.22 1.128zm0 0a15.998 15.998 0 00-3.388 1.622m5.043.025a15.998 15.998 0 01-1.622 3.385m-5.043-.025a15.998 15.998 0 00-1.622 3.385m-3.388-1.622a15.998 15.998 0 001.622 3.385" />
            </svg>
            가지치기 필요성
          </h3>
          <p className="text-slate-300 whitespace-pre-wrap">{analysis.pruningInfo}</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">관리 가이드</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-300">
          {analysis.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>

      {analysis.isColorChangingFlower && onColorChange && (
        <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-green-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402a3.75 3.75 0 0 0-.625-6.25a3.75 3.75 0 0 0-6.25-.625l-6.402 6.401a3.75 3.75 0 0 0 0 5.304Zm1.13-1.13a2.25 2.25 0 0 1 0-3.182l6.402-6.402a2.25 2.25 0 0 1 3.182 0l.001.001a2.25 2.25 0 0 1 0 3.182L8.82 18.82a2.25 2.25 0 0 1-3.182 0l-.001-.001Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 5.25-1.5-1.5" />
                </svg>
                꽃 색깔 미리보기 &amp; 가이드
            </h3>
            <p className="text-slate-400 mb-4 text-sm">
                흙의 산도(pH)를 조절하면 다른 색의 꽃을 볼 수 있어요! 원하는 색을 선택해 미리 확인하고, 관리법도 알아보세요.
            </p>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => { onColorChange('파란색'); setVisibleGuide('blue'); }}
                    disabled={isEditing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-slate-600 transition-colors"
                >
                    파란색으로
                </button>
                <button
                    onClick={() => { onColorChange('분홍색'); setVisibleGuide('pink'); }}
                    disabled={isEditing}
                    className="flex-1 px-4 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 disabled:bg-slate-600 transition-colors"
                >
                    분홍색으로
                </button>
            </div>
            
            {visibleGuide && analysis.colorChangeGuide && (
                <div className="mb-4 p-4 bg-slate-900/70 rounded-lg border border-slate-600 animate-fade-in">
                    <h4 className="font-semibold text-green-300 mb-2">
                        {visibleGuide === 'blue' ? '💙 파란색 꽃 만들기 가이드' : '💗 분홍색 꽃 만들기 가이드'}
                    </h4>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">
                        {visibleGuide === 'blue' ? analysis.colorChangeGuide.toBlue : analysis.colorChangeGuide.toPink}
                    </p>
                    <p className="text-xs text-slate-500 mt-3">
                        *주의: AI의 추정치이므로, 식물의 상태를 관찰하며 양을 조절해주세요.
                    </p>
                </div>
            )}

            <div className="w-full min-h-[12rem] flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700 p-2">
                {isEditing && (
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        <p className="text-slate-400 text-sm">AI가 꽃 색을 바꾸고 있어요...</p>
                    </div>
                )}
                {editError && (
                    <div className="text-red-400 p-4 text-center">{editError}</div>
                )}
                {editedImage && !isEditing && !editError && (
                    <img src={`data:image/jpeg;base64,${editedImage}`} alt="Edited flower" className="max-h-full max-w-full rounded-md object-contain" />
                )}
                {!isEditing && !editError && !editedImage && (
                     <p className="text-slate-500">색상을 선택하면 결과가 여기에 표시됩니다.</p>
                )}
            </div>
        </div>
    )}
    </div>
  );
};

export default AnalysisResult;