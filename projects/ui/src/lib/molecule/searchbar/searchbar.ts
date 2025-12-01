import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Label } from '../../atoms/label/label';
import { InputAtom } from '../../atoms/input/input';
import { Button } from '../../atoms/button/button';
import { Cluster } from '../../atoms/cluster/cluster';
import { Icon } from '../../atoms/icon/icon';
import { Stack } from '../../atoms/stack/stack';

@Component({
  selector: 'pc-searchbar',
  imports: [Label, InputAtom, Cluster, Stack, Icon, Button],
  templateUrl: './searchbar.html',
  host: { 'data-pc-component': 'searchbar' }
})
export class Searchbar {
  @Input() value = '';
  @Input() placeholder ='';
  @Input() label = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() buttonIcon: string | null= null;
  @Input() buttonLabel: string | null= null;
  @Output() valueChange = new EventEmitter<string>();
  @Output() searchSubmit = new EventEmitter<string>();


  onInputChange(val: string) {
    this.valueChange.emit(val);
  }

  onSearch() {
    this.searchSubmit.emit(this.value);
  }
}
