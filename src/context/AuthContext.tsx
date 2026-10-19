import React, { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS, StorageService } from '../services/storage';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isOperator: boolean;
  login: (username: string, roleHint?: UserRole) => boolean;
  logout: () => void;
  switchUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const users = StorageService.getUsers();
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (activeId) {
      const found = users.find((u) => u.id === activeId && u.isActive);
      if (found) return found;
    }
    return users.find((u) => u.role === 'admin' && u.isActive) || users[0] || null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, currentUser.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    }
  }, [currentUser]);

  const login = (username: string, roleHint: UserRole = 'operator'): boolean => {
    const users = StorageService.getUsers();
    const cleanUsername = username.toLowerCase().trim();
    let found = users.find((u) => u.username.toLowerCase() === cleanUsername && u.isActive);

    if (!found) {
      if (cleanUsername === 'admin' || cleanUsername === 'administrator') {
        found = users.find((u) => u.role === 'admin' && u.isActive);
      } else if (cleanUsername === 'operator' || cleanUsername === 'kpps') {
        found = users.find((u) => u.role === 'operator' && u.isActive);
      }
    }

    if (!found && cleanUsername.length >= 3) {
      const created = StorageService.addUser(
        {
          username: cleanUsername,
          nama: username.charAt(0).toUpperCase() + username.slice(1),
          role: roleHint,
        },
        {
          id: 'system',
          username: 'system',
          nama: 'System Admin',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
        }
      );
      found = created;
    }

    if (found && found.isActive) {
      setCurrentUser(found);
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isOperator = currentUser?.role === 'operator';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isOperator,
        login,
        logout,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
