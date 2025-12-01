import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Center, Cover, Stack } from '@ui';

@Component({
  selector: 'pc-not-found',
  imports: [RouterLink, Button, Center, Cover, Stack],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound {}
