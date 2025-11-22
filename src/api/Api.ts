import axios from "axios";

export const getOfficers = async () => {
  const res = await axios.get("http://localhost:8080/api/officers");
  return res.data;
};
