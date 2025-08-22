import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

function OCRUploader({ onExtractedText, onImageChange }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (onImageChange) onImageChange(file);
  };

  const handleOCR = () => {
    if (!image) return;
    setLoading(true);
    Tesseract.recognize(
      image,
      'eng',
      { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
      setLoading(false);
      if (onExtractedText) onExtractedText(text);
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="my-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button type="button" onClick={handleButtonClick} className="bg-primary text-white px-4 py-2 rounded hover:bg-black transition-colors">
        Choose Image
      </button>
      <button 
        onClick={handleOCR} 
        disabled={!image || loading} 
        className="ml-2 bg-primary text-white px-4 py-2 rounded hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Extract Text'}
      </button>
    </div>
  );
}

export default OCRUploader;
