// contexts/auth-context.tsx
'use client'; // Important to add this for client components

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Updated import

// Define types
interface User {
  id: number;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  getToken: () => string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(true); // Add loading state
    const router = useRouter();
  
    // Check if user is logged in on initial load
    useEffect(() => {
      const checkAuth = () => {
        try {
          // Only run on client-side where localStorage is available
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
              const decodedUser = parseJwt(token);
              // Check if token is expired
              if (decodedUser.exp * 1000 < Date.now()) {
                handleLogout();
              } else {
                setUser({
                  id: decodedUser.user_id,
                  name: decodedUser.name,
                  role: decodedUser.role
                });
                setIsLoggedIn(true);
              }
            }
          }
        } catch (error) {
          console.error('Invalid token:', error);
          handleLogout();
        } finally {
          setLoading(false);
        }
      };
  
      checkAuth();
    }, [router]); // Add router to dependency array

  // Function to decode JWT
  const parseJwt = (token: string) => {
    try {
      // Split the token and get the payload
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  // Login function
  const handleLogin = (token: string, refreshToken: string) => {
    // First decode and set user data
    const decodedUser = parseJwt(token);
    
    // Set user data before localStorage updates
    setUser({
      id: decodedUser.user_id,
      name: decodedUser.name,
      role: decodedUser.role
    });
    setIsLoggedIn(true);
    
    // Then update localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  };

  // Logout function
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Send logout request to backend
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh: refreshToken
          })
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local storage and state regardless of API success
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsLoggedIn(false);
      router.push('/login');
    }
  };

  // Get token function
  const getToken = () => {
    return localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading, // Add loading to context
        login: handleLogin,
        logout: handleLogout,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}