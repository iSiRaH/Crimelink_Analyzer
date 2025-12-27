import axios from "axios";

const API_URL = "http://localhost:8080/api/weapon";

export const addWeapon = (data: {
  weaponType: string;
  serialNumber: string;
  remarks: string;
}) => axios.post(`${API_URL}/add-weapon`, data);

export const updateWeapon = (
  serialNumber: string,
  data: {
    weaponType: string;
    status: string;
    remarks: string;
  }
) => axios.put(`${API_URL}/weapon-update/${serialNumber}`, data);

export const getAllWeapons = () =>
  axios.get(`${API_URL}/all`);
