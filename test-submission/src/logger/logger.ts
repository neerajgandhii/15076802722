import axios from "axios";

const BASE_URL = "http://20.244.56.144/evaluation-service";

export async function Log(
  stack: "frontend" | "backend",
  level: "debug" | "info" | "warn" | "error" | "fatal",
  pkg: string,
  message: string
) {
  try {
    await fetch("http://20.244.56.144/evaluation-service/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch (e) {
    // Optionally handle logging errors (e.g., show a toast or console.warn)
  }
}
