import { Box, Typography, Button, Card, TableContainer, CircularProgress } from "@mui/material";
import { useCallback, useState } from "react";
import { Iconify } from "src/components/iconify";
import { Scrollbar } from "src/components/scrollbar";
import { useEntities } from "src/hooks/use-entities";
import { useTable } from "src/hooks/use-table";
import { GenericTable } from "src/layouts/components/table/generic-table";
import { DashboardContent } from "src/layouts/dashboard";
import { TableColumn } from "src/services/types";
import { BranchForm } from "../branch-form";
import { CustomDialog } from "src/layouts/components/custom-dialog";

type BranchProps = {
    id: string,
    name: string,
    storageLocations: string
}

const transformBranch = (apiBranch: any): BranchProps => {
    return {
        id: apiBranch.branchId,
        name: apiBranch.name,
        storageLocations: apiBranch.storageLocations
            ? apiBranch.storageLocations.map((location: { label: string }) => location.label).join(', ')
            : 'No Storage Locations',
    };
};


const BRANCH_TABLE_COLUMNS: TableColumn<BranchProps>[] = [
    { id: 'name', label: 'Name' },
    { id: 'storageLocations', label: 'Storage Locations', sortable: false },
];

export function BranchView() {
    const [filterName, setFilterName] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<BranchProps | null>(null);

    const table = useTable();

    const { entities: branches, loading, error, totalCount, updateParams, refetch } = useEntities<BranchProps>(
        'branches',
        {
            PageNumber: table.page + 1,
            PageSize: table.rowsPerPage,
            SortBy: table.orderBy,
            SortDescending: table.order === 'desc',
            SearchTerm: filterName,
        },
        transformBranch
    );

    const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFilterName = event.target.value;
        setFilterName(newFilterName);
        updateParams({ SearchTerm: newFilterName, PageNumber: 1 });
        table.onChangePage(null, 0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        updateParams({ PageNumber: newPage + 1 });
        table.onChangePage(event, newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        updateParams({ PageSize: newRowsPerPage, PageNumber: 1 });
        table.onChangeRowsPerPage(event);
    };

    const handleSort = (property: keyof BranchProps) => {
        const isAsc = table.orderBy === property && table.order === 'asc';
        updateParams({
            SortBy: property,
            SortDescending: !isAsc,
        });
        table.onSort(property);
    };

    const handleSelectRow = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean, id: string) => {
        table.onSelectRow(event, checked, id);
    };

    const handleAddBranch = () => {
        setSelectedBranch(null);
        setShowForm(true);
    };

    const handleEditBranch = (brand: BranchProps) => {
        setSelectedBranch(brand);
        setShowForm(true);
    };

    const handleFormClose = useCallback(() => {
        setShowForm(false);
        refetch();
    }, [refetch]);

    const handleFormCancel = () => {
        setShowForm(false);
    }

    return (
        <DashboardContent>
            <Box display="flex" alignItems="center" mb={5}>
                <Typography variant="h4" flexGrow={1}>
                    Branches
                </Typography>
                <Button variant="contained" color="inherit" onClick={handleAddBranch} startIcon={<Iconify icon="mingcute:add-line" />}>
                    New branch
                </Button>
            </Box>

            <Card>
                <Scrollbar>
                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                        <GenericTable
                            data={branches}
                            columns={BRANCH_TABLE_COLUMNS}
                            totalCount={totalCount}
                            page={table.page}
                            rowsPerPage={table.rowsPerPage}
                            orderBy={table.orderBy}
                            order={table.order}
                            selected={table.selected}
                            filterName={filterName}
                            onFilterName={handleFilterName}
                            onChangePage={handleChangePage}
                            onChangeRowsPerPage={handleChangeRowsPerPage}
                            onSort={handleSort}
                            onSelectAllRows={(checked) => table.onSelectAllRows(checked, branches.map(branch => branch.id))}
                            onSelectRow={handleSelectRow}
                            getRowId={(row: BranchProps) => row.id}
                            actions={{
                                edit: handleEditBranch,
                            }}
                        />
                        {loading && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 10,
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        )}

                        {error && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 10,
                                }}
                            >
                                {error}
                            </Box>
                        )}
                    </TableContainer>
                </Scrollbar>
            </Card>
            <CustomDialog open={showForm} handleCancel={handleFormCancel} title={selectedBranch?.id ? 'Edit branch' : 'Add new branch'} content={<BranchForm branchId={selectedBranch?.id} onSubmitSuccess={handleFormClose} />} />
        </DashboardContent>
    )
}