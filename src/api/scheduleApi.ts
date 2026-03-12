import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const createDutySchedule = async (data: any) => {
  return axios.post(`${API_BASE_URL}/schedules`, data);
};

export const getDutySchedules = async () => {
  const res = await axios.get(`${API_BASE_URL}/schedules`);
  return res.data;
};
