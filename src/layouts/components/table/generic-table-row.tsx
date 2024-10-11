import React, { useState, useCallback } from 'react';
import {
  TableRow,
  TableCell,
  Checkbox,
  IconButton,
  Popover,
  MenuList,
  MenuItem,
} from '@mui/material';
import { menuItemClasses } from '@mui/material/MenuItem';
import { Iconify } from 'src/components/iconify';
import { TableColumn } from 'src/services/types';

interface GenericTableRowProps<T> {
  row: T;
  columns: TableColumn<T>[];
  selected: boolean;
  onSelectRow: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean, id: string) => void;
  getRowId: (row: T) => string;
  actions?: {
    edit?: (row: T) => void;
    delete?: (row: T) => void;
  };
}

export function GenericTableRow<T>({
  row,
  columns,
  selected,
  onSelectRow,
  getRowId,
  actions
}: GenericTableRowProps<T>) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox
            disableRipple
            checked={selected}
            onChange={(event) => onSelectRow(event, !selected, getRowId(row))}
          />
        </TableCell>
        {columns.map((column) => (
          <TableCell key={column.id as string} align={column.align}>
            {column.render ? column.render(row) : (row[column.id as keyof T] as React.ReactNode)}
          </TableCell>
        ))}
        {actions && (
          <TableCell align="right">
            <IconButton onClick={handleOpenPopover}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
      {actions && (
        <Popover
          open={!!openPopover}
          anchorEl={openPopover}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuList
            disablePadding
            sx={{
              p: 0.5,
              gap: 0.5,
              width: 140,
              display: 'flex',
              flexDirection: 'column',
              [`& .${menuItemClasses.root}`]: {
                px: 1,
                gap: 2,
                borderRadius: 0.75,
                [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
              },
            }}
          >
            {actions.edit && (
              <MenuItem onClick={() => { actions.edit?.(row); handleClosePopover(); }}>
                <Iconify icon="solar:pen-bold" />
                Edit
              </MenuItem>
            )}
            {actions.delete && (
              <MenuItem onClick={() => { actions.delete?.(row); handleClosePopover(); }} sx={{ color: 'error.main' }}>
                <Iconify icon="solar:trash-bin-trash-bold" />
                Delete
              </MenuItem>
            )}
          </MenuList>
        </Popover>
      )}
    </>
  );
}
