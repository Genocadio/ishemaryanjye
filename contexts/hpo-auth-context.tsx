"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { HPOAuthService, TokenManager, HPOPlayer, HPOLoginData, HPORegistrationData } from '@/lib/hpo-auth';

interface HPOAuthContextType {
  player: HPOPlayer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: HPOLoginData) => Promise<void>;
  register: (data: HPORegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const HPOAuthContext = createContext<HPOAuthContextType | undefined>(undefined);

export const useHPOAuth = () => {
  const context = useContext(HPOAuthContext);
  if (context === undefined) {
    throw new Error('useHPOAuth must be used within an HPOAuthProvider');
  }
  return context;
};

interface HPOAuthProviderProps {
  children: ReactNode;
}

export const HPOAuthProvider: React.FC<HPOAuthProviderProps> = ({ children }) => {
  const [player, setPlayer] = useState<HPOPlayer | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const token = TokenManager.getToken();
      if (token) {
        const playerData = await HPOAuthService.getProfile(token);
        setPlayer(playerData);
        setIsAuthenticated(true);
      } else {
        setPlayer(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      TokenManager.removeToken();
      setPlayer(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: HPOLoginData) => {
    try {
      setIsLoading(true);
      const response = await HPOAuthService.login(data);
      
      // Store the token
      TokenManager.setToken(response.token);
      
      // Set player data
      setPlayer(response.player);
      setIsAuthenticated(true);
      
      // Store additional data in localStorage for compatibility
      localStorage.setItem('id', response.player.id.toString());
      localStorage.setItem('username', response.player.username);
      localStorage.setItem('player_name', response.player.player_name);
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: HPORegistrationData) => {
    try {
      setIsLoading(true);
      const response = await HPOAuthService.register(data);
      
      // Store the token
      TokenManager.setToken(response.token);
      
      // Set player data
      setPlayer(response.player);
      setIsAuthenticated(true);
      
      // Store additional data in localStorage for compatibility
      localStorage.setItem('id', response.player.id.toString());
      localStorage.setItem('username', response.player.username);
      localStorage.setItem('player_name', response.player.player_name);
      
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = TokenManager.getToken();
      if (token) {
        await HPOAuthService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      TokenManager.removeToken();
      localStorage.removeItem('id');
      localStorage.removeItem('username');
      localStorage.removeItem('player_name');
      
      setPlayer(null);
      setIsAuthenticated(false);
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const token = TokenManager.getToken();
    if (token) {
      refreshProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const value: HPOAuthContextType = {
    player,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return (
    <HPOAuthContext.Provider value={value}>
      {children}
    </HPOAuthContext.Provider>
  );
};
