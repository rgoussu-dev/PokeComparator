import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Center, Cover, Stack } from '@ui';

@Component({
  selector: 'pc-not-found',
  imports: [RouterLink, Button, Center, Cover, Stack],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent {}
