import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import './home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch all products from the server
    fetch('http://localhost:2000/getpost')
      .then((response) => response.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error('Error fetching all products:', error));
  }, []);

  return (
    <div className="scrollable-container">
      {posts.map((item,index) => (
        <Card key={index} className="post-card">
          <Card.Img variant="top" className="card-img-top" src={item.image} />
          <Card.Body>
            <Card.Text>{item.topic}</Card.Text>
            <Card.Title>{item.tag.join(', ')}</Card.Title>
          </Card.Body>
          <Card.Body>
            <FavoriteBorderIcon className="favorite-icon" />
            <BookmarkBorderIcon className="bookmark-icon" />
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default Home;
