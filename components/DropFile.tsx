"use client";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function DropFile() {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFile = async (file: File) => {
        // Check file size (25MB limit)
        if (file.size > 25 * 1024 * 1024) {
            setError("File size exceeds 25MB limit");
            return;
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError("Unsupported file type. Please use JPEG, PNG, GIF, WebP, or PDF");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/ai', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            // Redirect to results page with the analysis
            const encodedResult = encodeURIComponent(data.result);
            const encodedFileName = encodeURIComponent(file.name);
            router.push(`/results?analysis=${encodedResult}&filename=${encodedFileName}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSamplePrescription = async () => {
        setIsUploading(true);
        setError(null);

        try {
            // Fetch the sample image from public directory
            const response = await fetch('/prescription.png');
            const blob = await response.blob();
            const file = new File([blob], 'sample.png', { type: 'image/png' });
            
            // Process the sample file
            const formData = new FormData();
            formData.append('file', file);

            const aiResponse = await fetch('/api/ai', {
                method: 'POST',
                body: formData
            });

            const data = await aiResponse.json();

            if (!aiResponse.ok) {
                throw new Error(data.error || 'Processing failed');
            }

            // Redirect to results page with the analysis
            const encodedResult = encodeURIComponent(data.result);
            const encodedFileName = encodeURIComponent('Sample Prescription');
            router.push(`/results?analysis=${encodedResult}&filename=${encodedFileName}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process sample prescription');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    return (
        <div className="space-y-4">
            <div
                className={`bg-[#FDF6FE] h-[40vh] w-[60vh] outline-dashed rounded-xl flex flex-col items-center justify-center gap-4 leading-tight transition-colors ${isDragging ? 'bg-purple-50 outline-purple-400' : 'outline-gray-300'
                    } ${isUploading ? 'opacity-50' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpeg,.jpg,.png,.gif,.webp,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.3339 21.3327L16.0006 15.9993M16.0006 15.9993L10.6673 21.3327M16.0006 15.9993V27.9993M27.1873 24.5193C28.4877 23.8104 29.515 22.6885 30.1071 21.3308C30.6991 19.9732 30.8222 18.457 30.4569 17.0216C30.0915 15.5862 29.2586 14.3134 28.0895 13.4039C26.9204 12.4945 25.4817 12.0003 24.0006 11.9993H22.3206C21.917 10.4383 21.1648 8.98913 20.1205 7.76067C19.0762 6.53222 17.767 5.55648 16.2914 4.90682C14.8157 4.25717 13.212 3.95049 11.6007 4.00986C9.9895 4.06922 8.41268 4.49308 6.98882 5.24957C5.56497 6.00606 4.33114 7.07549 3.38008 8.37746C2.42903 9.67943 1.78551 11.1801 1.49789 12.7665C1.21028 14.353 1.28606 15.9841 1.71954 17.537C2.15302 19.09 2.93291 20.5245 4.00059 21.7327" stroke="#90119B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <div className="leading-tight text-center rounded">
                    <h4 className="text-xl font-medium">
                        {isUploading ? 'Processing...' : 'Drop file or browse'}
                    </h4>
                    <p className="font-light text-lg mt-1">Format: .jpeg, .png, .pdf & Max file size: 25 MB</p>
                    <div className="flex gap-3 mt-8 justify-center">
                        <Button
                            className="bg-[#90119B] px-4 py-2 text-white font-medium"
                            onClick={handleBrowseClick}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Processing...' : 'Browse Files'}
                        </Button>
                        <Button
                            variant="outline"
                            className="border-[#90119B] text-[#90119B] px-4 py-2 font-medium hover:bg-[#90119B] hover:text-white"
                            onClick={handleSamplePrescription}
                            disabled={isUploading}
                        >
                            Try Sample
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}


        </div>
    )
}