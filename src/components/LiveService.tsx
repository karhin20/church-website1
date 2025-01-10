import React from 'react';

export const LiveService = () => {
  return (
    <div className="live-service p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold">Live Service</h3>
      <iframe 
        height="150" 
        width="100%" 
        style={{ border: 'none' }} 
        scrolling="no" 
        data-name="pb-iframe-player" 
        referrerPolicy="no-referrer-when-downgrade" 
        src="https://www.podbean.com/live-player/?channel_id=WXPoH0puz9" 
        allowFullScreen
      ></iframe>
    </div>
  );
}; 