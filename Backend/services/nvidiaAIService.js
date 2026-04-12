const axios = require('axios');

/**
 * NVIDIA AI Service
 * Uses NVIDIA NIM (build.nvidia.com) to process and curate local activities
 */
class NvidiaAIService {
  constructor() {
    this.baseUrl = 'https://integrate.api.nvidia.com/v1';
    this.model = 'meta/llama-3.3-70b-instruct';
  }

  /**
   * Call NVIDIA NIM chat completions API
   */
  async chatCompletion(messages, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          temperature: options.temperature || 0.4,
          max_tokens: options.max_tokens || 2048,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.NVIDIA_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('NVIDIA AI error:', error.response?.data || error.message);
      throw new Error('AI processing failed');
    }
  }

  /**
   * Curate and categorize Reddit posts into local activities using AI
   */
  async curateActivities(posts, city) {
    if (!posts || posts.length === 0) return [];

    const postSummaries = posts.map((p, i) => 
      `[${i + 1}] "${p.title}" (r/${p.subreddit}, ${p.score} upvotes, ${p.num_comments} comments)${p.selftext ? '\n   ' + p.selftext.substring(0, 200) : ''}`
    ).join('\n');

    const prompt = `You are a local activity curator for ${city || 'the area'}. Analyze these Reddit posts and extract real local activities, events, recommendations, and trending topics.

Posts:
${postSummaries}

Return a JSON array of curated activities. Each activity should have:
- "title": A clean, engaging title (not the Reddit post title verbatim)
- "description": A brief 1-2 sentence description of what's happening
- "category": One of: "event", "food", "culture", "outdoors", "nightlife", "community", "tech", "sports", "shopping", "news"
- "vibe": One of: "chill", "energetic", "intellectual", "social", "adventurous", "cozy"
- "source_index": The post number [1], [2], etc. this came from
- "relevance": Score from 1-10 of how useful this is as a local activity

Rules:
- Only include posts that represent actual activities, events, places, or things people can do
- Skip pure memes, political rants, and complaint posts unless they reveal local culture
- Keep descriptions conversational and enticing
- Return ONLY the JSON array, no explanation

Return between 3-8 activities. If fewer than 3 posts are activity-relevant, return what you can.`;

    try {
      const result = await this.chatCompletion([
        { role: 'user', content: prompt }
      ]);

      // Parse JSON from the response
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('AI did not return valid JSON array');
        return this.fallbackCuration(posts, city);
      }

      const activities = JSON.parse(jsonMatch[0]);
      
      // Enrich with source data
      return activities.map(activity => {
        const sourcePost = posts[activity.source_index - 1];
        return {
          ...activity,
          permalink: sourcePost?.permalink || null,
          score: sourcePost?.score || 0,
          subreddit: sourcePost?.subreddit || null,
          thumbnail: sourcePost?.thumbnail || null
        };
      });
    } catch (error) {
      console.error('AI curation error:', error.message);
      return this.fallbackCuration(posts, city);
    }
  }

  /**
   * Fallback curation when AI fails — simple keyword-based categorization
   */
  fallbackCuration(posts, city) {
    const categoryKeywords = {
      'food': ['restaurant', 'food', 'cafe', 'eat', 'biryani', 'coffee', 'bar', 'pub', 'dinner', 'lunch', 'breakfast', 'pizza', 'street food'],
      'event': ['event', 'festival', 'concert', 'show', 'exhibition', 'meetup', 'workshop', 'hackathon', 'conference'],
      'outdoors': ['park', 'trek', 'hike', 'beach', 'lake', 'garden', 'trail', 'outdoor', 'cycling', 'run'],
      'culture': ['museum', 'art', 'heritage', 'temple', 'history', 'theater', 'cinema', 'movie'],
      'tech': ['startup', 'tech', 'developer', 'coding', 'ai', 'software', 'it'],
      'community': ['community', 'volunteer', 'help', 'group', 'club', 'society'],
      'nightlife': ['nightlife', 'club', 'party', 'dj', 'live music', 'lounge'],
      'sports': ['cricket', 'football', 'gym', 'fitness', 'sports', 'match', 'ipl'],
      'news': ['news', 'traffic', 'metro', 'road', 'weather', 'update']
    };

    return posts.slice(0, 6).map(post => {
      const text = (post.title + ' ' + (post.selftext || '')).toLowerCase();
      let category = 'community';
      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => text.includes(kw))) {
          category = cat;
          break;
        }
      }

      return {
        title: post.title.length > 80 ? post.title.substring(0, 77) + '...' : post.title,
        description: post.selftext 
          ? post.selftext.substring(0, 120).replace(/\n/g, ' ').trim() + '...'
          : `Trending in r/${post.subreddit} with ${post.score} upvotes`,
        category,
        vibe: 'social',
        relevance: Math.min(10, Math.round(post.score / 100) + 3),
        permalink: post.permalink,
        score: post.score,
        subreddit: post.subreddit,
        thumbnail: post.thumbnail
      };
    });
  }
}

module.exports = new NvidiaAIService();
