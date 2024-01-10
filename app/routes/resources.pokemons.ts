import {LoaderFunctionArgs} from "@remix-run/router";
import {Pokemon, PokemonsData} from "~/src/types";

export const loader = async({ request }: LoaderFunctionArgs) => {
    let { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit"));
    const offset = Number(searchParams.get("offset"));
    return await(await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)).json().then((data: PokemonsData) => {
        return {
            ...data,
            results: data.results.map((pokemon: Pokemon) => {
                return {
                    ...pokemon,
                    id: Number(pokemon.url.split("/")[6])
                }
            })
        }
    })
}
