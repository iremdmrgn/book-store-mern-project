import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile 
} from "firebase/auth";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const googleProvider = new GoogleAuthProvider();

export const AuthProvide = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // refreshUser function to reload the Firebase user and update context state
  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setCurrentUser(auth.currentUser);
    }
  };

  // Register a new user, update their Firebase profile, and sync to MongoDB
  const registerUser = async (email, password, firstName, lastName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Update displayName in Firebase
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });
      // Sync account to MongoDB
      await axios.post("http://localhost:5000/api/account/sync", {
        uid: user.uid,
        firstName,
        lastName,
        email,
        phone: user.phoneNumber || "",
      });
      return userCredential;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  };

  // Login using email and password
  const loginUser = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider);
  };

  // Logout the user
  const logout = () => {
    return signOut(auth);
  };

  // Listen to auth state changes and sync account data to MongoDB
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        const { uid, email, displayName } = user;
        const [firstName, lastName] = displayName ? displayName.split(" ") : [email, ""];
        try {
          await axios.post("http://localhost:5000/api/account/sync", {
            uid,
            firstName,
            lastName,
            email,
            phone: user.phoneNumber || "",
          });
        } catch (error) {
          console.error("Failed to sync account:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    registerUser,
    loginUser,
    signInWithGoogle,
    logout,
    refreshUser, // expose refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
