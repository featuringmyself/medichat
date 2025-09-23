"use client";

import type React from "react";
import { Database } from "lucide-react";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  ImageIcon,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFileUpload = useCallback(
    (file: File) => {
      // Check file size (25MB limit)
      if (file.size > 25 * 1024 * 1024) {
        setError("File size exceeds 25MB limit");
        return;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Unsupported file type. Please use JPEG, PNG, GIF, WebP, or PDF"
        );
        return;
      }

      // Store file in sessionStorage and redirect
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size
      };
      sessionStorage.setItem('uploadFile', JSON.stringify(fileData));
      
      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem('uploadFileData', reader.result as string);
        router.push(`/results?loading=true&filename=${encodeURIComponent(file.name)}`);
      };
      reader.readAsDataURL(file);
    },
    [router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };



  const handleSamplePrescription = () => {
    router.push('/results?loading=true&filename=sample.png');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-0 sm:px-6 lg:px-8">
      <Card className="p-3 sm:p-8 lg:p-12 bg-white/60 backdrop-blur-xl border border-purple-100/50 shadow-2xl rounded-2xl sm:rounded-3xl">
        <div
          className={`relative transition-all duration-500 ease-out ${
            dragActive ? "upload-luxury scale-105" : "upload-luxury"
          } rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-6 sm:space-y-8">
                <div className="relative">
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-purple-200/20 rounded-2xl sm:rounded-3xl luxury-glow">
                    <Upload className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary float-elegant" />
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 max-w-2xl px-4 sm:px-0">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 font-serif">
                    Upload Your Prescription
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-balance text-gray-600 leading-relaxed">
                    Drag and drop your prescription image or PDF here, or click
                    to browse files. Our AI will analyze it instantly and
                    provide comprehensive insights.
                  </p>
                  <div className="inline-flex items-center space-x-2 bg-emerald-50 px-3 sm:px-4 py-2 rounded-full border border-emerald-200">
                    <Database className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                    <span className="text-xs sm:text-sm text-emerald-700 font-medium">
                      <span className="hidden sm:inline">
                        Processed instantly • Never stored • Complete privacy
                      </span>
                      <span className="sm:hidden">Secure & Private</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 lg:gap-8 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center space-x-1 sm:space-x-2 bg-white/50 px-2 sm:px-4 py-2 rounded-full">
                    <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary" />
                    <span className="font-medium">JPG, PNG</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 bg-white/50 px-2 sm:px-4 py-2 rounded-full">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary" />
                    <span className="font-medium">PDF</span>
                  </div>
                  <div className="bg-white/50 px-2 sm:px-4 py-2 rounded-full">
                    <span className="font-medium">Max 25MB</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 w-full sm:w-auto items-center">
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <div className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 luxury-glow w-full sm:w-auto rounded-2xl">
                        <span className="sm:hidden">Choose File</span>
                        <span className="hidden sm:inline">
                          Choose File to Analyze
                        </span>
                      </div>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 luxury-glow w-full sm:w-auto"
                    >
                      <span className="sm:hidden">Choose File</span>
                      <span className="hidden sm:inline">
                        Choose File to Analyze
                      </span>
                    </Button>
                  </SignedIn>
                  <div className="flex flex-col items-center space-y-1">
                    <Button
                      onClick={handleSamplePrescription}
                      variant="outline"
                      size="lg"
                      className="border-primary text-primary hover:bg-primary hover:text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto"
                    >
                      Try Sample
                    </Button>
                    <span className="text-xs text-gray-500">No signup required</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpeg,.jpg,.png,.gif,.webp,.pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
        </div>
      </Card>

      {error && (
        <div className="mt-4 sm:mt-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="mt-6 sm:mt-8 text-center px-4 sm:px-0">
        <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-purple-100/30">
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-600 font-medium">
            <span className="hidden sm:inline">
              Your medical information is processed securely and privately
            </span>
            <span className="sm:hidden">Secure & private processing</span>
          </span>
        </div>
      </div>
    </div>
  );
}
