import { Component } from '@angular/core';
import { SearchPageComponent } from './search-page/search-page.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SearchPageComponent],  
  template: '<app-search-page></app-search-page>', 
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title='my_search_app'
}
