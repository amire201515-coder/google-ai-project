import { MedicalCenter } from '../types/center';
import rawCenters from './centers1958.json';

// داده‌های اولیه و دائمی برنامه شامل تمام ۱۹۵۸ مرکز مرجع
export const INITIAL_CENTERS: MedicalCenter[] = rawCenters as MedicalCenter[];
