import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent {
  searchQuery: string = '';
  fileContent: string = '';
  searchCount: number = 0; 
  searchword: string = ''; 
  filteredContent: SafeHtml[] = []; 
  highlightedIndex: number = 0; 
  matches: { line: number, matchIndex: number }[] = []; 
  buttonVisible: boolean = false;
  fileUploaded: boolean = false;  
  currentLine: string = ''; 
  isPreviousDisabled: boolean = true; 
  isNextDisabled: boolean = false;

  constructor(private sanitizer: DomSanitizer) {} 

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fileContent = e.target.result;
        this.fileUploaded = true;  
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      reader.readAsText(file);
    }
  }

  search() {
    this.filteredContent = [];
    this.matches = [];
    this.highlightedIndex = 0;

    if (this.searchQuery.trim() === '') {
      this.searchword = 'Please enter a search term.';
      this.buttonVisible = false;
      return;
    }
    if (!this.fileContent) {
      this.searchword = 'No file loaded. Please upload a file first.';
      this.buttonVisible = false;
      return;
    }

    const lowerCaseSearchQuery = this.searchQuery.toLowerCase().trim();
    const regex = new RegExp(lowerCaseSearchQuery, 'gi');
    const lines = this.fileContent.split('\n');

    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        this.matches.push({ line: lineIndex, matchIndex: match.index });
      }
    });

    this.searchCount = this.matches.length;
    if (this.searchCount > 0) {
      this.searchword = `${this.searchQuery} found ${this.searchCount} times.`;
      this.buttonVisible = true;
      this.updateHighlight();  
    } else {
      this.searchword = `"${this.searchQuery}" was not found in the file.`;
      this.buttonVisible = false;
    }
  }
  nextHighlight() {
    if (this.searchCount === 0) return;
    this.highlightedIndex = (this.highlightedIndex + 1) % this.searchCount;
    this.isNextDisabled=this.highlightedIndex==this.searchCount-1;
    this.isPreviousDisabled=false;
    this.updateHighlight();
    this.printCurrentLine();
  }
  previousHighlight() {
    if (this.searchCount === 0) return;
    this.highlightedIndex = (this.highlightedIndex - 1 + this.searchCount) % this.searchCount;
    this.isPreviousDisabled=this.highlightedIndex==0;
    this.isNextDisabled=false;
    this.updateHighlight();
    this.printCurrentLine();
  }
  updateHighlight() {
      const lowerCaseSearchQuery = this.searchQuery.toLowerCase().trim();
      const regex = new RegExp(lowerCaseSearchQuery, 'gi');
      const lines = this.fileContent.split('\n');
      this.filteredContent = [];
      lines.forEach((line, lineIndex) => {
      let sanitizedLine = line;
      let matchFound = false;
      sanitizedLine = sanitizedLine.replace(regex, (matchedText, matchIndex) => {
        const matchInCurrentIndex = this.matches.findIndex(
          m => m.line === lineIndex && m.matchIndex === matchIndex
        );

        matchFound = true;

        if (matchInCurrentIndex === this.highlightedIndex) {
          return `<span style="background-color: orange; color: black;">${matchedText}</span>`;
        } else {
          return `<span style="background-color: yellow; color: black;">${matchedText}</span>`;
        }
      });

      if (matchFound) {
        this.filteredContent.push(this.sanitizer.bypassSecurityTrustHtml(sanitizedLine));
      }
    });
    this.isPreviousDisabled=this.highlightedIndex==0;
    this.isNextDisabled=this.highlightedIndex==this.searchCount-1;
  }
  printCurrentLine() {
    const match = this.matches[this.highlightedIndex];
    if (match) {
      const lines = this.fileContent.split('\n');
      this.currentLine = lines[match.line];
      console.log(`Current line: ${this.currentLine}`);
    }
  }
}
