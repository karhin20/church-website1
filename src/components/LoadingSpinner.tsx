import './LoadingSpinner.css'; // Import the CSS file

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="loader"></div>
    </div>
  );
};

export default LoadingSpinner;