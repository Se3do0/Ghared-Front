import { useQuery } from "@tanstack/react-query";
import { fetchInbox, fetchSent, fetchDrafts, fetchDeleted, fetchTransactionDetails, fetchFormData, fetchNotifications } from "@/lib/api";

export const useInbox = () => {
  return useQuery({
    queryKey: ["inbox"],
    queryFn: fetchInbox,
  });
};

export const useSent = () => {
  return useQuery({
    queryKey: ["sent"],
    queryFn: fetchSent,
  });
};

export const useDrafts = () => {
  return useQuery({
    queryKey: ["drafts"],
    queryFn: fetchDrafts,
  });
};

export const useDeleted = () => {
  return useQuery({
    queryKey: ["deleted"],
    queryFn: fetchDeleted,
  });
};

export const useTransactionDetails = (id: string) => {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => fetchTransactionDetails(id),
    enabled: !!id,
  });
};

export const useFormData = () => {
  return useQuery({
    queryKey: ["formData"],
    queryFn: fetchFormData,
  });
};

export const useNotifications = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => fetchNotifications(page, limit),
  });
};
