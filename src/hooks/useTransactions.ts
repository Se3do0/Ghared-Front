import { useQuery } from "@tanstack/react-query";
import { fetchInbox, fetchSent, fetchDrafts, fetchDeleted, fetchTransactionDetails, fetchFormData, fetchNotifications, fetchTransactionFile } from "@/lib/api";

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

export const useTransactionAttachment = () => {
  const openAttachment = async (
    filePath: string,
    fileName: string,
    preview = false
  ) => {
    const blob = await fetchTransactionFile(filePath);
    const url = URL.createObjectURL(blob);

    if (preview) {
      window.open(url);
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    URL.revokeObjectURL(url);
  };

  return { openAttachment };
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
