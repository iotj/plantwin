import { Plant } from '../types';

const PLANTS_KEY = 'plantDiaryApp-plants';

export const getPlants = (): Plant[] => {
    try {
        const data = localStorage.getItem(PLANTS_KEY);
        // localStorage에 데이터가 없을 경우를 대비해 기본값으로 빈 배열을 반환합니다.
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("localStorage에서 식물 데이터를 불러오는 데 실패했습니다:", error);
        return [];
    }
};

export const savePlants = (plants: Plant[]): void => {
    try {
        localStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
    } catch (error) {
        console.error("localStorage에 식물 데이터를 저장하는 데 실패했습니다:", error);
    }
};
