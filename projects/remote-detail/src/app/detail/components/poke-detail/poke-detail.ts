import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-poke-detail',
  imports: [],
  templateUrl: './poke-detail.html',
  styleUrl: './poke-detail.css',
})
export class PokeDetail {
  id: string;
  private route: ActivatedRoute = inject(ActivatedRoute);

  constructor() {
    this.id = this.route.snapshot.paramMap.get('id')!;
  }
}
