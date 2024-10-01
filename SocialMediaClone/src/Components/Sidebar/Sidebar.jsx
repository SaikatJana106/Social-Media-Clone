import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Corrected import for useNavigate
import './sidebar.css'; // You can style as needed in CSS
import HomeIcon from '@mui/icons-material/Home';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PeopleIcon from '@mui/icons-material/People';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  
  useEffect(() => {
    const loggedInEmail = localStorage.getItem('loggedInEmail'); // Retrieve logged-in email from localStorage or context
    if (loggedInEmail) {
      // Fetch the user profile with the logged-in user's email
      fetch(`http://localhost:2000/userprofile?email=${encodeURIComponent(loggedInEmail)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => setProfile(data))
        .catch((error) => console.error('Error fetching profile:', error));
    }
  }, []); // Dependency array is empty to run once on mount

  const handleLogin = () => {
    navigate('/signUp');
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="logo">
        <img src="/images/logo.png" alt="Logo" />
      </div>

      {/* User Profile */}
      <div className="user-profile">
        <img
          src={profile.profile_pic || "default-profile-pic.jpg"} // Display profile picture or fallback to a default
          alt="User"
          className="profile-pic"
        />
        <div className="name-id">
        <h2 className="user-name">
          {profile.first_name + profile.last_name|| 'Guest'}
        </h2>
        <h2 className="user-name">
          {profile._uid|| 'id'}
        </h2>
        </div>
        

      </div>

      {/* Navigation Fields */}
      <nav className="nav-fields">
        <ul>
          {/* Home */}
          <div className="home-set">
            <HomeIcon />
            <li><Link to="/">Home</Link></li>
          </div>

          {/* Post */}
          <div className="home-set">
            <EditNoteIcon />
            <li><Link to="/post">Post</Link></li>
          </div>

          {/* Chat */}
          <div className="chat-set">
            <ChatBubbleOutlineIcon />
            <li><Link to="/chat">Chat</Link></li>
          </div>

          {/* Save Post */}
          <div className="savepost-set">
            <BookmarkIcon />
            <li><Link to="/savepost">Save Post</Link></li>
          </div>

          {/* Friends */}
          <div className="friend-set">
            <PeopleIcon />
            <li><Link to="/people">Friends</Link></li>
          </div>

          {/* Settings */}
          <div className="setting-set">
            <ManageAccountsIcon />
            <li><Link to="/setting">Setting</Link></li>
          </div>

          {/* Login/Logout Button */}
          <div className="setting-set">
            {localStorage.getItem('authToken') ? (
              <button onClick={() => { localStorage.removeItem('authToken');  localStorage.removeItem('loggedInEmail');window.location.replace('/'); }}>
                Logout
              </button>
            ) : (
              <button onClick={handleLogin}>Login</button>
            )}
          </div>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
