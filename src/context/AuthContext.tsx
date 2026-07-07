import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserSession } from '../types';

interface AuthContextType {
  currentUser: UserSession | null;
  loading: boolean;
  login: (mobile: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (mobile: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user session from LocalStorage at startup
  useEffect(() => {
    const stored = localStorage.getItem('prashant_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('prashant_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (mobile: string, password: string) => {
    try {
      // Basic validation
      if (!mobile || !password) {
        return { success: false, error: 'Mobile and password are required.' };
      }

      // Check for default super admin account
      if ((mobile === '9999999999' && password === 'adminpassword') || (mobile === '9511244447' && password === 'Prashant')) {
        const adminSession: UserSession = {
          uid: mobile,
          mobile: mobile,
          role: 'admin',
          createdAt: new Date().toISOString()
        };

        // Seed default admin in Firestore if it doesn't exist
        const adminDoc = doc(db, 'users', mobile);
        const adminSnap = await getDoc(adminDoc);
        if (!adminSnap.exists()) {
          await setDoc(adminDoc, {
            uid: mobile,
            mobile: mobile,
            role: 'admin',
            createdAt: new Date().toISOString(),
            password: password
          });
          // Also set in admins list
          await setDoc(doc(db, 'admins', mobile), {
            uid: mobile,
            mobile: mobile,
            email: 'footwearprashant4@gmail.com'
          });
        }

        setCurrentUser(adminSession);
        localStorage.setItem('prashant_user', JSON.stringify(adminSession));
        return { success: true };
      }

      // Query database for the user profile
      const userRef = doc(db, 'users', mobile);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.password === password) {
          const session: UserSession = {
            uid: mobile,
            mobile: userData.mobile,
            role: userData.role || 'customer',
            createdAt: userData.createdAt
          };
          setCurrentUser(session);
          localStorage.setItem('prashant_user', JSON.stringify(session));
          return { success: true };
        } else {
          return { success: false, error: 'Incorrect password.' };
        }
      } else {
        return { success: false, error: 'User does not exist. Please register first.' };
      }
    } catch (e: any) {
      console.error(e);
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  };

  const register = async (mobile: string, password: string) => {
    try {
      if (mobile.length < 10) {
        return { success: false, error: 'Mobile number must be at least 10 digits.' };
      }
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }

      // Check if user already exists in Firestore
      const userRef = doc(db, 'users', mobile);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { success: false, error: 'Mobile number is already registered.' };
      }

      // Create new customer account (or admin if it's an administrator mobile number)
      const isAdminNum = mobile === '9511244447' || mobile === '9999999999';
      const newUser = {
        uid: mobile,
        mobile,
        password,
        role: isAdminNum ? 'admin' : 'customer',
        createdAt: new Date().toISOString()
      };

      await setDoc(userRef, newUser);

      // Create admin doc if applicable
      if (isAdminNum) {
        await setDoc(doc(db, 'admins', mobile), {
          uid: mobile,
          mobile,
          email: 'footwearprashant4@gmail.com'
        });
      }

      const session: UserSession = {
        uid: mobile,
        mobile,
        role: isAdminNum ? 'admin' : 'customer',
        createdAt: newUser.createdAt
      };

      setCurrentUser(session);
      localStorage.setItem('prashant_user', JSON.stringify(session));
      return { success: true };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('prashant_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, isAdmin: currentUser?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
