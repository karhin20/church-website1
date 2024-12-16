import '../styles/LoadingSpinner.css'; 

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="loader"></div>
    </div>
  );
};

export default LoadingSpinner;