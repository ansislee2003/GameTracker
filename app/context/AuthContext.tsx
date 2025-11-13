import React, {createContext, useState, useEffect, ReactNode} from "react";
import {onAuthStateChanged, signOut, User} from "firebase/auth";
import { auth } from "@/FirebaseConfig";

interface AuthContextProps {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const logout = () => signOut(auth);

    useEffect(() => {
        return onAuthStateChanged(auth, (firebaseUser: User | null) => {
            setUser(firebaseUser);
            setLoading(false);
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};