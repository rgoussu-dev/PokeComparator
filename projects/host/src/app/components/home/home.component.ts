import { Component } from '@angular/core';
import { Center, Cluster, Cover,  Stack } from '@ui';

@Component({
  selector: 'app-home',
  imports: [Cover, Cluster, Center, Stack],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {


}
