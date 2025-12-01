import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { DETAIL_ROUTES } from "./detail.routes";
import { PokeDetail } from "./components/poke-detail/poke-detail";
import { POKEMON_DETAIL_REPOSITORY, POKEMON_REPOSITORY } from "@domain/src/public-api";
import { PokeApiDetailAdapter, PokeApiAdapter } from "@infra/src/public-api";

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DETAIL_ROUTES),
        PokeDetail
    ],
    providers: [
        provideHttpClient(),
        { provide: POKEMON_DETAIL_REPOSITORY, useClass: PokeApiDetailAdapter },
        { provide: POKEMON_REPOSITORY, useClass: PokeApiAdapter }
    ]
})
export class DetailModule {}