import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fintrakr_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          if (isSubscribed) {
            if (currentUser) {
              setUser(currentUser);
              localStorage.setItem('fintrakr_user', JSON.stringify(currentUser));
            } else {
              setUser(null);
              localStorage.removeItem('fintrakr_user');
            }
            setLoading(false);
          }
        },
        (error) => {
          console.error('Firebase Auth error:', error);
          if (isSubscribed) setLoading(false);
        }
      );

      const timer = setTimeout(() => {
        if (isSubscribed) setLoading(false);
      }, 1200);

      return () => {
        isSubscribed = false;
        unsubscribe();
        clearTimeout(timer);
      };
    } catch (err) {
      console.error('Firebase init error:', err);
      setLoading(false);
    }
  }, []);

  const signUp = async (email, password, fullName) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      localStorage.setItem('fintrakr_user', JSON.stringify(res.user));
      return res;
    } catch (err) {
      console.error('Sign Up Error:', err.message);
      throw err;
    }
  };

  const signIn = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      localStorage.setItem('fintrakr_user', JSON.stringify(res.user));
      return res;
    } catch (err) {
      console.error('Sign In Error:', err.message);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setUser(res.user);
      localStorage.setItem('fintrakr_user', JSON.stringify(res.user));
      return res;
    } catch (err) {
      console.error('Google Sign-In Error:', err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setUser(null);
    localStorage.removeItem('fintrakr_user');
  };

  const getIdToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  };

  const value = {
    user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    getIdToken,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
