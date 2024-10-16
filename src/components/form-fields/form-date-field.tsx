import { TextFieldProps } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller, Control, FieldValues, Path, RegisterOptions, FieldPath } from 'react-hook-form';

interface DateFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  rules?: Omit<RegisterOptions<TFieldValues, FieldPath<TFieldValues>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
  error?: boolean;
  helperText?: string;
  textFieldProps?: Omit<TextFieldProps, 'name' | 'control' | 'label' | 'type' | 'error' | 'helperText'>;
  isReadOnly?: boolean;
  defaultValue?: Date;
  maxDate?: Date;
 }

export const FormDateField = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  rules,
  error,
  helperText,
  textFieldProps,
  isReadOnly = false,
  defaultValue,
  maxDate
}: DateFieldProps<TFieldValues>) => {
  return (
    <Controller<TFieldValues>
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <DatePicker
          label={label}
          onChange={(date) => field.onChange(date)}
          defaultValue={defaultValue}
          disabled={isReadOnly}
          maxDate={maxDate}
          slotProps={{
            textField: {
              ...textFieldProps,
              fullWidth: true,
              margin: "normal",
              error: error,
              helperText: helperText,
            },
          }}
        />
      )}
    />
  );
};