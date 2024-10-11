import React from 'react';
import { Table, TableBody, TableContainer, TablePagination, Card } from '@mui/material';
import { TableColumn } from 'src/services/types';
import { GenericTableRow } from './generic-table-row';
import { GenericTableHead } from './generic-table-head';
import { GenericTableToolbar } from './generic-table-toolbar';
import { TableEmptyRows } from './generic-table-empty-row';
import { TableNoData } from './generic-table-no-date';


interface GenericTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  orderBy: string;
  order: 'asc' | 'desc';
  selected: string[];
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSort: (property: keyof T) => void;
  onSelectAllRows: (checked: boolean) => void;
  onSelectRow: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean, id: string) => void;
  getRowId: (row: T) => string;
  actions?: {
    edit?: (row: T) => void;
    delete?: (row: T) => void;
  };
}

export function GenericTable<T>({
  data,
  columns,
  totalCount,
  page,
  rowsPerPage,
  orderBy,
  order,
  selected,
  filterName,
  onFilterName,
  onChangePage,
  onChangeRowsPerPage,
  onSort,
  onSelectAllRows,
  onSelectRow,
  getRowId,
  actions
}: GenericTableProps<T>) {
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalCount) : 0;
  const isNotFound = !data.length && !!filterName;

  return (
    <Card>
      <GenericTableToolbar
        numSelected={selected.length}
        filterName={filterName}
        onFilterName={onFilterName}
      />
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Table sx={{ minWidth: 800 }}>
          <GenericTableHead<T>
            order={order}
            orderBy={orderBy}
            rowCount={data.length}
            numSelected={selected.length}
            onSort={onSort}
            onSelectAllRows={onSelectAllRows}
            headLabel={columns}
            includeActions={actions ? Object.keys(actions).length > 0 : false}
          />
          <TableBody>
            {data.map((row) => (
              <GenericTableRow<T>
                key={getRowId(row)}
                row={row}
                columns={columns}
                selected={selected.indexOf(getRowId(row)) !== -1}
                onSelectRow={onSelectRow}
                getRowId={getRowId}
                actions={actions ? {
                  edit: actions.edit ? actions.edit : undefined,
                  delete: actions.delete ? actions.delete : undefined,
                } : undefined}
              />
            ))}
            <TableEmptyRows height={68} emptyRows={emptyRows} />
            {isNotFound && <TableNoData searchQuery={filterName} />}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        page={page}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={onChangeRowsPerPage}
      />
    </Card>
  );
}