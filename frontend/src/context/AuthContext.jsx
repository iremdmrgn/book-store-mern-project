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

export const useAuth = () => {
  return useContext(AuthContext);
};

const googleProvider = new GoogleAuthProvider();

export const AuthProvide = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // register a user
  const registerUser = async (email, password, firstName, lastName) => {
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
  };

  // login, signInWithGoogle, logout, etc.
  const loginUser = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider);
  };

  const logout = () => {
    return signOut(auth);
  };

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
