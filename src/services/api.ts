import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { ApiPaginatedResponse, ApiResponse, AttributeSelectOption, PaginationParameters, SelectOption } from './types';
import { BranchFormData } from 'src/sections/branch/branch-form';
import { BrandFormData } from 'src/sections/brand/brand-form';
import { CategoryFormData } from 'src/sections/category/category-form';
import { UserFormData } from 'src/sections/user/add-new-user';
import { AttributeFormData } from 'src/sections/attribute/attribute-form';
import { ProductFormData } from 'src/sections/product/product-form';
import { ProductInstanceFormData } from 'src/sections/product/product-instance-form';
import { Attribute } from 'src/sections/product/test';
import { SupplierFormData } from 'src/sections/supplier/supplier-form';

// Define the base URL for your API
const API_BASE_URL = 'https://taambeit.runasp.net';

// Types for our auth responses
interface LoginResponse {
  jwt: string;
  user: User;
}

interface RefreshResponse {
  jwt: string;
}

interface User {
  id: string;
  email: string;
  role: string[];
  unique_name: string
}

interface JwtPayload {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  role: string[];
  exp: number;
}

// Helper function to handle API calls
const apiCall = async <T>(
  endpoint: string,
  method: string,
  body?: object,
  token?: string
): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // This is important for sending and receiving cookies
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Function to handle login
const loginUser = async (credentials: { email: string; password: string }) => {
  const data = await apiCall<LoginResponse>('/Auth/login', 'POST', credentials);
  localStorage.setItem('accessToken', data.jwt);
  const user: User = jwtDecode<User>(data.jwt)
  localStorage.setItem('user', JSON.stringify(user));
  return data;
};

// Function to handle logout
const logoutUser = async () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  await apiCall('/Auth/revokeToken', 'GET');
};

// Function to refresh the access token
const refreshAccessToken = async () => {
  const data = await apiCall<RefreshResponse>('/Auth/refreshToken', 'GET');
  localStorage.setItem('accessToken', data.jwt);
  const user: User = jwtDecode<User>(data.jwt)
  localStorage.setItem('user', JSON.stringify(user));
  return data;
};

export const useLogin = () => {
  const mutation = useMutation({
    mutationFn: loginUser,
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.status === 'pending',
    ...mutation,
  };
};

export const useLogout = () =>
  useMutation({ mutationFn: logoutUser });


// Custom hook for token refresh mutation
export const useRefreshToken = () =>
  useMutation({ mutationFn: refreshAccessToken });


export const isTokenExpired = (token?: string): boolean => {
  // Use the provided token or retrieve from local storage
  const tokenToCheck = token || localStorage.getItem('accessToken');

  if (!tokenToCheck) {
    // No token available to check
    return true;
  }

  try {
    // Decode the token
    const decodedToken = jwtDecode<JwtPayload>(tokenToCheck);
    // Check if the token is expired
    return decodedToken.exp * 1000 < Date.now();
  } catch {
    // If decoding fails, assume the token is expired
    return true;
  }
};

// Custom hook to get authenticated fetch function
export const useAuthenticatedFetch = () => {
  const refreshTokenMutation = useRefreshToken();

  return async (input: RequestInfo, init?: RequestInit) => {
    let accessToken = localStorage.getItem('accessToken') || '';

    if (!accessToken || isTokenExpired(accessToken)) {
      try {
        const refreshResult = await refreshTokenMutation.mutateAsync();
        accessToken = refreshResult.jwt;
      } catch (error) {
        throw new Error('Unable to refresh token');
      }
    }

    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);

    const response = await fetch(input, { ...init, headers });

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    return response;
  };
};

