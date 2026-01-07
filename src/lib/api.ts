export const BASE_URL = "https://ghared-project-1lb7.onrender.com";

// ================= Types =================
export interface User {
  user_id: number;
  email: string;
  username?: string;
  full_name?: string;
  mobile?: string;
  token: string;
}

export interface LoginResponse {
  status: string;
  message?: string;
  method?: string;
  data: User;
}

export interface InboxTransaction {
  transaction_id: number;
  code: string;
  subject: string;
  date: string;
  sender_name: string;
}

export interface TransactionDetails {
  transaction_id: number;
  code: string;
  subject: string;
  content: string;
  date: string;
  sender_name: string;
  current_status: string;
}

export interface TransactionFull {
  details: TransactionDetails;
  attachments: Array<{
    attachment_id: number;
    file_path: string;
    description: string;
    attachment_date: string;
  }>;
  history: Array<{
    path_id: number;
    path_notes: string;
    from_department: string;
    to_department: string;
    created_at: string;
  }>;
}

export interface Employee {
  user_id: number;
  full_name: string;
  department_name: string;
  department_id: number;
  role_level: number;
}

export interface DepartmentReceivers {
  department_id: number;
  department_name: string;
  employees: Employee[];
}

export interface TransactionType {
  id: number;
  name: string;
}

export interface FormData {
  receivers: DepartmentReceivers[];
  types: TransactionType[];
}

export interface Notification {
  notification_id: number;
  subject: string;
  senderName: string;
  messageSnippet: string;
  date: string;
  is_read: boolean;
}

export interface UserProfileData {
  full_name: string;
  email: string;
  mobile_number: string;
  profile_picture: string | null;
  landline?: string;
  fax_number?: string;
}

export interface UserProfileResponse {
  status: string;
  data: {
    user: UserProfileData;
  };
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// ================= Auth Functions =================
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setAuth = (user: User, token: string) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const authHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ================= API Functions =================
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "فشل في تسجيل الدخول");
  }

  return data;
};

export const updateProfile = async (formData: globalThis.FormData): Promise<ApiResponse<User>> => {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/api/users/profile/update`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "فشل في تحديث الملف الشخصي");
  }

  return data;
};

export const fetchInbox = async (): Promise<InboxTransaction[]> => {
  const token = getToken();
  if (!token) throw new Error("غير مسجل الدخول");

  const response = await fetch(`${BASE_URL}/api/transactions/inbox`, {
    headers: authHeaders(),
  });

  if (response.status === 401) {
    clearAuth();
    throw new Error("انتهت صلاحية الجلسة");
  }

  const result: ApiResponse<InboxTransaction[]> = await response.json();
  return result.data || [];
};

export const fetchSent = async (): Promise<InboxTransaction[]> => {
  const token = getToken();
  if (!token) throw new Error("غير مسجل الدخول");

  const response = await fetch(`${BASE_URL}/api/transactions/my-history`, {
    headers: authHeaders(),
  });

  if (response.status === 401) {
    clearAuth();
    throw new Error("انتهت صلاحية الجلسة");
  }

  const result: ApiResponse<InboxTransaction[]> = await response.json();
  return result.data || [];
};

export const fetchDrafts = async (): Promise<InboxTransaction[]> => {
  const token = getToken();
  if (!token) throw new Error("غير مسجل الدخول");

  const response = await fetch(`${BASE_URL}/api/transactions/draft`, {
    headers: authHeaders(),
  });

  if (response.status === 401) {
    clearAuth();
    throw new Error("انتهت صلاحية الجلسة");
  }

  const result: ApiResponse<InboxTransaction[]> = await response.json();
  return result.data || [];
};

export const fetchDeleted = async (): Promise<InboxTransaction[]> => {
  const token = getToken();
  if (!token) throw new Error("غير مسجل الدخول");

  const response = await fetch(`${BASE_URL}/api/transactions/deleted`, {
    headers: authHeaders(),
  });

  if (response.status === 401) {
    clearAuth();
    throw new Error("انتهت صلاحية الجلسة");
  }

  const result: ApiResponse<InboxTransaction[]> = await response.json();
  return result.data || [];
};

export const fetchTransactionDetails = async (id: string): Promise<TransactionFull | null> => {
  const token = getToken();
  if (!token) throw new Error("غير مسجل الدخول");

  const response = await fetch(`${BASE_URL}/api/transactions/details/${id}`, {
    headers: authHeaders(),
  });

  if (response.status === 401) {
    clearAuth();
    throw new Error("انتهت صلاحية الجلسة");
  }

  const result: ApiResponse<TransactionFull> = await response.json();
  return result.data || null;
};

export const fetchTransactionFile = async (
  filePath: string
): Promise<Blob> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token is required");
  }

  const response = await fetch(
    `${BASE_URL}/api/transactions/file/${filePath}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch transaction file");
  }

  return await response.blob();
};

export const fetchFormData = async (): Promise<FormData> => {
  const token = getToken();
  if (!token) throw new Error("غير مسجل الدخول");

  const response = await fetch(`${BASE_URL}/api/transactions/form-data`, {
    headers: authHeaders(),
  });

  if (response.status === 401) {
    clearAuth();
    throw new Error("انتهت صلاحية الجلسة");
  }

  const result: ApiResponse<FormData> = await response.json();
  return result.data;
};

export const createTransaction = async (formData: globalThis.FormData): Promise<ApiResponse<unknown>> => {
  const token = getToken();
  if (!token) throw new Error("غير مسجل الدخول");

  const response = await fetch(`${BASE_URL}/api/transactions/create`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "فشل في إنشاء المعاملة");
  }

  return result;
};

export const fetchNotifications = async (page = 1, limit = 10): Promise<{ notifications: Notification[]; unreadCount: number }> => {
  const token = getToken();
  if (!token) throw new Error("غير مسجل الدخول");

  const response = await fetch(`${BASE_URL}/api/notifications?page=${page}&limit=${limit}`, {
    headers: authHeaders(),
  });

  if (response.status === 401) {
    clearAuth();
    throw new Error("انتهت صلاحية الجلسة");
  }

  const result: ApiResponse<{ notifications: Notification[]; unreadCount: number }> = await response.json();
  return result.data;
};

export const markNotificationRead = async (notificationId: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error("غير مسجل الدخول");

  await fetch(`${BASE_URL}/api/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: authHeaders(),
  });
};
