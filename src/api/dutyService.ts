import axios from "axios";
import type { OfficerDutyRow, DutyCreatePayload } from "../types/duty";

export const getOfficerRowsByDate = async (date: string) => {
  const res = await axios.get<OfficerDutyRow[]>(
    "/duty-schedule/officer-rows",
    { params: { date } }
  );
  return res.data;
};

export const bulkSaveDuties = async (payload: DutyCreatePayload[]) => {
  const res = await axios.post("/duty-schedule/bulk", payload);
  return res.data;
};
