import { Toolbar, OutlinedInput, InputAdornment } from "@mui/material";
import { Iconify } from "src/components/iconify";

interface GenericTableToolbarProps {
    numSelected: number;
    filterName: string;
    onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  }
  
  export function GenericTableToolbar({ numSelected, filterName, onFilterName }: GenericTableToolbarProps) {
    return (
      <Toolbar
        sx={{
          height: 96,
          display: 'flex',
          justifyContent: 'space-between',
          padding: (theme) => theme.spacing(0, 1, 0, 3),
          ...(numSelected > 0 && {
            color: 'primary.main',
            bgcolor: 'primary.lighter',
          }),
        }}
      >
        {numSelected > 0 ? (
          <div>{numSelected} selected</div>
        ) : (
          <OutlinedInput
            value={filterName}
            onChange={onFilterName}
            placeholder="Search..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
              </InputAdornment>
            }
          />
        )}
      </Toolbar>
    );
  }
  