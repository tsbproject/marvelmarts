// app/dashboard/admins/categories/_components/CategoryIconUpload.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react"; // Import Loader2

export default function CategoryIconUpload({ 
  initialValue, 
  onChange 
}: { 
  initialValue?: string, 
  onChange: (url: string) => void 
}) {
  const [preview, setPreview] = useState(initialValue || "");
  const [isUploading, setIsUploading] = useState(false); // Track upload status

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setIsUploading(true); // Start loading

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "marvelmartsupload"); 

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dq0vynxci/upload`, 
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Cloudinary Error: ${errorData.error?.message || "Unknown Error"}`);
        setPreview(initialValue || ""); // Reset on error
        return;
      }

      const data = await res.json();

      if (data.secure_url) {
        setPreview(data.secure_url);
        onChange(data.secure_url); // Update the parent form state
      }
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setIsUploading(false); // Stop loading
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange(""); // Clear the value in the parent form
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        Category Imagery {isUploading && <span className="text-blue-500 animate-pulse ml-2">(Uploading...)</span>}
      </label>
      
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group">
          {preview ? (
            <>
              <Image 
                src={preview} 
                alt="Preview" 
                fill 
                className={`object-cover transition-opacity ${isUploading ? 'opacity-40' : 'opacity-100'}`} 
              />
              
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-blue-600" size={20} />
                </div>
              ) : (
                <button 
                  type="button" // Prevents accidental form submission
                  onClick={handleRemove}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="text-white" size={20} />
                </button>
              )}
            </>
          ) : (
            <UploadCloud className="text-gray-300" size={24} />
          )}
          
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
            onChange={handleUpload}
            accept="image/*"
            disabled={isUploading}
          />
        </div>
        
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-bold uppercase italic">Tactical Guidelines:</p>
          <ul className="text-[10px] text-gray-400 list-disc list-inside mt-1 font-medium">
            <li>Permanent Cloudinary Storage</li>
            <li>Square aspect ratio (1:1)</li>
            <li>Max file size: 2MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}