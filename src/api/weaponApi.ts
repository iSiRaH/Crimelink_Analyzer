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

export const getAllWeapons = () => api.get(`/weapon/all`);

export const issueWeapon = (data: {
  weaponSerial: string;
  issuedToId: number;
  handedOverById: number;
  dueDate: string;
  issueNote: string;
}) => api.post("/weapon/issue", data);

export const returnWeapon = (data: {
  weaponSerial: string;
  receivedByUserId: number;
  returnNote: string;
}) => api.post("/weapon/return", data);