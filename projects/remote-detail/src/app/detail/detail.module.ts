import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { DETAIL_ROUTES } from "./detail.routes";
import { PokeDetail } from "./components/poke-detail/poke-detail";
import { 
    POKEMON_DETAIL_REPOSITORY, 
    POKEMON_REPOSITORY,
    POKEMON_DETAIL_SERVICE,
    PokemonDetailService,
    POKEMON_CATALOG_SERVICE,
    PokemonCatalogService,
    ComparisonService
} from "@domain/src/public-api";
import { PokeApiDetailAdapter, PokeApiAdapter } from "@infra/src/public-api";
import { Box, Center, Cluster, Stack, Frame, Button, Sidebar, Searchbar, Switcher } from "@ui";

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DETAIL_ROUTES),
        Box,
        Center,
        Cluster,
        Stack,
        Frame,
        Button,
        Sidebar,
        Searchbar,
        Switcher
    ],
    declarations: [PokeDetail],
    providers: [
        provideHttpClient(),
        // Infrastructure adapters bound to domain ports
        { provide: POKEMON_DETAIL_REPOSITORY, useClass: PokeApiDetailAdapter },
        { provide: POKEMON_REPOSITORY, useClass: PokeApiAdapter },
        // Domain services (internally inject the repositories)
        ComparisonService,
        { provide: POKEMON_DETAIL_SERVICE, useClass: PokemonDetailService },
        { provide: POKEMON_CATALOG_SERVICE, useClass: PokemonCatalogService }
    ]
})
export class DetailModule {}