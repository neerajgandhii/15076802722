import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = "http://20.244.56.144/evaluation-service";

export async function Log(
  stack: 'backend' | 'frontend',
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
  logPackage: string,
  message: string
) {
  const token = process.env.ACCESS_TOKEN;

  if (!token) {
    console.error("Access token missing. Please set ACCESS_TOKEN in .env file.");
    return;
  }

  try {
    const response = await axios.post(`${BASE_URL}/logs`, {
      stack,
      level,
      package: logPackage,
      message,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    console.log("Log sent:", response.data);
  } catch (error: any) {
    console.error("Failed to send log:", error.response?.data || error.message);
  }
}