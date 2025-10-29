import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PlantAnalysis } from '../types';

const getAi = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    plantName: {
      type: Type.STRING,
      description: "사진 속 식물의 가장 대표적인 한국어 이름.",
    },
    commonKoreanName: {
      type: Type.STRING,
      description: "plantName 외에 한국에서 흔히 불리는 다른 이름이나 별칭이 있다면 알려주세요. (예: '금전수'의 경우 '돈나무'). 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    scientificName: {
      type: Type.STRING,
      description: "식물의 학명 (예: Rosa 'Peace'). 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
     flowerLanguage: {
      type: Type.STRING,
      description: "만약 식물이 꽃이라면, 한국에서의 꽃말(상징적 의미). (예: '사랑의 고백'). 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    healthStatus: {
      type: Type.STRING,
      description: "식물의 전반적인 건강 상태 (예: 건강함, 주의 필요, 아픔).",
    },
    hydrationInfo: {
      type: Type.STRING,
      description: "사진 속 식물의 잎 처짐, 흙 상태 등을 분석하여 식물의 수분 상태를 간결하게 요약 (예: '수분 부족', '수분 적절', '과습 상태'). 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    sunlightInfo: {
      type: Type.STRING,
      description: "사진 속 빛의 양, 그림자, 식물의 웃자람 여부 등을 분석하여 식물의 일조량 상태를 간결하게 요약 (예: '일조량 충분', '일조량 부족', '빛이 너무 강함'). 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    hydrationInfoDetail: {
        type: Type.STRING,
        description: "식물의 수분 상태에 대한 상세한 분석. 왜 그렇게 판단했는지, 그리고 식물에 미치는 영향에 대해 설명합니다. (예: '흙 표면이 말라있고 잎이 살짝 아래로 처져있어 수분이 부족한 상태로 보입니다. 이 상태가 지속되면 잎이 마르거나 떨어질 수 있습니다.'). 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    sunlightInfoDetail: {
        type: Type.STRING,
        description: "식물의 일조량 상태에 대한 상세한 분석. 왜 그렇게 판단했는지, 그리고 식물에 미치는 영향에 대해 설명합니다. (예: '창가에서 들어오는 빛이 강하게 잎에 직접 닿고 있어 일부 잎이 탄 것처럼 보입니다. 직사광선은 잎을 손상시킬 수 있으니 반음지로 옮기는 것이 좋습니다.'). 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    soilPhInfo: {
        type: Type.STRING,
        description: "만약 isColorChangingFlower가 true라면, 현재 꽃 색깔을 바탕으로 추정되는 토양의 산도(pH) 상태를 설명. (예: '산성 토양 (푸른색 꽃)', '알칼리성 토양 (분홍색 꽃)'). 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    isColorChangingFlower: {
        type: Type.BOOLEAN,
        description: "사진 속 식물이 수국처럼 토양의 산도(pH)에 따라 꽃 색깔이 변하는 종류인 경우 true, 그렇지 않으면 false.",
    },
    diagnosis: {
      type: Type.STRING,
      description: "식물의 문제점에 대한 상세한 진단 내용. 질병, 해충, 영양 결핍 등을 포함.",
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "식물을 건강하게 관리하기 위한 구체적인 방법 목록 (물주기, 햇빛, 비료, 해충 방제 등).",
    },
    harvestInfoSummary: {
        type: Type.STRING,
        description: "수확 가능한 작물인 경우에만 harvestInfo의 내용을 '수확 가능', '2주 후 수확'과 같이 간결하게 요약합니다. 수확 불가능한 식물인 경우 반드시 null을 반환합니다.",
    },
    harvestInfo: {
        type: Type.STRING,
        description: "식물이 과일이나 채소 등 수확 가능한 작물인 경우에만, 예상 수확 시기 및 방법에 대한 상세 정보를 제공합니다. 수확 불가능한 식물인 경우 반드시 null을 반환합니다.",
    },
    repottingInfoSummary: {
        type: Type.STRING,
        description: "repottingInfo의 내용을 '분갈이 필요', '6개월 후 분갈이 권장'과 같이 간결하게 요약합니다. 분갈이가 필요하지 않은 경우 반드시 null을 반환합니다.",
    },
    repottingInfo: {
        type: Type.STRING,
        description: "사진 속 식물 크기와 화분 크기를 비교하여 분갈이가 필요한지 여부와 필요하다면 그 이유에 대한 정보. 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    pruningInfoSummary: {
        type: Type.STRING,
        description: "가지치기가 필요한 경우에만 '가지치기 필요'라고 텍스트를 제공합니다. 필요하지 않은 경우 반드시 null을 반환합니다.",
    },
    pruningInfo: {
        type: Type.STRING,
        description: "사진 속 식물의 형태를 분석하여 가지치기가 필요한지 여부와 필요하다면 그 이유 및 방법에 대한 정보. 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    pestDiseaseInfoSummary: {
      type: Type.STRING,
      description: "병충해가 의심되는 경우에만 '병충해 의심' 또는 '흰가루병 초기'와 같이 간결하게 요약합니다. 이상이 없는 경우 반드시 null을 반환합니다.",
    },
    pestDiseaseInfo: {
        type: Type.STRING,
        description: "사진 속 식물에서 관찰되는 병충해(진딧물, 응애 등)나 질병(흰가루병, 무름병 등)의 징후에 대한 상세 분석 정보. 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    colorChangeGuide: {
        type: Type.OBJECT,
        description: "만약 isColorChangingFlower가 true라면, 꽃 색깔을 바꾸기 위한 구체적인 가이드. 사진 속 화분 크기를 추정하고, 파란색으로 바꾸는 방법과 분홍색으로 바꾸는 방법을 각각 설명. (예: { toBlue: '지름 20cm 화분 기준, 황산알루미늄 1/2 티스푼을 물에 타서 주세요.', toPink: '지름 20cm 화분 기준, 정원용 석회 1/2 티스푼을 흙에 섞어주세요.' }). 해당사항 없으면 null을 반환.",
        properties: {
            toBlue: { type: Type.STRING },
            toPink: { type: Type.STRING }
        }
    },
    potentialFlowerColors: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "만약 식물이 꽃이 피는 종류인데 사진에 꽃이 없는 경우, 필 수 있는 잠재적인 꽃 색깔을 3가지 제안 (예: ['분홍색', '흰색', '노란색']). 해당사항 없으면 빈 배열이나 null을 반환.",
    },
  },
  required: ["plantName", "healthStatus", "isColorChangingFlower", "diagnosis", "recommendations"],
};

