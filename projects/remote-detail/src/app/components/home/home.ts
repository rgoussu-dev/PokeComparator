import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Center, Cover, Stack } from '@ui';

@Component({
  selector: 'pc-home',
  imports: [RouterLink, Button, Center, Cover, Stack],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}
