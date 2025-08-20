"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Upload,
  FileText,
  MessageSquare,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export function InteractiveDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const steps = [
    {
      title: "Upload Prescription",
      icon: Upload,
      content: "Take a photo or upload your prescription document",
    },
    {
      title: "AI Analysis",
      icon: FileText,
      content: "Our AI reads and analyzes the prescription details",
    },
    {
      title: "Get Insights",
      icon: MessageSquare,
      content: "Receive clear explanations and personalized guidance",
    },
  ];

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
    async (file: File) => {
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

      setIsProcessing(true);
      setError(null);
      setUploadedFile(file);
      setActiveStep(1); // Move to analysis step

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/ai", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        // Move to insights step and then redirect
        setActiveStep(2);
        setTimeout(() => {
          const encodedResult = encodeURIComponent(data.result);
          const encodedFileName = encodeURIComponent(file.name);
          router.push(
            `/results?analysis=${encodedResult}&filename=${encodedFileName}`
          );
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setIsProcessing(false);
        setActiveStep(0);
      }
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

  const handleSamplePrescription = async () => {
    setError(null);

    try {
      // Fetch the sample image from public directory
      const response = await fetch("/prescription.png");
      const blob = await response.blob();
      const file = new File([blob], "sample.png", { type: "image/png" });

      // Process the sample file
      await handleFileUpload(file);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process sample prescription"
      );
    }
  };

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl text-slate-900 mb-4">
            See MediChat in Action
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Experience how our AI transforms complex medical information into
            clear, actionable insights
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Demo Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card
                  key={index}
                  className={`p-6 cursor-pointer transition-all duration-300 ${
                    activeStep === index
                      ? /* Updated active state colors from blue to purple theme */ "border-primary bg-primary/10 shadow-lg"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        activeStep === index
                          ? /* Updated active background from blue to primary */ "bg-primary"
                          : "bg-slate-100"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          activeStep === index ? "text-white" : "text-slate-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-slate-900">
                        {step.title}
                      </h3>
                      <p className="text-slate-600">{step.content}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Right Side - Interactive Output */}
          <div
            className={`bg-slate-50 rounded-2xl p-8 border border-slate-200 transition-all duration-300 ${
              dragActive ? "border-primary bg-primary/5" : ""
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {activeStep === 0 && (
              <div className="text-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-12 h-12 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-xl mb-4">
                  Upload Your Prescription
                </h3>
                <p className="text-slate-600 mb-6">
                  Drag and drop or click to upload your prescription image
                </p>
                {uploadedFile && !isProcessing ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-2 text-emerald-600 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">{uploadedFile.name}</span>
                    </div>
                  </div>
                ) : null}
                <div className="flex justify-center space-x-4">
                  <SignedIn>
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Choose File"}
                    </Button>
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <span className="bg-primary hover:bg-primary/90 text-white px-3 flex items-center rounded-md font-medium">Choose File</span>
                    </SignInButton>
                  </SignedOut>
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                    onClick={handleSamplePrescription}
                    disabled={isProcessing}
                  >
                    Try Sample
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpeg,.jpg,.png,.gif,.webp,.pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            )}

            {activeStep === 1 && (
              <div className="text-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full"></div>
                </div>
                <h3 className="font-serif font-bold text-xl mb-4">
                  AI Analysis in Progress
                </h3>
                {uploadedFile && (
                  <p className="text-slate-600 mb-6">
                    Analyzing{" "}
                    <span className="font-medium">{uploadedFile.name}</span>...
                  </p>
                )}
                <div className="space-y-4 text-left max-w-sm mx-auto">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700">
                      Reading prescription text...
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700">
                      Identifying medications...
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-slate-700">
                      Analyzing dosage and instructions...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="font-serif font-bold text-xl mb-2">
                    Analysis Complete!
                  </h3>
                  <p className="text-slate-600">
                    Redirecting to detailed results...
                  </p>
                </div>
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
                    <p className="text-slate-700 mb-3">
                      <strong>Analysis Preview:</strong> Your prescription has
                      been successfully processed. You&apos;ll see detailed
                      medication information, dosage instructions, and
                      personalized insights.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <Info className="w-4 h-4" />
                      <span>Full results loading...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
