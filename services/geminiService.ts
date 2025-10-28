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
      description: "사진 속 식물의 이름.",
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
    harvestInfo: {
        type: Type.STRING,
        description: "식물이 과일이나 채소일 경우, 예상 수확 시기 및 방법에 대한 정보. 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    repottingInfo: {
        type: Type.STRING,
        description: "사진 속 식물 크기와 화분 크기를 비교하여 분갈이가 필요한지 여부와 필요하다면 그 이유에 대한 정보. 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    pruningInfo: {
        type: Type.STRING,
        description: "사진 속 식물의 형태를 분석하여 가지치기가 필요한지 여부와 필요하다면 그 이유 및 방법에 대한 정보. 해당사항 없으면 빈 문자열이나 null을 반환.",
    },
    colorChangeGuide: {
        type: Type.OBJECT,
        description: "만약 isColorChangingFlower가 true라면, 꽃 색깔을 바꾸기 위한 구체적인 가이드. 사진 속 화분 크기를 추정하고, 파란색으로 바꾸는 방법과 분홍색으로 바꾸는 방법을 각각 설명. (예: { toBlue: '지름 20cm 화분 기준, 황산알루미늄 1/2 티스푼을 물에 타서 주세요.', toPink: '지름 20cm 화분 기준, 정원용 석회 1/2 티스푼을 흙에 섞어주세요.' }). 해당사항 없으면 null을 반환.",
        properties: {
            toBlue: { type: Type.STRING },
            toPink: { type: Type.STRING }
        }
    }
  },
  required: ["plantName", "healthStatus", "hydrationInfo", "sunlightInfo", "soilPhInfo", "isColorChangingFlower", "diagnosis", "recommendations", "harvestInfo", "repottingInfo", "pruningInfo", "colorChangeGuide"],
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
        systemInstruction: "당신은 식물학자이자 정원 가꾸기 전문가입니다. 제공된 식물 사진과 사용자의 질문을 분석하여 식물의 종류, 건강 상태, 잠재적인 문제점, 그리고 구체적인 관리 방법을 상세히 진단해 주세요. 특히 다음 사항들을 분석하고 JSON 형식에 맞춰 응답해주세요: 1. 수분 상태: 잎의 처짐이나 흙의 상태 같은 시각적 단서로 물 부족, 적절, 과습 상태를 판단. 2. 일조량 상태: 사진의 빛, 그림자, 식물의 웃자람 여부 등을 분석하여 일조량이 부족한지, 충분한지, 또는 과다한지 판단. 3. 분갈이 필요성: 사진에 보이는 식물과 화분 크기를 비교하여 분갈이가 필요한지 판단. 4. 수확 정보: 수확 가능한 작물이라면 예상 수확 시기와 방법을 설명. 5. 가지치기 필요성: 식물의 형태를 보고 가지치기가 필요한지 여부와 방법을 설명. 6. 색 변화 가능성: 사진 속 식물이 수국처럼 토양 산도에 따라 꽃 색이 변하는 식물인지 판단해주세요. 7. 토양 산도 추정: 만약 '색 변화 가능성'이 참이라면, 현재 보이는 꽃의 색을 근거로 토양의 산성도를 추정해주세요 (예: 파란색이면 산성, 분홍색이면 알칼리성). 8. 토양 산도 조절 가이드: '색 변화 가능성'이 참이라면, 사진 속 화분 크기를 추정하고 그에 맞춰 흙의 산도를 조절하는 방법을 구체적으로 알려주세요. 파란색 꽃을 위한 방법(예: 황산알루미늄 양)과 분홍색 꽃을 위한 방법(예: 정원용 석회 양)을 각각 제공해주세요.",
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
