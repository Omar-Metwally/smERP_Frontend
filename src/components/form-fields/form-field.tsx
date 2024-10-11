import React from 'react';
import { TextField, InputAdornment, IconButton, TextFieldProps } from '@mui/material';
import { Controller, Control, FieldValues, Path, RegisterOptions, FieldPath } from 'react-hook-form';
import { Iconify } from 'src/components/iconify';

interface FormFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  type?: string;
  rules?: Omit<RegisterOptions<TFieldValues, FieldPath<TFieldValues>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
  showPasswordToggle?: boolean;
  error?: boolean;
  helperText?: string;
  textFieldProps?: Omit<TextFieldProps, 'name' | 'control' | 'label' | 'type' | 'error' | 'helperText'>;
  render?: (field: any) => React.ReactNode; // New prop for custom rendering
}

export const FormField = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  rules,
  showPasswordToggle = false,
  error,
  helperText,
  textFieldProps,
  render,
}: FormFieldProps<TFieldValues>) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Controller<TFieldValues>
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <>
          {render ? (
            render(field) // Render custom component if provided
          ) : (
            <TextField
              fullWidth
              margin="normal"
              label={label}
              type={showPasswordToggle && showPassword ? 'text' : type}
              {...field}
              {...textFieldProps}
              error={error}
              helperText={helperText}
              InputProps={{
                ...(showPasswordToggle
                  ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                          >
                            <Iconify
                              icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  : {}),
                ...(textFieldProps?.InputProps || {}),
              }}
            />
          )}
        </>
      )}
    />
  );
};