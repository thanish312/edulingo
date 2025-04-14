import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-zinc-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-300">
          Edulingo
        </Link>

        {/* Hamburger Menu for Mobile */}
        <button
          className="lg:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>

        {/* Menu Items */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } lg:flex lg:items-center lg:space-x-6`}
        >
          <Link to="/learn" className="hover:text-blue-400">
            Learn
          </Link>
         

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isAuthenticated && user ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-blue-500"
                />
              ) : (
                <span className="text-sm">Menu</span>
              )}
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-700 rounded-lg shadow-lg">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-300">
                      Signed in as <strong>{user.name}</strong>
                    </div>
                    <button
                      onClick={() =>
                        logout({ returnTo: window.location.origin })
                      }
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-zinc-600"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => loginWithRedirect()}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-zinc-600"
                  >
                    Log In
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;