import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection, DropzoneOptions } from 'react-dropzone';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { Controller, Control, FieldValues, Path, RegisterOptions, FieldPath } from 'react-hook-form';
import { Iconify } from '../iconify';

interface ImageUploadFieldProps<TFieldValues extends FieldValues> {
    name: Path<TFieldValues>;
    control: Control<TFieldValues>;
    label: string;
    rules?: Omit<RegisterOptions<TFieldValues, FieldPath<TFieldValues>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    maxSize?: number;
    acceptedFileTypes?: string[];
    existingImagesUrl?: string[];
    error?: boolean;
    helperText?: string;
    onRemoveImage?: (imagePath: string) => void;
}

export const ImageUploadField = <TFieldValues extends FieldValues>({
    name,
    control,
    label,
    rules,
    maxSize = 10 * 1024 * 1024,
    acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif'],
    existingImagesUrl,
    error,
    helperText,
    onRemoveImage
}: ImageUploadFieldProps<TFieldValues>) => {
    const [preview, setPreview] = useState<string[] | null>(existingImagesUrl || null);
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[], onChange: (value: string | null) => void) => {
            if (fileRejections.length > 0) {
                // You might want to set an error state here or handle it differently
                return;
            }

            const file = acceptedFiles[0];
            if (file) {
                setLoading(true);
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    const cleanedResult = removeBase64Prefix(result);
                    setPreview([result]); // Keep the full data URL for preview
                    onChange(cleanedResult); // Save the cleaned version to the form
                    setLoading(false);
                };
                reader.readAsDataURL(file);
            }
        },
        []
    );

    const removeBase64Prefix = (dataUrl: string): string => {
        const regex = /^data:image\/[a-z]+;base64,/;
        return dataUrl.replace(regex, '');
    };

    const removeImage = (onChange: (value: null) => void) => {
        setPreview(null);
        onChange(null);
    };

    const handleRemoveExistingImage = (imageUrl: string) => {
        if (onRemoveImage) {
            onRemoveImage(imageUrl);
        }
    };

    return (
        <Controller<TFieldValues>
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value } }) => {
                const dropzoneOptions: DropzoneOptions = {
                    onDrop: (acceptedFiles, fileRejections) => onDrop(acceptedFiles, fileRejections, onChange),
                    maxSize: maxSize,
                    accept: acceptedFileTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
                };

                const { getRootProps, getInputProps } = useDropzone(dropzoneOptions);

                return (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            {label}
                        </Typography>
                        <Box
                            sx={{
                                border: '2px dashed #ccc',
                                borderRadius: 2,
                                padding: 2,
                                textAlign: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            {preview ? (
                                <Box position="relative">
                                    <img src={preview[0]} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200 }} />
                                    <Button
                                        startIcon={<Iconify icon={'mingcute:close-line'} />}
                                        onClick={() => removeImage(onChange)}
                                        sx={{ position: 'absolute', top: 5, right: 5 }}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            ) : (
                                <Box {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <Iconify icon={'mingcute:upload-2-line'} />
                                    <Typography>Drag & drop an image here, or click to select one</Typography>
                                </Box>
                            )}
                        </Box>
                        {loading && (
                            <Box display="flex" justifyContent="center" mt={2}>
                                <CircularProgress />
                            </Box>
                        )}
                        {error && helperText && (
                            <Typography color="error" variant="body2" mt={1}>
                                {helperText}
                            </Typography>
                        )}
                    </Box>
                );
            }}
        />
    );
};

export default ImageUploadField;