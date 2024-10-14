import { Box, CircularProgress, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormField } from "src/components/form-fields/form-field";
import ImageUploadField from "src/components/form-fields/image-field";
import { useAttributes } from "src/hooks/use-attributes";
import { apiService } from "src/services/api";
import { AttributeSelector } from "./test";
import { AttributeValue } from "src/services/types";
import { LoadingButton } from "@mui/lab";

export interface ProductInstanceFormData {
    productId: string
    productInstanceId?: string;
    sku?: string;
    sellingPrice: string;
    imagesBase64: string[];
    imagesPathToRemove?: string[]
    attributes: AttributeValue[]
}

interface ProductInstanceFormProps {
    productId: string;
    productInstanceId?: string;
    onSubmitSuccess: () => void;
}

export function ProductInstanceForm({ productId, productInstanceId, onSubmitSuccess }: ProductInstanceFormProps) {
    const [loading, setLoading] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [fetchingInstanceProduct, setFetchingInstanceProduct] = useState(false);
    const [selectedAttributes, setSelectedAttributes] = useState<any>(null);
    const [existingProductInstanceImages, setExistingProductInstanceImages] = useState<string[] | null>(null);
    const [imagesUrlToRemove, setImagesUrlToRemove] = useState<string[]>([]);
    const isEditMode = !!productInstanceId;

    const { control, handleSubmit, reset, formState: { errors, dirtyFields } } = useForm<ProductInstanceFormData>({
        defaultValues: {
            productId: '',
            productInstanceId: '',
            sku: '',
            sellingPrice: '',
            imagesBase64: [],
            attributes: []
        },
    });

    useEffect(() => {
        const fetchProductInstanceData = async () => {
            if (productInstanceId) {
                setFetchingInstanceProduct(true);
                try {
                    const response = await fetch(`http://localhost:5184/products/${productId}/instances/${productInstanceId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch product data');
                    }
                    const responseBody = await response.json();
                    const productData: ProductInstanceFormData = responseBody.value;
                    setExistingProductInstanceImages([responseBody.value.image])
                    setSelectedAttributes(productData.attributes);
                    reset(productData);
                } catch (error) {
                    console.error('Error fetching product data:', error);
                    setSubmissionError('Failed to load product data. Please try again.');
                } finally {
                    setFetchingInstanceProduct(false);
                }
            }
        };

        fetchProductInstanceData();
    }, [productInstanceId, reset]);

    const onSubmit: SubmitHandler<ProductInstanceFormData> = async (data) => {
        console.log(imagesUrlToRemove)
        console.log(data.imagesBase64)
        setLoading(true);
        setSubmissionError(null);
        data.attributes = selectedAttributes;
        try {
            if (isEditMode) {
                const changedData = Object.keys(dirtyFields).reduce((acc: Partial<ProductInstanceFormData>, key) => {
                    acc[key as keyof ProductInstanceFormData] = data[key as keyof ProductInstanceFormData];
                    return acc;
                }, {});
                await apiService.productInstances.update(productId, productInstanceId, changedData);
            } else {
                await apiService.productInstances.create(productId, data);
            }
            console.log(isEditMode ? 'Product updated successfully' : 'Product added successfully');
            onSubmitSuccess();
        } catch (error: any) {
            console.error(error);
            setSubmissionError(error.message || "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    function hello(fhg: any){
        console.log(fhg)
    }

    const { data: attributesResponse, error: attributesError, isLoading: isLoadingAttributes } = useAttributes();
    
    if (isLoadingAttributes || fetchingInstanceProduct) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
                <Typography variant="h6" sx={{ marginLeft: 2 }}>
                    Loading...
                </Typography>
            </Box>
        );
    }

    if (attributesError) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography color="error">{attributesError?.message}</Typography>
            </Box>
        );
    }

    return (
        <Box component="form" autoComplete="on" onSubmit={handleSubmit(onSubmit)}>

            <FormField<ProductInstanceFormData>
                name="sku"
                control={control}
                label="SKU Number"
                error={!!errors.sku}
                helperText={errors.sku?.message}
                isReadOnly={true}
            />
            <FormField<ProductInstanceFormData>
                name="sellingPrice"
                control={control}
                label="Sell Price"
                rules={{ required: 'Sell Price is required' }}
                isNumber={true}
                error={!!errors.sellingPrice}
                helperText={errors.sellingPrice?.message}
            />

            <AttributeSelector
                initialValues={selectedAttributes ?? []}
                attributes={attributesResponse?.value ?? []}
                onAttributesChange={setSelectedAttributes}
            />

            <ImageUploadField
                name="imagesBase64"
                control={control}
                label="Product Image"
                maxSize={15 * 1024 * 1024}
                acceptedFileTypes={['image/jpeg', 'image/png']}
                existingImagesUrl={existingProductInstanceImages ?? []}
                onRemove={(removedUrl) => {
                    hello(removedUrl)
                    if (existingProductInstanceImages?.includes(removedUrl)) {
                        setImagesUrlToRemove(prev => [...prev, removedUrl]);
                    }
                }}
            />
            
            <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                loading={loading}
            >
                {isEditMode ? 'Update Product Instance' : 'Add Product Instance'}
            </LoadingButton>
            {submissionError && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {submissionError}
                </Typography>
            )}
            {loading && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

        </Box>
    )
}

{/* <Grid item xs={12}>
<ImageUploadField
    name="productImage"
    control={control}
    label="Product Image"
    maxSize={15 * 1024 * 1024}
    acceptedFileTypes={['image/jpeg', 'image/png']}
/>
</Grid> */}