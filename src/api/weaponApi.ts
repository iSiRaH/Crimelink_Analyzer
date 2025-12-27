import api from "../services/api";

export const addWeapon = (data: {
  weaponType: string;
  serialNumber: string;
  remarks: string;
}) => api.post(`/weapon/add-weapon`, data);

export const updateWeapon = (
  serialNumber: string,
  data: {
    weaponType: string;
    status: string;
    remarks: string;
  }
) => api.put(`/weapon/weapon-update/${serialNumber}`, data);

export const getAllWeapons = () =>
  api.get(`/weapon/all`);
