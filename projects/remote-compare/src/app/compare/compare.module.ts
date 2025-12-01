import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PokeCompare } from "./components/poke-compare/poke-compare";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { COMPARE_ROUTES } from "./compare.routes";
import { POKEMON_DETAIL_REPOSITORY, ComparisonService, COMPARISON_SERVICE } from "@domain/src/public-api";
import { PokeApiDetailAdapter } from "@infra/src/public-api";
import { Box, Center, Cluster, Container, Stack, Frame } from "@ui";

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(COMPARE_ROUTES),
        Box,
        Center,
        Cluster,
        Container,
        Stack,
        Frame
    ],
    declarations: [PokeCompare],
    providers: [
        provideHttpClient(),
        { provide: POKEMON_DETAIL_REPOSITORY, useClass: PokeApiDetailAdapter },
        { provide: COMPARISON_SERVICE, useClass: ComparisonService }
    ]
})
export class CompareModule {}