import { NgModule } from "@angular/core";
import { PokeCompare } from "./components/poke-compare/poke-compare";
import { RouterModule } from "@angular/router";
import { COMPARE_ROUTES } from "./compare.routes";

@NgModule({
    imports: [
    RouterModule.forChild(COMPARE_ROUTES)
  ],
    declarations: [PokeCompare],
})
export class CompareModule {}