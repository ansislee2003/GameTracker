import React, {createContext, useState, useEffect, ReactNode, useContext} from "react";
import {onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut, User} from "firebase/auth";
import {auth, db} from "@/FirebaseConfig";
import {collection, getDocs, query, where} from "firebase/firestore";

interface AuthContextProps {
    user: User | null;
    handle: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    update: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [handle, setHandle] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    }
    const logout = () => signOut(auth);
    const update = async () => {
        if (user) {
            await user.reload();
            setUser(auth.currentUser);
        }
    }

    useEffect(() => {
        return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            console.log("auth state changed")
            if (!firebaseUser) {
                try {
                    const credential = await signInAnonymously(auth);   // this will trigger onAuthStateChange again
                    console.log("Signed in anonymously");
                } catch (error) {
                    console.log("Failed to sign in", error);
                }
            } else if (!firebaseUser.isAnonymous) {
                console.log("Welcome back user");
                setUser(firebaseUser);
                setIsAuthenticated(true);
                // get handle
                const usernameQuery = query(
                    collection(db, "usernames"),
                    where("uid", "==", firebaseUser.uid)
                );
                getDocs(usernameQuery)
                    .then(usernameDoc => {
                        setHandle(usernameDoc.docs[0].id);
                    })
                    .catch(error => {
                        console.error("username not found");
                    })
            } else {
                console.log("Anonymous user restored");
                setUser(firebaseUser);
            }

            setLoading(false);

            setTimeout(()=> {
                console.log("test logging out")
                setUser(null);
                setIsAuthenticated(false);
            }, 5000)
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, handle, loading, isAuthenticated, login, logout, update }}>
            {children}
        </AuthContext.Provider>
    );
};