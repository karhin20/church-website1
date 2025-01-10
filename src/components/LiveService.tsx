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
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h4 className="text-md font-semibold">Contribute to God's Work</h4>
        <p>MOMO NUMBER: <strong>0597672546</strong></p>
        <p>ACCOUNT NAME: <strong>THE TAC AHWC NII BOIMAN</strong></p>
      </div>
    </div>
  );
}; 