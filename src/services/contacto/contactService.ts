import { siteConfig } from "@/lib/config";
import type {
  ContactMessageRequest,
  ContactMessageResponse,
} from "@/types/index";

const BACKEND_URL = siteConfig.backendUrl;

export async function sendContactMessage(
  data: ContactMessageRequest
): Promise<ContactMessageResponse> {
  const response = await fetch(
    `${BACKEND_URL}/contact`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    let errorDetail = `Error ${response.status}`;

    try {
      const errorJson = await response.json();

      if (errorJson.message) {
        errorDetail = errorJson.message;
      }
    } catch {
      // La respuesta no contiene JSON
    }

    throw new Error(errorDetail);
  }

  return response.json();
}