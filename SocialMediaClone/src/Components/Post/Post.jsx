import React, { useState, useRef } from 'react';
import './post.css'; 
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios'; // Import axios for API requests

const Post = () => {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Keep the file object here
  const [inputText, setInputText] = useState({
      topic: '',
      tags: '',
  });

  const fileInputRef = useRef(null); // Create a ref for the file input

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputText({ ...inputText, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Store the file for upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Set the base64 image string for preview
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  const handleAddClick = () => {
    fileInputRef.current.click(); // Programmatically click the file input
  };

  const handleSubmit = async () => {
    // Ensure we have image, topic, and tags
    if (!inputText.topic && !inputText.tags && !imageFile) {
      alert("Please provide a topic, tags, and an image.");
      return;
    }

    // Create form data to send the file and text data
    const formData = new FormData();
    formData.append('topic', inputText.topic);
    formData.append('tag', inputText.tags); // Handle tags as a string, let the backend split it
    formData.append('image', imageFile); // Append the image file

    try {
      const response = await axios.post('http://localhost:2000/addpost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        alert('Post created successfully!');
        setInputText({ topic: '', tags: '' });
        setImage(null); // Reset image preview
      } else {
        alert('Failed to create post.');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('An error occurred while creating the post.');
    }
  };

  return (
    <div className="container">
      <input
        type="text"
        value={inputText.topic}
        onChange={handleInputChange}
        name="topic"
        placeholder='Write something from your mind'
      />
      <input
        type="text"
        value={inputText.tags}
        onChange={handleInputChange}
        name='tags'
        placeholder='Give tags'
      />
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageChange} 
        style={{ display: 'none' }} // Hide the file input
        ref={fileInputRef} // Attach the ref to the file input
      />
      <div className='image' onClick={handleAddClick} style={{ cursor: 'pointer' }}>
        <AddIcon />
        {image && (
          <img
            src={image}
            alt="image"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
          />
        )}
      </div>
      <button onClick={handleSubmit}>Submit</button> {/* Add a submit button */}
    </div>
  );
};

export default Post;