// Custom hook for authenticated queries
export const useAuthenticatedQuery = <TData>(
  key: string[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) => {
  const authenticatedFetch = useAuthenticatedFetch();

  return useQuery<TData, Error>({
    queryKey: key,
    queryFn: async () => {
      try {
        const response = await authenticatedFetch(queryFn.toString());
        return await response.json();
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
        throw error;
      }
    },
    retry: (failureCount: number, error: Error) => {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
};

const API_BASE_URL1 = 'http://localhost:5184/';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorResponse = await response.json();
    const errorMessages = errorResponse.errorMessages || ["An unknown error occurred."];
    throw new Error(errorMessages.join(', '));
  }
  return response.json();
}

export const apiService = {
  users: {
    create: async (data: UserFormData) => {
      const request = { ...data, roles: data.roles.map((role: any) => role.value) };
      const response = await fetch(`${API_BASE_URL1}auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      return handleResponse(response);
    },
    update: async (userId: string, data: Partial<UserFormData>) => {
      const response = await fetch(`${API_BASE_URL1}auth/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
  },
  brands: {
    create: async (data: BrandFormData) => {
      const response = await fetch(`${API_BASE_URL1}brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (brandId: string, data: Partial<BrandFormData>) => {
      const response = await fetch(`${API_BASE_URL1}brands`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, brandId }),
      });
      return handleResponse(response);
    },
  },
  branches: {
    create: async (data: BranchFormData) => {
      const response = await fetch(`${API_BASE_URL1}branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (branchId: string, data: Partial<BranchFormData>) => {
      const response = await fetch(`${API_BASE_URL1}branches`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, branchId }),
      });
      return handleResponse(response);
    },
  },
  categories: {
    create: async (data: CategoryFormData) => {
      const response = await fetch(`${API_BASE_URL1}categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (categoryId: string, data: Partial<CategoryFormData>) => {
      const response = await fetch(`${API_BASE_URL1}categories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, categoryId }),
      });
      return handleResponse(response);
    },
  },
  attributes: {
    create: async (data: AttributeFormData) => {
      const response = await fetch(`${API_BASE_URL1}attributes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (attributeId: string, data: any) => {
      const response = await fetch(`${API_BASE_URL1}attributes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, attributeId }),
      });
      return handleResponse(response);
    },
  },
  products: {
    create: async (data: ProductFormData) => {
      const response = await fetch(`${API_BASE_URL1}products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (productId: string, data: Partial<ProductFormData>) => {
      const response = await fetch(`${API_BASE_URL1}products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, productId }),
      });
      return handleResponse(response);
    },
  },
  productInstances: {
    create: async (productId: string ,data: ProductInstanceFormData) => {
      const response = await fetch(`${API_BASE_URL1}products/${productId}/instances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, productId }),
      });
      return handleResponse(response);
    },
    update: async (productId: string, productInstanceId: string, data: Partial<ProductInstanceFormData>) => {
      const response = await fetch(`${API_BASE_URL1}products/${productId}/instances/${productInstanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
  },
  suppliers: {
    create: async (data: SupplierFormData) => {
      const response = await fetch(`${API_BASE_URL1}suppliers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (supplierId: string, data: Partial<SupplierFormData>) => {
      const response = await fetch(`${API_BASE_URL1}suppliers/${supplierId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    getById: async (supplierId: number) =>{
      const response = await fetch(`${API_BASE_URL1}suppliers/${supplierId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return handleResponse(response);
    }
  }
};

export const fetchEntities = async <T>(
  endpoint: string,
  params: PaginationParameters
): Promise<ApiPaginatedResponse<T>> => {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value != null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const response = await fetch(`${API_BASE_URL1}${endpoint}${queryString ? `?${queryString}` : ''}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return response.json();
};

export const fetchBranches = async (): Promise<ApiResponse<SelectOption[]>> => {
  const response = await fetch(`${API_BASE_URL1}branches/list`);

  if (!response.ok) {
    throw new Error('Failed to fetch branches');
  }

  const result: ApiResponse<SelectOption[]> = await response.json();
  return result;
};

export const fetchAttributes = async (): Promise<ApiResponse<Attribute[]>> => {
  const response = await fetch(`${API_BASE_URL1}attributes/list`);

  if (!response.ok) {
    throw new Error('Failed to fetch attributes');
  }

  const result: ApiResponse<Attribute[]> = await response.json();
  return result;
};

export const fetchBrands = async (): Promise<ApiResponse<SelectOption[]>> => {
  const response = await fetch(`${API_BASE_URL1}brands/list`);

  if (!response.ok) {
    throw new Error('Failed to fetch brands');
  }

  const result: ApiResponse<SelectOption[]> = await response.json();
  return result;
};

export const fetchRoles = async (): Promise<ApiResponse<string[]>> => {
  const response = await fetch(`${API_BASE_URL1}auth/roles`);

  if (!response.ok) {
    throw new Error('Failed to fetch branches');
  }

  const result: ApiResponse<string[]> = await response.json();
  return result;
};

export const fetchParentCategories = async (): Promise<ApiResponse<SelectOption[]>> => {
  const response = await fetch(`${API_BASE_URL1}categories/parent`);

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  const result: ApiResponse<SelectOption[]> = await response.json();
  return result;
};

export const fetchProductCategories = async (): Promise<ApiResponse<SelectOption[]>> => {
  const response = await fetch(`${API_BASE_URL1}categories/product`);

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  const result: ApiResponse<SelectOption[]> = await response.json();
  return result;
};

export { apiCall };