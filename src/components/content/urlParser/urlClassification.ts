// src/components/content/urlParser/urlClassifier.ts

import { URLCategory } from '../../sharedTypes/urlTypes_enums';
import { RegexManager } from './regexManager';

interface ClassificationResult {
  categories: URLCategory[];
  score: number;
}

export class URLClassifier {
  private regexManager: RegexManager;

  constructor(regexManager: RegexManager) {
    this.regexManager = regexManager;
  }

  /**
   * Classifies a single URL into one or more categories.
   * @param url The URL to classify.
   * @returns An object containing matching categories and a classification score.
   */
  classifyURL(url: string): ClassificationResult {
    const result: ClassificationResult = {
      categories: [],
      score: 0
    };

    for (const [category, pattern] of this.regexManager.getPatterns()) {
      if (pattern.test(url)) {
        result.categories.push(category);
        result.score += this.getCategoryScore(category);
      }
    }

    return result;
  }

  /**
   * Classifies multiple URLs and returns results sorted by score.
   * @param urls An array of URLs to classify.
   * @returns An array of objects containing the URL, its categories, and score, sorted by score.
   */
  classifyMultipleURLs(urls: string[]): Array<{ url: string } & ClassificationResult> {
    return urls
      .map(url => ({
        url,
        ...this.classifyURL(url)
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Assigns a score to a category based on its potential security implications.
   * @param category The URLCategory to score.
   * @returns A number representing the category's score.
   */
  private getCategoryScore(category: URLCategory): number {
    switch (category) {
      case URLCategory.PotentiallyVulnerable:
      case URLCategory.UnsecuredAPI:
      case URLCategory.SensitiveData:
        return 3;
      case URLCategory.AdminPanel:
      case URLCategory.AuthenticationEndpoint:
      case URLCategory.PaymentProcessing:
      case URLCategory.DatabaseOperation:
        return 2;
      default:
        return 1;
    }
  }

  /**
   * Provides a human-readable description for a given URL category.
   * @param category The URLCategory to describe.
   * @returns A string description of the category.
   */
  getCategoryDescription(category: URLCategory): string {
    switch (category) {
      case URLCategory.APIEndpoint:
        return "API endpoint";
      case URLCategory.AuthenticationEndpoint:
        return "Authentication-related endpoint";
      case URLCategory.DataTransfer:
        return "Data transfer or exchange endpoint";
      case URLCategory.DatabaseOperation:
        return "Database operation endpoint";
      case URLCategory.AdminPanel:
        return "Administrative panel or function";
      case URLCategory.UserDataAccess:
        return "User data access endpoint";
      case URLCategory.PaymentProcessing:
        return "Payment processing related endpoint";
      case URLCategory.FileAccess:
        return "File access or manipulation endpoint";
      case URLCategory.LegacyEndpoint:
        return "Legacy or deprecated endpoint";
      case URLCategory.DynamicContent:
        return "Dynamic content generation endpoint";
      case URLCategory.WebSocket:
        return "WebSocket connection endpoint";
      case URLCategory.InternalNetwork:
        return "Internal network or localhost reference";
      case URLCategory.ThirdPartyIntegration:
        return "Third-party service integration";
      case URLCategory.DebugEndpoint:
        return "Debugging or development endpoint";
      case URLCategory.PotentiallyVulnerable:
        return "Potentially vulnerable endpoint";
      case URLCategory.SensitiveData:
        return "Endpoint possibly handling sensitive data";
      case URLCategory.UnsecuredAPI:
        return "Potentially unsecured API endpoint";
      case URLCategory.ParameterizedEndpoint:
        return "Parameterized or dynamic endpoint";
      case URLCategory.NonStandardPort:
        return "Endpoint using a non-standard port";
      case URLCategory.Base64EncodedSegment:
        return "Contains Base64 encoded segment";
      default:
        return "Unknown category";
    }
  }
}