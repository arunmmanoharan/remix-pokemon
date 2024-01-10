import React, {FunctionComponent, useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogTitle, IconButton, styled} from "@mui/material";
import {Close} from "@mui/icons-material";
import {Pokemon, PokemonsData} from "~/src/types";
import {DataGrid} from "@mui/x-data-grid";
import {useFetcher, useSearchParams} from "@remix-run/react";


const StyledDataGrid = styled(DataGrid)(() => ({
    "& .currentRecord": {
        backgroundColor: "#BCE0FA",
    },
    '&:hover': {
        cursor: 'pointer',
    }
}));

interface PokemonDataGridProps {
    open: boolean;
    close: () => void;
}

const PokemonDataGrid: FunctionComponent<PokemonDataGridProps> = ({open, close}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const pokemonId = searchParams.get('pokemonId') || '1';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '1';


    const pokemonsFetcher = useFetcher<PokemonsData>({key:'pokemons'});

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const fetchPokemons = (page=1,pageSize=10) => {
        const offset = (page-1)*pageSize;
        pokemonsFetcher.load(`/resources/pokemons?limit=${pageSize}&offset=${offset}`);
    }

    useEffect(() => {
        if(open) {
            fetchPokemons();
            setPaginationModel({
                page: Number(page)-1,
                pageSize: Number(pageSize)
            })
        }
    }, [open, page, pageSize]);

    useEffect(() => {
        fetchPokemons(paginationModel.page+1, paginationModel.pageSize);
    }, [paginationModel]);

    return (
        <Dialog
            onClose={close}
            aria-labelledby="customized-dialog-title"
            open={open}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                Pokemons
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={close}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <Close />
            </IconButton>
            <DialogContent dividers>
                <StyledDataGrid
                    rows={
                        pokemonsFetcher.data?.results as Pokemon[]
                    }
                    columns={
                        [
                            { field: 'id', headerName: 'Id', width: 200 },
                            { field: 'name', headerName: 'Name', width: 200 },
                            { field: 'url', headerName: 'URL', width: 200 },
                        ]
                    }
                    getRowId={(row) => JSON.stringify(row)}
                    pagination
                    rowCount={pokemonsFetcher.data?.count}
                    pageSizeOptions={[10,25, 50, 75, 100]}
                    paginationModel={paginationModel}
                    paginationMode={
                        'server'
                    }
                    onPaginationModelChange={setPaginationModel}
                    onRowClick={(params) => {
                        searchParams.set('pokemonId', params.row.id);
                        searchParams.set('page', (paginationModel.page + 1).toString());
                        searchParams.set('pageSize', paginationModel.pageSize.toString());
                        setSearchParams(searchParams);
                        close();
                    }}
                    getRowClassName={(params) => {
                        if (params.row.id === Number(pokemonId)) {
                            // visual highlight for current record's row
                            return "currentRecord";
                        }
                        return "";
                    }}
                    disableRowSelectionOnClick
                />
            </DialogContent>
        </Dialog>
    );
};

export default PokemonDataGrid;
