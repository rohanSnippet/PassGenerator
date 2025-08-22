import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';



const Dashboard = () => {
  const { session, supabase, handleLogout, getUserProfile } = useAuth();
  const navigate = useNavigate();
  const user = session?.user;
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user?.id) {
      getUserProfile(user.id).then(setProfile);
    }
  }, [user]);

  console.log(profile);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to the Dashboard!</h2>
        {user && (
          <p className="text-lg text-gray-600 mb-6">
            You are logged in as{' '}
            <span className="font-semibold text-blue-600">{user.email}</span>
          </p>
        )}
        <p>{profile?.is_form_submitted ? "Download your pass": "Register for the event"}</p>
        <p className="text-gray-700 mb-8">
          This page is protected and can only be viewed by authenticated users.
        </p>

        {/* Corrected Button Logic */}
        {profile?.is_form_submitted ? (
          <button
            onClick={() => navigate('/download-pdf')} // ✅ go to review/print page
            className="w-full py-2 px-4 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-400 transition duration-300"
          >
            Print
          </button>
        ) : (
          <button
            onClick={() => navigate('/multistep-form')} // ✅ go to registration form
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-400 transition duration-300"
          >
            Register
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
