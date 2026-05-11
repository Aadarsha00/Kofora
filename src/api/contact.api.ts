import api from "@/axios/api.axios";

export type ContactTopic = "order" | "returns" | "sizing" | "product" | "general";

export type ContactSubmissionInput = {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  order_number?: string;
  topic: ContactTopic;
  message: string;
};

export const submitContactForm = async (payload: ContactSubmissionInput) => {
  const response = await api.post("/contact/", payload);
  return response.data;
};
