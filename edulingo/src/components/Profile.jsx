// src/components/Profile.jsx
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div className="text-center text-gray-400">Loading...</div>;
  }

  return (
    isAuthenticated && (
      <div className="flex items-center space-x-4 bg-zinc-800 p-4 rounded-lg shadow-lg">
        <img
          src={user.picture}
          alt={user.name}
          className="w-12 h-12 rounded-full border-2 border-blue-500"
        />
        <div>
          <h2 className="text-lg font-semibold text-blue-300">{user.name}</h2>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
      </div>
    )
  );
};

export default Profile;