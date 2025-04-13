// src/components/Profile.jsx
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  // Note: isLoading should be checked before isAuthenticated or accessing user
  const { user, isAuthenticated, isLoading } = useAuth0();

  // While the SDK is loading, display a loading message or spinner
  if (isLoading) {
    return <div className="text-sm text-gray-300">Loading user...</div>;
  }

  // Only render the profile information if the user is authenticated
  return (
    isAuthenticated && user && ( // Added 'user' check for extra safety
      <div className="flex items-center space-x-3">
        <img
            src={user.picture}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-gray-300" // Example styling
         />
        {/* Optionally display name/email */}
        {/* <span className="text-sm font-medium hidden sm:block">{user.name}</span> */}
        {/* <span className="text-xs text-gray-300 hidden md:block">{user.email}</span> */}
      </div>
    )
  );
};

export default Profile;