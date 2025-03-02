import React from 'react';

const PhotoGallery: React.FC = () => {
  const photos = [
    // Array of photo URLs
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.map((photo: string, index: number) => (
        <img key={index} src={photo} alt={`Photo ${index}`} className="w-full h-auto" />
      ))}
    </div>
  );
};

export default PhotoGallery;