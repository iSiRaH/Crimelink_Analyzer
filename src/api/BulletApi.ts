import api from "../services/api";
import type { 
  BulletAddDTO, 
  BulletUpdateDTO, 
  BulletResponseDTO
} from "../types/Bullet";

export const addBullet = (data: BulletAddDTO) => 
  api.post(`/bullet/add-bullet`, data);

export const updateBullet = (bulletId: number, data: BulletUpdateDTO) => 
  api.put(`/bullet/bullet-update/${bulletId}`, data);

export const getAllBullets = () => 
  api.get(`/bullet/all`);

export const getAllBulletsWithDetails = () => 
  api.get<BulletResponseDTO[]>(`/bullet/all-with-details`);

export const getBulletById = (bulletId: number) => 
  api.get(`/bullet/${bulletId}`);