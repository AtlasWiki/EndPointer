import { URLCategory } from '../../sharedTypes/urlTypes_enums';

export class RegexManager {
  private patterns: Map<URLCategory, RegExp>;

  constructor() {
    this.patterns = new Map();
  }

  /**
   * Loads regex patterns from a JSON file and compiles them into RegExp objects.
   * Handles errors during loading and logs warnings for unknown categories.
   * @param jsonFilePath The path to the JSON file containing regex patterns.
   */
  async loadPatterns(jsonFilePath: string): Promise<void> {
    try {
      const response = await fetch(jsonFilePath);
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

  /**
   * Retrieves the compiled RegExp object for a given URL category.
   * Returns undefined if the category doesn't exist in the patterns.
   * @param category The URLCategory to get the pattern for.
   * @returns The RegExp object for the category, or undefined if not found.
   */
  getPattern(category: URLCategory): RegExp | undefined {
    return this.patterns.get(category);
  }

  /**
   * Returns a new Map containing all compiled regex patterns.
   * This method returns a copy to prevent direct modification of the private patterns.
   * @returns A Map of URLCategory to RegExp objects.
   */
  getPatterns(): Map<URLCategory, RegExp> {
    return new Map(this.patterns);
  }

  /**
   * Checks if a pattern exists for the given URL category.
   * Useful for validating category existence before attempting to use a pattern.
   * @param category The URLCategory to check for.
   * @returns A boolean indicating whether the pattern exists.
   */
  hasPattern(category: URLCategory): boolean {
    return this.patterns.has(category);
  }
}