import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { onAuthStateChanged, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signUp = async (email, password, fullName) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const signIn = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signOut = async () => {
        return firebaseSignOut(auth);
    };

    const value = {
        user,
        signUp,
        signIn,
        signInWithOtp: async (email) => {
            alert("Email OTP is not supported in this Firebase configuration yet.");
        },
        signInWithGoogle: async () => {
            return signInWithPopup(auth, googleProvider);
        },
        signOut,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
