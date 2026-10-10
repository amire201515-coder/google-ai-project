import { MedicalCenter } from '../types/center';
import {
  getAllCentersFromStorage,
  saveAllCentersToStorage,
  appendCentersToStorage,
  resetCentersToBaseline,
  getLastUpdatedTimestamp
} from './db';

export async function getStoredCenters(): Promise<MedicalCenter[]> {
  return getAllCentersFromStorage();
}

export async function saveStoredCenters(centers: MedicalCenter[]): Promise<boolean> {
  return saveAllCentersToStorage(centers);
}

export async function appendStoredCenters(newCenters: MedicalCenter[]): Promise<MedicalCenter[]> {
  return appendCentersToStorage(newCenters);
}

export async function resetToDefaults(): Promise<MedicalCenter[]> {
  return resetCentersToBaseline();
}

export async function getLastUpdatedDate(): Promise<string | null> {
  return getLastUpdatedTimestamp();
}

export function getStorageStats(centers: MedicalCenter[]) {
  const total = centers.length;
  const onlineCount = centers.filter(c => c.onlineLetter).length;
  const provinces = new Set(centers.map(c => c.province).filter(Boolean)).size;
  const cities = new Set(centers.map(c => c.city).filter(Boolean)).size;
  const centerTypes = new Set(centers.map(c => c.centerType).filter(Boolean)).size;

  return {
    total,
    onlineCount,
    provinces,
    cities,
    centerTypes
  };
}
