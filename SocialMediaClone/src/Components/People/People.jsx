import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import './people.css'; // Import the CSS file

const People = ({ userId }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch all users from the server
    fetch('http://localhost:2000/getPeople')
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error));
  }, []);

  const handleSendRequest = (receiverId) => {
    fetch('http://localhost:2000/sendFriendRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ senderId: userId, receiverId }), // send userId and receiverId
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message); // Show alert on successful request
      })
      .catch((error) => console.error('Error sending friend request from:', error));
  };

  return (
    <div className="people-container">
      {users.map((user, index) => (
        <div key={index} className="people-card">
          <img 
            className="profile-pic"
            src={user.profile_pic || './images/default_image.png'} 
            alt="Profile Pic"
          />
          <div className="card-details">
            <h5 className="card-title">
              {user.first_name + ' ' + user.last_name || 'No Name'}
            </h5>
            <p className="card-text">{user._uid || 'No ID Available'}</p>
            <Button className="connect-button" variant="primary" onClick={() => handleSendRequest(user._uid)}>
              Connect
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default People;
