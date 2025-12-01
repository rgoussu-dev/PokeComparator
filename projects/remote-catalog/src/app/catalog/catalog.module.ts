import { NgModule } from "@angular/core";
import { PokeCatalog } from "./components/poke-catalog/poke-catalog";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { CATALOG_ROUTES } from "./catalog.routes";
import { Box, Center, Cluster, Container, Frame, PaginatedList, Searchbar, Stack } from "@ui";
import { PokemonCard } from "./components/pokemon-card/pokemon-card";
import { POKEMON_REPOSITORY } from "@domain/src/public-api";
import { PokeApiAdapter } from "@infra/src/public-api";

@NgModule({
    imports: [
        PaginatedList, 
        Searchbar,  
        Stack, 
        Container,
        Box, 
        Cluster, 
        Frame, 
        Center,
        RouterModule.forChild(CATALOG_ROUTES)
    ],
    declarations: [PokeCatalog, PokemonCard],
    providers: [
        provideHttpClient(),
        { provide: POKEMON_REPOSITORY, useClass: PokeApiAdapter }
    ]
})
export class CatalogModule {}