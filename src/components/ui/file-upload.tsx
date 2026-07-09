"use client";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/orderStore";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Loader2, X } from "lucide-react";
import Image from "next/image";

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export type ImageUploadFolder = "menu-items" | "appetizers" | "recipes";

interface ImageFileUploadProps {
  /** Current Cloudinary image URL, if any. */
  value?: string | null;
  /** Called with the Cloudinary secure URL + publicId once upload succeeds. */
  onUploaded: (result: { url: string; publicId: string }) => void;
  /** Cloudinary destination folder — must match the backend's allowed enum. */
  folder: ImageUploadFolder;
  className?: string;
}

export const FileUpload = ({ value, onUploaded, folder, className }: ImageFileUploadProps) => {
  const adminAccessToken = useOrderStore((s) => s.adminAccessToken);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!adminAccessToken) {
      setError("You must be signed in to upload images.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", folder);

      const res = await fetch("/api/uploads/image", {
        method: "POST",
        headers: { Authorization: `Bearer ${adminAccessToken}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to upload image.");
        return;
      }
      onUploaded({ url: data.url, publicId: data.publicId });
    } catch {
      setError("Network error — could not upload image.");
    } finally {
      setUploading(false);
    }
  }

  const handleFileChange = (newFiles: File[]) => {
    const file = newFiles[0];
    if (file) uploadFile(file);
  };

  const handleClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    accept: { "image/png": [], "image/jpeg": [], "image/webp": [], "image/avif": [] },
    onDrop: handleFileChange,
    onDropRejected: (rejections) => {
      setError(rejections[0]?.errors[0]?.message ?? "That file can't be uploaded.");
    },
  });

  return (
    <div className={cn("w-full", className)} {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="group/file relative block w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-brand-warm-gray hover:border-brand-orange/50 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />

        {!value && (
          <div className="absolute inset-0 mask-[radial-gradient(ellipse_at_center,white,transparent)]">
            <GridPattern />
          </div>
        )}

        <div className="relative flex flex-col items-center justify-center min-h-40 p-4">
          {value ? (
            <div className="relative w-full h-40 rounded-xl overflow-hidden">
              <Image src={value} alt="Uploaded" fill sizes="400px" className="object-cover" unoptimized />
              {!uploading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/file:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <IconUpload className="h-5 w-5 text-white" />
                  <span className="font-sans text-xs text-white font-semibold">Change Image</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="relative z-20 font-sans text-sm font-bold text-brand-brown">
                Upload image
              </p>
              <p className="relative z-20 mt-1 font-sans text-xs font-normal text-brand-brown-mid text-center">
                Drag and drop, or click to choose a file
              </p>
              <div className="relative mx-auto mt-6 w-full max-w-32">
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn(
                    "relative z-40 mx-auto flex h-24 w-24 items-center justify-center rounded-md bg-white group-hover/file:shadow-2xl",
                    "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]",
                  )}
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center text-neutral-600"
                    >
                      Drop it
                      <IconUpload className="h-4 w-4 text-neutral-600" />
                    </motion.p>
                  ) : (
                    <IconUpload className="h-4 w-4 text-neutral-600" />
                  )}
                </motion.div>
                <motion.div
                  variants={secondaryVariant}
                  className="absolute inset-0 z-30 mx-auto flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-sky-400 bg-transparent opacity-0"
                />
              </div>
            </>
          )}

          {uploading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-white/80 rounded-2xl">
              <Loader2 className="w-5 h-5 text-brand-orange animate-spin" />
              <span className="font-sans text-xs text-brand-brown-mid">Uploading…</span>
            </div>
          )}
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 mt-2">
          <p className="font-sans text-xs text-red-500 flex-1">{error}</p>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-600 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex shrink-0 scale-105 flex-wrap items-center justify-center gap-x-px gap-y-px bg-gray-100">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`flex h-10 w-10 shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50"
                  : "bg-gray-50 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset]"
              }`}
            />
          );
        }),
      )}
    </div>
  );
}
