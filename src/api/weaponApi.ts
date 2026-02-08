import api from "../services/api";
import type { 
  WeaponAddDTO, 
  WeaponUpdateDTO, 
  IssueWeaponRequest, 
  ReturnWeaponRequest,
  WeaponResponseDTO,
  OfficerDTO
} from "../types/weapon";

export const addWeapon = (data: WeaponAddDTO) => 
  api.post(`/weapon/add-weapon`, data);

export const updateWeapon = (serialNumber: string, data: WeaponUpdateDTO) => 
  api.put(`/weapon/weapon-update/${serialNumber}`, data);

export const getAllWeapons = () => 
  api.get(`/weapon/all`);

export const getAllWeaponsWithDetails = () => 
  api.get<WeaponResponseDTO[]>(`/weapon/all-with-details`);

export const getAllOfficers = () => 
  api.get<OfficerDTO[]>("/weapon/officers");

export const issueWeapon = (data: IssueWeaponRequest) => 
  api.post("/weapon/issue", data);

export const returnWeapon = (data: ReturnWeaponRequest) => 
  api.post("/weapon/return", data);