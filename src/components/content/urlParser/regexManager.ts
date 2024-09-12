import { URLCategory } from '../../sharedTypes/urlTypes_enums';

// RegexManager handles loading and managing regex patterns for URL classification.
// It provides methods to load patterns from a JSON file and access them for use in URL classification.
export class RegexManager {
  private patterns: Map<URLCategory, RegExp>;

  constructor() {
    this.patterns = new Map();
  }

  // Loads regex patterns from a JSON file and compiles them into RegExp objects.
  // It uses the fetch API to load the file from the correct path in the extension.
  async loadPatterns(): Promise<void> {
    try {
      const response = await fetch(chrome.runtime.getURL('assets/regex_patterns.json'));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonPatterns = await response.json();
      
      for (const [category, pattern] of Object.entries(jsonPatterns)) {
        if (category in URLCategory) {
          this.patterns.set(
            URLCategory[category as keyof typeof URLCategory],
            new RegExp(pattern as string, 'i')
          );
        } else {
          console.warn(`Unknown category in regex file: ${category}`);
        }
      }
    } catch (error) {
      console.error('Error loading regex patterns:', error);
      throw error;
    }
  }

  // Returns the regex pattern for a specific URL category.
  getPattern(category: URLCategory): RegExp | undefined {
    return this.patterns.get(category);
  }

  // Returns all regex patterns as a Map of URLCategory to RegExp objects.
  getPatterns(): Map<URLCategory, RegExp> {
    return new Map(this.patterns);
  }

  // Checks if a pattern exists for the given URL category.
  hasPattern(category: URLCategory): boolean {
    return this.patterns.has(category);
  }

  // Adds or updates a regex pattern for a specific URL category.
  setPattern(category: URLCategory, pattern: RegExp): void {
    this.patterns.set(category, pattern);
  }

  // Removes a regex pattern for a specific URL category.
  removePattern(category: URLCategory): boolean {
    return this.patterns.delete(category);
  }
}