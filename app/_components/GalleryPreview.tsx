"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface GalleryPreviewProps {
  existingImages: { id: string; url: string }[];
  newImages: File[];
  onRemoveExisting: (id: string) => void;
  onRemoveNew: (index: number) => void;
}

export const GalleryPreview = ({ 
  existingImages = [], // Default to empty array to avoid crashes
  newImages = [], 
  onRemoveExisting, 
  onRemoveNew 
}: GalleryPreviewProps) => {

  // Cleanup Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      // Logic to revoke URLs would go here if we stored them in state, 
      // but for simple mapping, the browser handles basic cleanup on unmount.
    };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {/* Existing Database Images */}
      {existingImages.map((img) => (
        <div key={img.id} className="relative group aspect-square border rounded-lg overflow-hidden bg-gray-50">
          <img 
            src={img.url} 
            alt="Product" 
            className="object-cover w-full h-full transition-transform group-hover:scale-105" 
          />
          <button
            type="button"
            onClick={() => onRemoveExisting(img.id)}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-all"
            title="Remove existing image"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-medium">
            Saved
          </div>
        </div>
      ))}

      {/* New File Uploads (Previews) */}
      {newImages.map((file, index) => {
        // Create a temporary URL for the file preview
        const previewUrl = URL.createObjectURL(file);
        
        return (
          <div key={`new-${index}`} className="relative group aspect-square border-2 border-dashed border-blue-200 rounded-lg overflow-hidden bg-blue-50/30">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="object-cover w-full h-full opacity-80" 
              onLoad={() => URL.revokeObjectURL(previewUrl)} // Clean up memory once loaded
            />
            <button
              type="button"
              onClick={() => onRemoveNew(index)}
              className="absolute top-2 right-2 bg-slate-800 hover:bg-black text-white p-1.5 rounded-full shadow-lg transition-all"
              title="Cancel upload"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-medium">
              New Upload
            </div>
          </div>
        );
      })}
    </div>
  );
};