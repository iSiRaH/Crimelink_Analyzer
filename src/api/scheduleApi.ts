import axios from "axios";

export const createDutySchedule = async (data: any) => {
  return axios.post("http://localhost:8080/api/schedules", data);
};

export const getDutySchedules = async () => {
  const res = await axios.get("http://localhost:8080/api/schedules");
  return res.data;
};
