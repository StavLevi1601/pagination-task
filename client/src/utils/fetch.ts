import axios from "axios";

export const fetch = async () => {
  const result = await axios("http://localhost:3000/rules?page=1&limit=10");
  return result;
};
