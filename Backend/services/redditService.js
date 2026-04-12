const axios = require('axios');

/**
 * Reddit API Service
 * Fetches posts from location-specific subreddits
 */
class RedditService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;

    // Map of Indian cities to their subreddits
    this.citySubreddits = {
      'mumbai': ['mumbai', 'india'],
      'delhi': ['delhi', 'newdelhi', 'india'],
      'bangalore': ['bangalore', 'india'],
      'bengaluru': ['bangalore', 'india'],
      'hyderabad': ['hyderabad', 'india'],
      'chennai': ['chennai', 'india'],
      'kolkata': ['kolkata', 'india'],
      'pune': ['pune', 'india'],
      'ahmedabad': ['ahmedabad', 'india'],
      'jaipur': ['jaipur', 'india'],
      'lucknow': ['lucknow', 'india'],
      'bhopal': ['bhopal', 'india'],
      'indore': ['indore', 'india'],
      'chandigarh': ['chandigarh', 'india'],
      'goa': ['goa', 'india'],
      'kochi': ['kerala', 'india'],
      'new york': ['nyc', 'newyorkcity'],
      'los angeles': ['losangeles'],
      'san francisco': ['sanfrancisco'],
      'london': ['london'],
      'tokyo': ['tokyo'],
      'default': ['india']
    };
  }

  /**
   * Authenticate with Reddit OAuth2 (script app flow)
   */
  async authenticate() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        'grant_type=password&username=' + 
          encodeURIComponent(process.env.REDDIT_USERNAME) + 
          '&password=' + encodeURIComponent(process.env.REDDIT_PASSWORD),
        {
          auth: {
            username: process.env.REDDIT_CLIENT_ID,
            password: process.env.REDDIT_CLIENT_SECRET
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'YunoApp/1.0 (by /u/' + process.env.REDDIT_USERNAME + ')'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 min buffer
      return this.accessToken;
    } catch (error) {
      console.error('Reddit auth error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Reddit');
    }
  }

  /**
   * Get subreddits for a given city
   */
  getSubredditsForCity(city) {
    if (!city) return this.citySubreddits['default'];
    const key = city.toLowerCase().trim();
    return this.citySubreddits[key] || this.citySubreddits['default'];
  }

  /**
   * Fetch hot/trending posts from a subreddit
   */
  async fetchSubredditPosts(subreddit, limit = 10) {
    try {
      const token = await this.authenticate();

      const response = await axios.get(
        `https://oauth.reddit.com/r/${subreddit}/hot`,
        {
          params: {
            limit,
            raw_json: 1
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'YunoApp/1.0 (by /u/' + process.env.REDDIT_USERNAME + ')'
          }
        }
      );

      return response.data.data.children
        .filter(post => !post.data.stickied) // Skip pinned posts
        .map(post => ({
          id: post.data.id,
          title: post.data.title,
          selftext: (post.data.selftext || '').substring(0, 500),
          subreddit: post.data.subreddit,
          score: post.data.score,
          num_comments: post.data.num_comments,
          url: post.data.url,
          permalink: `https://reddit.com${post.data.permalink}`,
          created_utc: post.data.created_utc,
          author: post.data.author,
          thumbnail: post.data.thumbnail !== 'self' && post.data.thumbnail !== 'default' 
            ? post.data.thumbnail : null
        }));
    } catch (error) {
      console.error(`Reddit fetch error for r/${subreddit}:`, error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Fetch local activities for a city
   */
  async fetchLocalActivities(city, limit = 15) {
    const subreddits = this.getSubredditsForCity(city);
    const postsPerSub = Math.ceil(limit / subreddits.length);

    const allPosts = [];
    for (const sub of subreddits) {
      const posts = await this.fetchSubredditPosts(sub, postsPerSub);
      allPosts.push(...posts);
    }

    // Sort by score (popularity) and deduplicate
    const seen = new Set();
    return allPosts
      .filter(post => {
        if (seen.has(post.id)) return false;
        seen.add(post.id);
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

module.exports = new RedditService();
