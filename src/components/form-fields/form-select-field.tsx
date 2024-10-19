import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectProps, FormHelperText, SelectChangeEvent } from '@mui/material';
import { Controller, Control, FieldValues, Path, RegisterOptions, FieldPath, PathValue } from 'react-hook-form';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  options: SelectOption[] | (() => Promise<SelectOption[]>);
  defaultValue?: PathValue<TFieldValues, Path<TFieldValues>>;
  rules?: Omit<RegisterOptions<TFieldValues, FieldPath<TFieldValues>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
  error?: boolean;
  helperText?: string;
  selectProps?: Omit<SelectProps, 'name' | 'control' | 'label' | 'error'>;
  onChange?: (value: string, event: SelectChangeEvent<unknown>) => void;
  disabled?: boolean;
}

export const FormSelectField = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  defaultValue,
  rules,
  error,
  helperText,
  selectProps,
  onChange,
  disabled = false
}: FormSelectFieldProps<TFieldValues>) => {
  const [selectOptions, setSelectOptions] = React.useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadOptions = async () => {
      setIsLoading(true);
      try {
        if (typeof options === 'function') {
          const fetchedOptions = await options();
          setSelectOptions(fetchedOptions);
        } else {
          setSelectOptions(options);
        }
      } catch (error) {
        console.error('Error loading options:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadOptions();
  }, [options]);

  return (
    <Controller<TFieldValues>
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormControl fullWidth error={error} margin="normal">
          <InputLabel>{label}</InputLabel>
          <Select
            {...field}
            {...selectProps}
            label={label}
            disabled={isLoading || disabled}
            value={isLoading ? '' : field.value}
            onChange={(event) => {
              field.onChange(event.target.value);
              if (onChange) onChange(event.target.value as string, event);
            }}       >
            {selectOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};