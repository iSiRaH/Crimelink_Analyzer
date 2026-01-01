import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { User } from '../types/auth';
import { AuthContext } from './AuthContextDefinition';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            // Use stored minimal user data immediately for fast UI render
            setUser(storedUser);
            // Note: Full user details will be fetched when needed by components
            // This reduces unnecessary API calls on every mount
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid session
        await authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      
      // Role-based redirection
      switch (response.user.role) {
        case 'Admin':
          navigate('/admin/dashboard');
          break;
        case 'OIC':
          navigate('/oic/dashboard');
          break;
        case 'Investigator':
          navigate('/investigator/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = (updatedUser: { userId: number; name: string; role: string }) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        name: updatedUser.name,
      };
    });
    
    // Also update localStorage
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      const updated = { ...storedUser, name: updatedUser.name };
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
