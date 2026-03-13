import api from "../services/api";

export const createDutySchedule = async (data: any) => {
  return api.post("/schedules", data);
};

export const getDutySchedules = async () => {
  const res = await api.get("/schedules");
  return res.data;
};
