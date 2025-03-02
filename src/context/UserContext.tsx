import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

interface UserProfile {
  email: string;
  name: string;
  picture: string;
}

interface UserContextType {
  profile: UserProfile | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    flow: "auth-code",
    ux_mode: "popup",
    redirect_uri: window.location.origin,
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v1/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        setProfile(userInfo.data);
        window.location.href = '/upload';
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setIsLoading(false);
    },
  });

  const logout = () => {
    googleLogout();
    setProfile(null);
  };

  return (
    <UserContext.Provider value={{ profile, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};