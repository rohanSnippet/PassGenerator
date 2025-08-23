import React, { useState, useEffect, useContext, createContext } from "react";
import { supabase } from "../src/SupabaseClient";
import Swal from "sweetalert2";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    // Clean up the subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f57428",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
      customClass: {
        popup: "libre-baskerville-regular",
        title: "libre-baskerville-bold",
        confirmButton: "rounded-none",
        cancelButton: "rounded-none",
      },
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Logout error:", error.message);
          Swal.fire("Error", "Something went wrong during logout!", "error");
          return;
        }

        Swal.fire({
          title: "Logged Out!",
          text: "You have been successfully logged out.",
          icon: "success",
          confirmButtonColor: "#f57428",
          customClass: {
            popup: "libre-baskerville-regular",
            title: "libre-baskerville-bold",
            confirmButton: "rounded-none",
          },
        });
      } catch (err) {
        console.error("Unexpected error:", err);
        Swal.fire("Error", "Unexpected error during logout!", "error");
      }
    }
  };

  const getProfiles = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select();

      if (error) {
        console.log("Error fetching all users.", error);
        return error;
      }
      // console.log(data)
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const getUserProfile = async (userId) => {
    console.log(userId);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single(); // since id is unique

    //console.log(data)

    if (error) {
      console.error(error);
      return null;
    }
    return data;
  };

  const value = {
    supabase,
    session,
    user: session?.user,
    loading,
    handleLogout,
    getProfiles,
    getUserProfile,
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
