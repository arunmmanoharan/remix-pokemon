import {LoaderFunctionArgs} from "@remix-run/router";

export const loader = async({ params }: LoaderFunctionArgs) => {
    const {pokemonId } = params;
    return await(await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)).json()
}