export const getPlantAnalysis = async (
  base64Image: string,
  mimeType: string,
  question: string
): Promise<PlantAnalysis> => {
  try {
    const ai = getAi();

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };

    const textPart = {
      text: `이 식물의 건강 상태를 분석하고 관리 방법을 알려주세요. 사용자의 추가 질문: "${question}"`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: "당신은 식물학자이자 정원 가꾸기 전문가입니다. 제공된 식물 사진과 사용자의 질문을 분석하여 JSON 형식에 맞춰 응답해주세요. 식물 이름은 가장 대표적인 한국어 이름으로, 학명과 함께 알려주세요. 만약 한국에서 흔히 불리는 다른 이름(별칭)이 있다면 그것도 알려주세요. 만약 식물이 꽃이라면, 꽃말도 함께 알려주세요. 그리고 다음 사항들을 상세히 진단해주세요: 1. 수분 상태: 잎의 처짐이나 흙의 상태 같은 시각적 단서로 물 부족, 적절, 과습 상태를 판단하여 hydrationInfo 필드에 간결한 요약을 제공하고, hydrationInfoDetail 필드에는 왜 그렇게 판단했는지와 식물에 미치는 영향 등 상세한 설명을 제공해주세요. 2. 일조량 상태: 사진의 빛, 그림자, 식물의 웃자람 여부 등을 분석하여 일조량이 부족한지, 충분한지, 또는 과다한지 판단하여 sunlightInfo 필드에 간결한 요약을 제공하고, sunlightInfoDetail 필드에는 왜 그렇게 판단했는지와 식물에 미치는 영향 등 상세한 설명을 제공해주세요. 3. 분갈이 필요성: 사진에 보이는 식물과 화분 크기를 비교하여 분갈이가 필요한지 판단합니다. 특히, 뿌리가 화분 위 흙을 뚫고 나오거나 화분 아래 배수구멍으로 빠져나오는지를 중요한 판단 기준으로 삼아주세요. 판단 결과를 바탕으로 repottingInfoSummary 필드에 '분갈이 필요', '6개월 후 분갈이 권장'처럼 간결한 요약을 제공해주세요. 분갈이가 필요하지 않은 경우, repottingInfo와 repottingInfoSummary 필드에 null을 반환하세요. 4. 수확 정보: 식물이 과일, 채소 등 수확 가능한 작물인 경우에만 예상 수확 시기와 방법을 설명하고 그 내용을 '수확 가능' 또는 '2주 후 수확'과 같이 간결하게 요약하여 harvestInfoSummary 필드에 제공해주세요. 수확할 수 없는 식물이라면 harvestInfo와 harvestInfoSummary 필드 모두 반드시 null을 반환해야 합니다. '해당 없음'과 같은 텍스트를 반환하지 마세요. 5. 가지치기 필요성: 식물의 형태를 보고 가지치기가 필요한지 여부와 방법을 설명. 만약 가지치기가 필요하다고 판단되면 pruningInfoSummary 필드에 '가지치기 필요'라는 텍스트를 제공해주세요. 필요하지 않은 경우, pruningInfo와 pruningInfoSummary 필드에 null을 반환하세요. 6. 병충해 진단: 잎의 반점, 벌레, 거미줄 등 병충해의 시각적 단서를 찾아 분석하세요. 만약 병충해가 의심된다면 pestDiseaseInfoSummary 필드에 '병충해 의심'과 같이 간결한 요약을 제공하고, pestDiseaseInfo 필드에 상세 정보를 제공해주세요. 이상이 없으면 두 필드 모두 null을 반환하세요. 7. 색 변화 가능성: 사진 속 식물이 수국처럼 토양 산도에 따라 꽃 색이 변하는 식물인지 판단해주세요. 8. 토양 산도 추정: 만약 '색 변화 가능성'이 참이라면, 현재 보이는 꽃의 색을 근거로 토양의 산성도를 추정해주세요 (예: 파란색이면 산성, 분홍색이면 알칼리성). 9. 토양 산도 조절 가이드: '색 변화 가능성'이 참이라면, 사진 속 화분 크기를 추정하고 그에 맞춰 흙의 산도를 조절하는 방법을 구체적으로 알려주세요. 파란색 꽃을 위한 방법(예: 황산알루미늄 양)과 분홍색 꽃을 위한 방법(예: 정원용 석회 양)을 각각 제공해주세요. 10. 잠재적 꽃 색상 예측: 식물이 꽃 피는 종류인데 현재 사진에 꽃이 없다면, 앞으로 필 수 있는 대표적인 꽃 색상을 최대 3가지 제안해주세요.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const analysis: PlantAnalysis = JSON.parse(jsonText);
    return analysis;

  } catch (error) {
    console.error("Gemini API 호출 중 오류 발생:", error);
    if (error instanceof Error) {
        throw new Error(`AI로부터 응답을 받는 데 실패했습니다: ${error.message}`);
    }
    throw new Error("AI로부터 응답을 받는 데 실패했습니다. 알 수 없는 오류가 발생했습니다.");
  }
};

