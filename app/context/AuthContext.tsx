import React, {createContext, useState, useEffect, ReactNode} from "react";
import {onAuthStateChanged, signOut, User} from "firebase/auth";
import {auth, db} from "@/FirebaseConfig";
import {collection, getDocs, query, where} from "firebase/firestore";

interface AuthContextProps {
    user: User | null;
    handle: string | null;
    loading: boolean;
    logout: () => Promise<void>;
    update: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextProps | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [handle, setHandle] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const logout = () => signOut(auth);
    const update = async () => {
        if (user) {
            await user.reload();
            setUser(auth.currentUser);
        }
    }

    useEffect(() => {
        return onAuthStateChanged(auth, (firebaseUser: User | null) => {
            console.log("auth state changed")
            setUser(firebaseUser);

            if (firebaseUser && !firebaseUser.isAnonymous) {    // get handle
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
            }

            setLoading(false);
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, handle, loading, logout, update }}>
            {children}
        </AuthContext.Provider>
    );
};