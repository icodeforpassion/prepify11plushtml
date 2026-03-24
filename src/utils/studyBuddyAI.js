import Fuse from 'fuse.js';

/**
 * Static Conversational AI using Fuzzy Matching
 * Matches user questions to pre-written responses
 */

export class StudyBuddyAI {
  constructor(conversationLibrary) {
    this.library = conversationLibrary;
    
    // Configure Fuse.js for fuzzy matching
    this.fuse = new Fuse(conversationLibrary, {
      keys: [
        { name: 'keywords', weight: 0.5 },
        { name: 'question', weight: 0.3 },
        { name: 'answer', weight: 0.2 }
      ],
      threshold: 0.4, // Lower = more strict matching (0-1)
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true
    });
  }

  /**
   * Find the best matching response for a user query
   * @param {string} userQuery - The user's question/input
   * @param {string} category - Optional category filter (maths, english, vr, nvr, general)
   * @returns {Object} Best matching response with confidence score
   */
  findResponse(userQuery, category = null) {
    if (!userQuery || userQuery.trim().length === 0) {
      return this.getDefaultResponse();
    }

    // Search for matches
    let results = this.fuse.search(userQuery);

    // Filter by category if specified
    if (category && category !== 'general') {
      results = results.filter(
        result => result.item.category === category || result.item.category === 'general'
      );
    }

    // If we have a good match, return it
    if (results.length > 0 && results[0].score < 0.5) {
      return {
        ...results[0].item,
        confidence: 1 - results[0].score, // Convert to confidence (0-1)
        matched: true
      };
    }

    // If no good match, return a fallback
    return this.getFallbackResponse(category);
  }

  /**
   * Get default greeting response
   */
  getDefaultResponse() {
    const greeting = this.library.find(item => item.id === 'greeting-1');
    return {
      ...greeting,
      confidence: 1.0,
      matched: true
    };
  }

  /**
   * Get fallback response when no match is found
   */
  getFallbackResponse(category = null) {
    const fallbacks = [
      {
        answer: "I'm not sure I understand that question. Could you try asking in a different way? For example, you could ask about fractions, percentages, synonyms, or exam tips!",
        animation: "scratch_head",
        confidence: 0.3,
        matched: false
      },
      {
        answer: "Hmm, I don't have a specific answer for that. Try asking about a particular topic like: 'How do I solve algebra?' or 'What are synonyms?' I'm here to help with Maths, English, Verbal Reasoning, and Non-Verbal Reasoning!",
        animation: "think",
        confidence: 0.3,
        matched: false
      },
      {
        answer: "I'm a friendly Study Buddy, but that question stumps me! Could you ask about a specific 11+ topic? I can help with things like fractions, spelling, letter codes, shape patterns, and much more!",
        animation: "shrug",
        confidence: 0.3,
        matched: false
      }
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * Get all responses for a specific category
   */
  getResponsesByCategory(category) {
    return this.library.filter(item => item.category === category);
  }

  /**
   * Get random tip from the library
   */
  getRandomTip(category = null) {
    let tips = category 
      ? this.library.filter(item => item.category === category)
      : this.library;
    
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
  }

  /**
   * Suggest related questions based on current topic
   */
  getSuggestedQuestions(currentCategory = null, limit = 3) {
    let suggestions = currentCategory
      ? this.library.filter(item => item.category === currentCategory)
      : this.library;

    // Shuffle and pick random questions
    suggestions = suggestions
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)
      .map(item => item.question);

    return suggestions;
  }
}

/**
 * Load conversation library from JSON
 */
export async function loadConversationLibrary() {
  try {
    const response = await fetch('/data/conversation_library.json');
    if (!response.ok) {
      throw new Error('Failed to load conversation library');
    }
    const data = await response.json();
    return new StudyBuddyAI(data);
  } catch (error) {
    console.error('Error loading conversation library:', error);
    // Return a minimal AI with just greetings
    return new StudyBuddyAI([
      {
        id: 'fallback-1',
        keywords: ['hello', 'hi', 'help'],
        category: 'general',
        question: 'Hello',
        answer: "Hi! I'm your Study Buddy. I'm here to help with your 11+ exam preparation!",
        animation: 'wave'
      }
    ]);
  }
}

export default StudyBuddyAI;
