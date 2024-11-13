// src/components/MediaGrid.js
import React from 'react';

const MediaGrid = ({ items }) => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {items.map((item, index) => (
        <div key={index} className="border rounded p-4">
          <h3 className="font-bold">{item.title}</h3>
          <p>Type: {item.type}</p>
          {item.type === 'song' && (
            <audio controls src={item.path} className="w-full mt-2" />
          )}
          {(item.type === 'meme' || item.type === 'gif') && (
            <img src={item.path} alt={item.title} className="w-full mt-2" />
          )}
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;
