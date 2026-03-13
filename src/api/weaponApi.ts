import api from "../services/api";
import type { weaponRequestType } from "../types/weapon";

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
  },
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

export const getWeaponRequests: () => Promise<
  weaponRequestType[]
> = async () => {
  try {
    const response = await api.get<weaponRequestType[]>("/weapon/requests");
    return response.data;
  } catch (err) {
    console.error("Failed to load weapon requests:", err);
    throw err;
  }
};

export const approveWeaponRequest = (requestId: number) => {
  try {
    const response = api.put(`/weapon/requests/${requestId}/approve`);
    return response;
  } catch (err) {
    console.error("Failed to approve weapon request:", err);
    throw err;
  }
};

export const rejectWeaponRequest = (requestId: number) => {
  try {
    const response = api.put(`/weapon/requests/${requestId}/reject`);
    return response;
  } catch (err) {
    console.error("Failed to reject weapon request:", err);
    throw err;
  }
};
