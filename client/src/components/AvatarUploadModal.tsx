import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X, Crop as CropIcon, Check, Loader2 } from "lucide-react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface AvatarUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => Promise<boolean>;
}

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
    const [imgSrc, setImgSrc] = useState<string>("");
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    
    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImgSrc(reader.result?.toString() || "");
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        
        const cropConfig = centerCrop(
            makeAspectCrop(
                {
                    unit: "%",
                    width: 80,
                },
                1,
                width,
                height
            ),
            width,
            height
        );
        setCrop(cropConfig);
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImgSrc(reader.result?.toString() || "");
            });
            reader.readAsDataURL(e.dataTransfer.files[0]);
        }
    }, []);

    const handleUpload = async () => {
        if (!completedCrop || !imgRef.current) return;

        setIsUploading(true);

        const canvas = document.createElement("canvas");
        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        const pixelRatio = window.devicePixelRatio || 1;
        
        canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
        canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            setIsUploading(false);
            return;
        }

        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingQuality = "high";

        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;
        const cropWidth = completedCrop.width * scaleX;
        const cropHeight = completedCrop.height * scaleY;

        ctx.drawImage(
            image,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            cropWidth,
            cropHeight
        );

        canvas.toBlob(async (blob) => {
            if (!blob) {
                setIsUploading(false);
                return;
            }
            const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
            const success = await onUpload(file);
            setIsUploading(false);
            if (success) {
                handleCloseModal();
            }
        }, "image/jpeg", 0.95);
    };

    const handleCloseModal = () => {
        setImgSrc("");
        setCrop(undefined);
        setCompletedCrop(undefined);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/60">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-[#0f1423] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                {imgSrc ? <CropIcon className="w-5 h-5 text-indigo-400" /> : <UploadCloud className="w-5 h-5 text-indigo-400" />}
                                {imgSrc ? "Crop Profile Picture" : "Upload Profile Picture"}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                disabled={isUploading}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {!imgSrc ? (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ease-in-out ${
                                        dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/[0.02] hover:border-indigo-400/50 hover:bg-white/[0.04]"
                                    }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg, image/jpg, image/png, image/webp"
                                        className="hidden"
                                        onChange={onSelectFile}
                                    />
                                    <motion.div
                                        initial={{ y: 0 }}
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    >
                                        <div className="w-16 h-16 mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 ring-4 ring-indigo-500/10">
                                            <UploadCloud className="w-8 h-8" />
                                        </div>
                                    </motion.div>
                                    <p className="text-sm font-medium text-white mb-1">Click to select or drag and drop</p>
                                    <p className="text-xs text-slate-400">SVG, PNG, JPG or WEPG (max. 5MB)</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="relative w-full rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center min-h-[250px] max-h-[350px]">
                                        <ReactCrop
                                            crop={crop}
                                            onChange={(c) => setCrop(c)}
                                            onComplete={(c) => setCompletedCrop(c)}
                                            aspect={1}
                                            circularCrop
                                        >
                                            <img
                                                ref={imgRef}
                                                src={imgSrc}
                                                alt="Crop Preview"
                                                onLoad={onImageLoad}
                                                style={{ maxHeight: '350px', width: 'auto', objectFit: 'contain' }}
                                            />
                                        </ReactCrop>
                                    </div>
                                </div>
                            )}
                        </div>

                        {imgSrc && (
                            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex gap-3">
                                <button
                                    onClick={() => setImgSrc("")}
                                    disabled={isUploading}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!completedCrop?.width || !completedCrop?.height || isUploading}
                                    className="flex-[2] py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:bg-indigo-600/50 shadow-lg shadow-indigo-600/20"
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {isUploading ? "Uploading..." : "Save Picture"}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};