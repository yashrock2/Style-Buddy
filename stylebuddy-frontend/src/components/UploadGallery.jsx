import React, { useRef, useState } from "react";
import {
  UploadCloud,
  Camera,
  ImagePlus,
  X,
  ArrowUp,
} from "lucide-react";

import { Button } from "./UI";

export default function UploadGallery({ onUpload }) {
  const input = useRef();
  const camera = useRef();

  const [files, setFiles] = useState([]);

  const add = (event) => {
    const incoming = [...event.target.files].filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      )
    );

    setFiles((current) => [...current, ...incoming]);

    event.target.value = "";
  };

  const remove = (index) => {
    setFiles((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const incoming = [...event.dataTransfer.files].filter(
      (file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(
          file.type
        )
    );

    setFiles((current) => [...current, ...incoming]);
  };

  return (
    <div className="upload-box">
      <div className="upload-icon">
        <UploadCloud />
      </div>

      <h2>Upload from Gallery</h2>

      <p>
        Bring your wardrobe into StyleBuddy. Add multiple
        photos at once.
      </p>

      <div className="upload-actions">
        <Button
          className="btn-dark"
          onClick={() => input.current.click()}
        >
          <ImagePlus size={18} />
          Choose from Gallery
        </Button>

        <Button
          className="btn-outline"
          onClick={() => camera.current.click()}
        >
          <Camera size={18} />
          Take a Photo
        </Button>
      </div>

      <div
        className="dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <UploadCloud size={20} />

        <span>Drag & drop images here</span>

        <small>
          JPG, JPEG, PNG or WEBP · Multiple files supported
        </small>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={add}
      />

      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={add}
      />

      {files.length > 0 && (
        <>
          <div className="thumb-grid">
            {files.map((file, index) => (
              <div
                className="thumb"
                key={`${file.name}-${index}`}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                />

                <button
                  type="button"
                  onClick={() => remove(index)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <Button
            className="btn-dark full"
            onClick={() => onUpload(files)}
          >
            <ArrowUp size={17} />

            Upload{" "}
            {files.length === 1
              ? "1 item"
              : `${files.length} items`}
          </Button>
        </>
      )}
    </div>
  );
}