import axios from "axios";
import api from "../services/api";
import type {
  BulletAddDTO,
  BulletUpdateDTO,
  BulletResponseDTO
} from "../types/Bullet";



export const getAllBullets = () =>
  api.get(`/bullet/all`);



export const getBulletById = (bulletId: number) =>
  api.get(`/bullet/${bulletId}`);


export const getAllBulletsWithDetails = () =>
  api.get<BulletResponseDTO[]>("/bullet/all-with-details");

export const addBullet = (payload: any) =>
  api.post("/bullet/add-bullet", payload);

export const updateBullet = (id: number, payload: any) =>
  api.put(`/bullet/bullet-update/${id}`, payload);