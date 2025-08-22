import { useEffect, useState } from "react";
import { supabase } from "../SupabaseClient";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { createSignedUrl } from "../Services";

// List of districts in Maharashtra for the dropdown
const maharashtraDistricts = [
  "Ahmednagar",
  "Akola",
  "Amravati",
  "Aurangabad",
  "Beed",
  "Bhandara",
  "Buldhana",
  "Chandrapur",
  "Dhule",
  "Gadchiroli",
  "Gondia",
  "Hingoli",
  "Jalgaon",
  "Jalna",
  "Kolhapur",
  "Latur",
  "Mumbai City",
  "Mumbai Suburban",
  "Nagpur",
  "Nanded",
  "Nandurbar",
  "Nashik",
  "Osmanabad",
  "Palghar",
  "Parbhani",
  "Pune",
  "Raigad",
  "Ratnagiri",
  "Sangli",
  "Satara",
  "Sindhudurg",
  "Solapur",
  "Thane",
  "Wardha",
  "Washim",
  "Yavatmal",
];

// List of categories for the dropdown
const categories = ["Open", "OBC", "SEBC", "SBC", "SC", "ST", "VJNT"];

// Main application component
const MultistepForm = () => {
  const { session, handleLogout } = useAuth();
  const user = session?.user;
  const navigate = useNavigate();

  // State to hold all form data
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    dob: "",
    age: "",
    gender: "",
    category: "",
    photoFile: null,
    district: "",
    highestQualification: "",
    // Add email to state to reflect it in the form
    email: user?.email || "",
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [signedURL, setSignedURL] = useState(null);
  const [index, setIndex] = useState(null);

  const getIdx = async () => {
  const { data, error } = await supabase.from("profiles").select("*");

  if (data) {
    const index = data.findIndex((profile) => profile.user_id === user.id);
    console.log("Row number (0-based):", index);
    console.log("Row number (1-based):", index + 1);
    setIndex(index+1);
  }

  if(error){
    console.log(error)
  }

};

  // useEffect to fetch initial user data on component mount or when user changes
  useEffect(() => {
    const fetchUserData = async () => {
      // Don't proceed if the user object is not available
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Pre-fill formData with values from the database
          setFormData({
            ...formData,
            name: data.name || "",
            contact: data.contact || "",
            dob: data.dob || "",
            age: data.age ? data.age.toString() : "",
            gender: data.gender || "",
            category: data.category || "",
            district: data.district || "",
            highestQualification: data.highest_qualification || "",
            email: user.email,
          });
          // Set the photo URL if it exists in the database
          if (data.passport_photo_url) {
            setPhotoUrl(data.passport_photo_url);
            createSignedUrl(data.passport_photo_url).then(setSignedURL);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err.message);
      }
    };
    fetchUserData();
    getIdx();
  }, [user]); // Depend on user to run only when the user object is available

  // Effect to calculate age from DOB
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData((prevData) => ({ ...prevData, age: age.toString() }));
    }
  }, [formData.dob]);

  // Effect to validate the form whenever formData changes
  useEffect(() => {
    const isValid =
      formData.name.trim() !== "" &&
      formData.contact.trim() !== "" &&
      formData.contact.length >= 10 &&
      formData.dob.trim() !== "" &&
      formData.gender.trim() !== "" &&
      formData.category.trim() !== "" &&
      // Check if either a new file is selected or an old photo URL exists
      (formData.photoFile !== null || photoUrl !== null) &&
      formData.district.trim() !== "" &&
      formData.highestQualification.trim() !== "";

    setIsFormValid(isValid);
  }, [formData, photoUrl]);

  // Handle changes for all input fields except file
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle file input changes and validation

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        setMessage("File size exceeds 1MB. Please choose a smaller file.");
        setFormData((prevData) => ({ ...prevData, photoFile: null }));
        e.target.value = ""; // Clear the input field
        return;
      }
      // Check file type (images or pdf)
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setMessage("Invalid file type. Please upload a JPG, PNG, GIF, or PDF.");
        setFormData((prevData) => ({ ...prevData, photoFile: null }));
        e.target.value = "";
        return;
      }

      setMessage("");
      setFormData((prevData) => ({ ...prevData, photoFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      let finalPhotoUrl = photoUrl; // Start with the existing URL

      // Only upload a new photo if a new file has been selected
      if (formData.photoFile) {
        const photoFile = formData.photoFile;
        const fileExt = photoFile.name.split(".").pop();
        // Create a unique file name using user ID and a timestamp
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload photo to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("passport-photos")
          .upload(filePath, photoFile);

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL for the newly uploaded file
        const { data: publicUrlData } = supabase.storage
          .from("passport-photos")
          .getPublicUrl(filePath);

        finalPhotoUrl = publicUrlData.publicUrl;
      }

      const {
        name,
        contact,
        dob,
        age,
        gender,
        category,
        district,
        highestQualification,
      } = formData;

      const { data, error } = await supabase
        .from("profiles")
        .update({
          idx : index,
          name,
          contact,
          dob,
          age,
          gender,
          category,
          passport_photo_url: finalPhotoUrl,
          district,
          highest_qualification: highestQualification,
        })
        .eq("user_id", user.id)
        .select();

      if (error) {
        throw error;
      }

      // Update the local state with the new photo URL after successful submission
      if (data && data.length > 0) {
        setPhotoUrl(data[0].passport_photo_url);
      }

      setMessage("Application submitted successfully!");
      // Removed navigation as the context for user_seq is not provided
      navigate("/review");
    } catch (error) {
      console.error("Submission failed:", error);
      setMessage(`Submission failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // The createSignedUrl function was causing an infinite loop
  // You can fetch a signed URL when the image is displayed if needed
  // For now, it's removed to prevent the loop.

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 poppins-regular">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        {/*  <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Application Form
        </h2>
        {message && (
          <div
            className={`p-4 rounded-lg mb-4 text-sm font-medium ${
              message.includes("successfully")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )} */}

        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 poppins-extrabold">
            Application Form
          </h2>
          <div className="space-x-4">
            {" "}
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-br from-indigo-500 to-indigo-400 shadow-sm shadow-purple-500  hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-400 transition px-4 py-2 rounded-lg text-white font-medium"
            >
              Go to dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-br from-red-500 to-red-400 shadow-sm shadow-orange-400  hover:bg-red-600 hover:shadow-lg hover:shadow-red-400 transition px-4 py-2 rounded-lg text-white font-medium"
            >
              Logout
            </button>
          </div>
        </div>
        {message && (
          <div
            className={`p-4 rounded-lg mb-4 text-sm font-medium ${
              message.includes("successfully")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 shadow-sm"
            />
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name <span className="text-red-500">*</span>{" "}
              {formData.name.length < 1 ? (
                <span className="text-red-500 rounded-xl text-xs bg-slate-300/50 shadow-sm shadow-slate-300 px-2">
                  {" "}
                  Enter your Name{" "}
                </span>
              ) : (
                ``
              )}
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Contact */}
          <div>
            <label
              htmlFor="contact"
              className="block text-sm font-medium text-gray-700"
            >
              Contact <span className="text-red-500">*</span>
              {formData.contact.length < 10 ? (
                <span className="text-red-500 rounded-xl text-xs bg-slate-300/50 shadow-sm shadow-slate-300 px-2">
                  {" "}
                  Contact must be atleast 10 digits{" "}
                </span>
              ) : (
                ``
              )}
            </label>
            <input
              type="tel"
              name="contact"
              id="contact"
              maxLength={10}
              minLength={10}
              value={formData.contact}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* DOB and Age (side-by-side) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-gray-700"
              >
                Date of Birth <span className="text-red-500">*</span>{" "}
                {!formData.dob ? (
                  <span className="text-red-500 rounded-xl text-xs bg-slate-300/50 shadow-sm shadow-slate-300 px-2">
                    {" "}
                    Enter date of birth{" "}
                  </span>
                ) : (
                  ``
                )}
              </label>
              <input
                type="date"
                name="dob"
                id="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="age"
                className="block text-sm font-medium text-gray-700"
              >
                Age
              </label>
              <input
                type="text"
                name="age"
                id="age"
                value={formData.age}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 shadow-sm"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700"
            >
              Gender <span className="text-red-500">*</span>
              {!formData.gender ? (
                <span className="text-red-500 rounded-xl text-xs bg-slate-300/50 shadow-sm shadow-slate-300 px-2">
                  {" "}
                  Select gender{" "}
                </span>
              ) : (
                ``
              )}
            </label>
            <select
              name="gender"
              id="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Passport size photo */}
          <div className="space-y-2">
            <label
              htmlFor="photoFile"
              className="block text-sm font-medium text-gray-700"
            >
              Passport Size Photo (Max 1MB, JPG, PNG, GIF, PDF){" "}
              <span className="text-red-500">*</span>
            </label>

            {/* Conditionally render the image preview or the file input */}
            {photoUrl ? (
              <div className="flex items-center gap-4 p-3 border rounded-lg bg-green-50 border-green-300">
                {/* Image/Preview */}
                {photoUrl.endsWith(".pdf") ? (
                  <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded">
                    PDF
                  </div>
                ) : (
                  <img
                    src={signedURL}
                    alt="Uploaded file"
                    className="w-12 h-12 rounded object-cover border"
                  />
                )}
                {/* File info + actions */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    File Uploaded ({photoUrl.split("/").pop()})
                  </p>
                  <div className="flex gap-2 mt-1">
                    <label
                      htmlFor="photoFile"
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                    >
                      Change
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl(null);
                        setSignedURL(null);
                      }}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {/* Hidden input for re-upload */}
                <input
                  type="file"
                  id="photoFile"
                  name="photoFile"
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png, image/gif, application/pdf"
                  className="hidden"
                />
              </div>
            ) : (
              <input
                type="file"
                name="photoFile"
                id="photoFile"
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/gif, application/pdf"
                required
                className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
          </div>

          {/* District */}
          <div>
            <label
              htmlFor="district"
              className="block text-sm font-medium text-gray-700"
            >
              District (Maharashtra) <span className="text-red-500">*</span>
            </label>
            <select
              name="district"
              id="district"
              value={formData.district}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select District
              </option>
              {maharashtraDistricts.map((dist, index) => (
                <option key={index} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Highest Qualification */}
          <div>
            <label
              htmlFor="highestQualification"
              className="block text-sm font-medium text-gray-700"
            >
              Highest Qualification <span className="text-red-500">*</span>
              {!formData.highestQualification ? (
                <span className="text-red-500 rounded-xl text-xs bg-slate-300/50 shadow-sm shadow-slate-300 px-2">
                  {" "}
                  Describe your qualifications{" "}
                </span>
              ) : (
                ``
              )}
            </label>
            <textarea
              name="highestQualification"
              id="highestQualification"
              rows="3"
              value={formData.highestQualification}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              !isFormValid || isLoading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            }`}
          >
            {isLoading ? "Submitting..." : "Save & Proceed"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MultistepForm;
