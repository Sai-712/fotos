import React, { useState } from 'react';
import axios from 'axios';
import { s3Client, rekognitionClient, S3_BUCKET_NAME } from '../config/aws';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { SearchFacesByImageCommand } from '@aws-sdk/client-rekognition';

const UploadSelfie = () => {
    const [selfie, setSelfie] = useState<File | null>(null);
    const [matchedImages, setMatchedImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelfie(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const uploadToS3 = async (file: File, fileName: string) => {
        const command = new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: `selfies/${fileName}`,
            Body: file,
            ContentType: file.type,
        });

        await s3Client.send(command);
        return fileName;
    };

    const searchFacesByImage = async (fileName: string) => {
        const command = new SearchFacesByImageCommand({
            CollectionId: 'fotos-faces',
            Image: {
                S3Object: {
                    Bucket: S3_BUCKET_NAME,
                    Name: `selfies/${fileName}`,
                },
            },
            MaxFaces: 10,
            FaceMatchThreshold: 90,
        });

        const response = await rekognitionClient.send(command);
        return response.FaceMatches?.map(match => {
            const imageId = match.Face?.ExternalImageId;
            return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/uploads/${imageId}`;
        }) || [];
    };

    const handleUpload = async () => {
        if (!selfie) {
            alert("Please select a selfie to upload.");
            return;
        }

        setIsUploading(true);
        try {
            const fileName = `${Date.now()}-${selfie.name}`;
            await uploadToS3(selfie, fileName);
            const matchedUrls = await searchFacesByImage(fileName);
            setMatchedImages(matchedUrls);
        } catch (error) {
            console.error('Error uploading selfie:', error);
            alert("Error uploading selfie. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Selfie</h2>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="selfie-upload" className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-gray-300 border-dashed cursor-pointer hover:border-indigo-600 hover:bg-gray-50">
                            <div className="flex flex-col items-center">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Selfie preview"
                                        className="w-32 h-32 object-cover rounded-full mb-4"
                                    />
                                ) : (
                                    <svg className="w-8 h-8 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )}
                                <p className="mt-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Take a clear selfie for best results
                                </p>
                            </div>
                            <input
                                id="selfie-upload"
                                type="file"
                                className="hidden"
                                onChange={handleSelfieChange}
                                accept="image/*"
                                capture="user"
                            />
                        </label>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !selfie}
                        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Selfie'}
                    </button>
                </div>

                {matchedImages.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Matched Images</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {matchedImages.map((url, index) => (
                                <div key={index} className="aspect-w-1 aspect-h-1">
                                    <img
                                        src={url}
                                        alt={`Matched face ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {matchedImages.length === 0 && !isUploading && selfie && (
                    <p className="mt-4 text-sm text-gray-600 text-center">
                        No matched faces found
                    </p>
                )}
            </div>
        </div>
    );
};

export default UploadSelfie;