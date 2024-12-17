import React from 'react';
import './Loading.css'; // Import the CSS file for styles

const Loading: React.FC = () => {
  return (
    <div className="loading">
      <div className="spinner"></div> {/* Spinner element */}
      <p>Loading...</p>
    </div>
  );
};

export default Loading; 