export const changeFlowerColor = async (
  base64Image: string,
  mimeType: string,
  targetColor: string
): Promise<string> => {
  try {
    const ai = getAi();
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };
    const textPart = {
      text: `이 이미지 속 꽃의 색깔을 자연스러운 ${targetColor}으로 바꿔주세요. 꽃 이외의 다른 부분(잎, 배경 등)은 절대 변경하지 마세요.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("AI가 이미지를 생성하지 못했습니다.");

  } catch (error) {
    console.error("Gemini 이미지 편집 중 오류 발생:", error);
    if (error instanceof Error) {
        throw new Error(`AI 이미지 편집에 실패했습니다: ${error.message}`);
    }
    throw new Error("AI 이미지 편집에 실패했습니다. 알 수 없는 오류가 발생했습니다.");
  }
};

export const generateBloomingImage = async (
  base64Image: string,
  mimeType: string,
  plantName: string,
  targetColor: string
): Promise<string> => {
  try {
    const ai = getAi();
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };
    const textPart = {
      text: `이 사진은 꽃이 피지 않은 '${plantName}' 식물입니다. 사진 속 식물의 현재 잎 상태와 크기를 고려하여, 이 식물이 자연스럽게 성장한 후 '${targetColor}' 꽃을 피웠을 때의 모습을 사실적으로 생성해주세요. 꽃의 양과 크기는 식물의 현재 상태에 어울리도록 조절하여 과하게 보이지 않게 해주세요. 기존 잎, 줄기, 화분, 배경은 최대한 유지하되, 꽃과 조화를 이루는 자연스러운 성장 표현은 괜찮습니다.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("AI가 이미지를 생성하지 못했습니다.");

  } catch (error) {
    console.error("Gemini 이미지 생성 중 오류 발생:", error);
    if (error instanceof Error) {
        throw new Error(`AI 이미지 생성에 실패했습니다: ${error.message}`);
    }
    throw new Error("AI 이미지 생성에 실패했습니다. 알 수 없는 오류가 발생했습니다.");
  }
};