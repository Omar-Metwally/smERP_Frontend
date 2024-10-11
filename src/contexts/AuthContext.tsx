import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseQueryOptions } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { isTokenExpired, useAuthenticatedFetch, useAuthenticatedQuery, useLogin, useLogout, useRefreshToken } from '../services/api';

interface User {
  id: string;
  email: string;
  unique_name: string;
  role: string[]
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authenticatedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  authenticatedQuery: <TData>(
    key: string[],
    queryFn: () => Promise<TData>,
    options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
  ) => ReturnType<typeof useAuthenticatedQuery<TData>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshTokenMutation = useRefreshToken();
  const authenticatedFetch = useAuthenticatedFetch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Retrieve token from local storage
        const token = localStorage.getItem('accessToken');
        
        // Check if the token is present and valid
        if (token && !isTokenExpired(token)) {
          // Decode the user from the token and set it
          const userFromToken: User = jwtDecode<User>(token);
          setUser(userFromToken);
        } else if (token) {
          // If the token is expired, attempt to refresh
          await refreshTokenMutation.mutateAsync();
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await loginMutation.mutateAsync({ email, password });
    console.log(user)
    setUser(user);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    setUser(null);
  };

  const authenticatedQuery = useAuthenticatedQuery;

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    authenticatedFetch,
    authenticatedQuery,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hook to protect routes
export const useRequireAuth = (redirectUrl = '/sign-in') => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate(); // Assuming you're using react-router-dom

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectUrl);
    }
  }, [isAuthenticated, isLoading, navigate, redirectUrl]);

  return { isLoading };
};