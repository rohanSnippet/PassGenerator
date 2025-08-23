import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { supabase } from "../SupabaseClient";
import { useNavigate } from "react-router-dom";
import { createSignedUrl } from "../Services";
import Swal from "sweetalert2";

const Review = () => {
  const { session, handleLogout, getProfiles } = useAuth();
  const user = session?.user;
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signedURL, setSignedURL] = useState(null);
  const [message, setMessage] = useState(null);
  const [seq_no, setSeq_no] = useState(0);

  const createdAt = new Date().toISOString();

  function generateUserPassId(name, createdAt, sequence) {
    const year = new Date(createdAt).getFullYear();
    const initials = name
      .split(" ")
      .map((n) => n[0].toUpperCase())
      .join("");
    const paddedSeq = String(sequence).padStart(4, "0");

    return `${initials}-JLN${year}${paddedSeq}`;
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (fetchError) throw fetchError;
        setProfile(data);
      } catch (err) {
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile?.passport_photo_url) {
      createSignedUrl(profile.passport_photo_url).then(setSignedURL);
    }

    setSeq_no(profile?.idx);
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    const result = await Swal.fire({
      title: "You cannot edit the form once submitted!!",
      text: "Are you sure, you are about to submit the form",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f57428",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Submit!",
      customClass: {
        popup: "libre-baskerville-regular",
        title: "libre-baskerville-bold",
        confirmButton: "rounded-none",
        cancelButton: "rounded-none",
      },
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            is_form_submitted: true,
            user_pass_id: generateUserPassId(profile.name, createdAt, seq_no),
          })
          .eq("user_id", user.id);

        if (error) {
          console.error("submission error:", error.message);
          Swal.fire(
            "Error",
            "Something went wrong while saving the form!",
            "error"
          );
          return;
        }
        Swal.fire({
          title: "Form Submitted Successfully!",
          text: "You are successfully registered for the event.",
          icon: "success",
        });
        setMessage("✅ Application submitted successfully!");
        navigate("/dashboard");
      } catch (error) {
        console.error("Unexpected error:", error);
        Swal.fire("Error", "Unexpected error during logout!", "error");
        setMessage(`❌ Submission failed: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 poppins-semibold">
        <span className="text-xl text-gray-600 animate-pulse">
          Loading your application details...
        </span>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 poppins-semibold">
        <p className="text-xl text-red-600 text-center font-semibold">
          {error}
        </p>
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 poppins-semibold">
        <p className="text-lg text-gray-600">
          No profile data found. Please complete the application form first.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4 flex items-center justify-center libre-baskerville-regular">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 libre-baskerville-bold">
            Application Review
          </h2>
          <div className="space-x-4">
            {" "}
            <button
              onClick={() => navigate("/")}
              className="bg-secondary shadow-sm hover:shadow-lg hover:shadow-gray-400 shadow-gray-300 transition px-4 py-2 rounded-none text-white source-sans-medium"
            >
              Go to dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-br from-red-500 to-red-400 shadow-sm hover:shadow-gray-400 shadow-gray-300 hover:bg-red-600 hover:shadow-lg transition px-4 py-2 rounded-none text-white source-sans-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row gap-10">
          {/* Photo */}
          <div className="flex-shrink-0">
            {profile.passport_photo_url ? (
              <img
                src={signedURL}
                alt="Passport"
                className="w-44 h-60 object-cover rounded-none shadow-lg border-2 border-gray-200"
              />
            ) : (
              <div className="w-44 h-60 flex items-center justify-center rounded-xl bg-gray-200 text-gray-500 border-4 border-gray-300 shadow-lg">
                No Photo
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <DetailItem label="Full Name" value={profile.name} />
              <DetailItem label="Email" value={user.email} />
              <DetailItem label="Contact" value={profile.contact} />
              <DetailItem label="Date of Birth" value={profile.dob} />
              <DetailItem label="Age" value={profile.age} />
              <DetailItem label="Gender" value={profile.gender} />
              <DetailItem label="Category" value={profile.category} />
              <DetailItem label="District" value={profile.district} />
              <DetailItem
                label="Highest Qualification"
                value={profile.highest_qualification}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-6 mt-10">
          <button
            onClick={() => navigate("/multistep-form")}
            className="bg-black transition px-6 py-2 hover:shadow-lg hover:shadow-gray-400 rounded-none text-white source-sans-regular shadow-sm shadow-gray-200"
          >
            Edit
          </button>
          <button
            onClick={handleSubmit}
            className="bg-secondary source-sans-regular hover:shadow-lg hover:shadow-gray-400 shadow-gray-300 transition px-6 py-2 rounded-none text-white shadow-sm"
          >
            Submit
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <p className="mt-6 text-center text-lg font-medium text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-lg font-medium text-gray-800">
      {value || <span className="italic text-gray-400">Not provided</span>}
    </p>
  </div>
);

export default Review;
