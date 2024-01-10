import * as React from 'react';
import type { MetaFunction } from '@remix-run/node';
import {Link as RemixLink, useFetcher, useSearchParams} from '@remix-run/react';
import Typography from '@mui/material/Typography';
import Button from "@mui/material/Button";
import {useEffect, useState} from "react";
import {CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, styled} from "@mui/material";
import {Close} from "@mui/icons-material";
import {Pokedex, Pokemon, PokemonsData} from "~/src/types";
import {DataGrid} from "@mui/x-data-grid";
import PokemonDataGrid from "~/src/PokemonDataGrid";



// https://remix.run/docs/en/main/route/meta
export const meta: MetaFunction = () => [
  { title: 'Remix Starter' },
  { name: 'description', content: 'Welcome to remix!' },
];

// https://remix.run/docs/en/main/file-conventions/routes#basic-routes
export default function Index() {

    const [open, setOpen] = useState(false);
    const [currentPokemonIdx, setCurrentPokemonIdx] = useState(0);
    const [recordLocation, setRecordLocation] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    const pokemonId = searchParams.get('pokemonId') || '1';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';

    const pokemonsFetcher = useFetcher<PokemonsData>({key:'pokemons'});
    const pokemonFetcher = useFetcher<Pokedex>({key:`pokemon-${pokemonId}`});

    const fetchPokemons = (page=1,page_size=Number(pageSize)) => {
        const offset = (page-1)*page_size;
        pokemonsFetcher.load(`/resources/pokemons?limit=${page_size}&offset=${offset}`);
    }

    useEffect(() => {
        fetchPokemons();
        searchParams.set('pokemonId', '1');
        searchParams.set('page', '1');
        searchParams.set('pageSize', pageSize);
        setSearchParams(searchParams);
    }, []);

    useEffect(() => {
        pokemonFetcher.load(`/resources/pokemon/${pokemonId}`);
        setCurrentPokemonIdx(pokemonsFetcher.data?.results.findIndex((pokemon) => pokemon.id === Number(pokemonId)) || 0);
    }, [pokemonId]);


    const handleClose = () => {
        setOpen(false);
    };


    const handlePrevRecord = () => {
        const prevRecord = currentPokemonIdx - 1;
        if (prevRecord >= 0) {
            // There is a previous record in the current data set
            const prevPokemonId = pokemonsFetcher.data?.results[prevRecord].id;
            searchParams.set('pokemonId', String(prevPokemonId));
            setSearchParams(searchParams);
        } else if (Number(page) > 1) {
            // Need to fetch records from the previous page
            const newPage = Number(page) - 1;
            searchParams.set('page', String(newPage));
            searchParams.set('pokemonId', ''); // Reset pokemonId temporarily
            setSearchParams(searchParams);
            setCurrentPokemonIdx(Number(pageSize) - 1); // Set to the last record of the new page
            setRecordLocation('prev');
            fetchPokemons(newPage, Number(pageSize));
        }
    };

    const handleNextRecord = () => {
        const nextRecord = currentPokemonIdx + 1;
        console.log('nextRecord', nextRecord)
        if(nextRecord < pokemonsFetcher.data!.results.length) {
            const nextPokemonId = pokemonsFetcher.data?.results[nextRecord].id;
            searchParams.set('pokemonId', String(nextPokemonId));
            setSearchParams(searchParams);
        } else if(nextRecord === pokemonsFetcher.data!.results.length) {
            console.log('neeed to fetch new records');
            searchParams.set('page', String(Number(page)+1));
            searchParams.set('pokemonId', String(pokemonsFetcher.data?.results[0].id));
            setSearchParams(searchParams);
            setCurrentPokemonIdx(0)
            setRecordLocation('next');
            fetchPokemons(Number(page)+1, Number(pageSize));
        }
    };

    useEffect(() => {
       if(pokemonsFetcher.data) {
           if(recordLocation === 'next') {
               searchParams.set('pokemonId', String(pokemonsFetcher.data.results[0].id));
               setSearchParams(searchParams);
           }
           if(recordLocation === 'prev') {
               const lastRecordId = pokemonsFetcher.data.results[pokemonsFetcher.data.results.length - 1].id;
               searchParams.set('pokemonId', String(lastRecordId));
               setSearchParams(searchParams);
           }
       }
    }, [pokemonsFetcher.data, recordLocation]);


  return (
    <React.Fragment>
      <Typography variant="h4" component="h1" gutterBottom>
        Pokemon API Sample
          <Button onClick={() => setOpen(!open)}>View Pokemons</Button>
      </Typography>
        <Typography variant="h4" component="h1" gutterBottom>
            Current Pokemon: {pokemonsFetcher.state === 'loading' ? <CircularProgress /> : pokemonFetcher.data?.name}
        </Typography>
        <Button onClick={handlePrevRecord}>Prev</Button>
        <Button onClick={handleNextRecord}>Next</Button>
        <PokemonDataGrid open={open} close={handleClose} />
    </React.Fragment>
  );
}
