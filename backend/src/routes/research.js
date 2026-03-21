import express from 'express';
import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Anthropic only if API key is available
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const FIRECRAWL_BASE_URL = 'https://api.firecrawl.dev/v1';

/**
 * POST /scrape
 * Scrape a company website and extract relevant sales intel
 */
router.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Use Firecrawl to scrape the website
    const firecrawlResponse = await axios.post(
      `${FIRECRAWL_BASE_URL}/scrape`,
      {
        url,
        formats: ['markdown', 'html'],
        onlyMainContent: true
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const page = firecrawlResponse.data.data;
    const pages = page ? [page] : [];

    // Extract relevant information from scraped content
    const extracted = extractSalesIntel(pages);

    res.json({
      success: true,
      url,
      pagesScraped: pages.length,
      intel: extracted
    });
  } catch (error) {
    console.error('Scrape error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to scrape website',
      details: error.response?.data || error.message
    });
  }
});

/**
 * POST /search
 * Search for company news and mentions using Firecrawl Search
 */
router.post('/search', async (req, res) => {
  try {
    const { query, company } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Use Firecrawl Search API
    const searchResponse = await axios.post(
      `${FIRECRAWL_BASE_URL}/search`,
      {
        query: query || company,
        limit: 10,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const results = searchResponse.data.data || [];

    res.json({
      success: true,
      query,
      resultsCount: results.length,
      results: results.map(r => ({
        title: r.title,
        url: r.url,
        description: r.description,
        content: r.markdown
      }))
    });
  } catch (error) {
    console.error('Search error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to search',
      details: error.response?.data || error.message
    });
  }
});

/**
 * POST /summarize
 * Generate pitch-ready summary from scraped intel
 */
router.post('/summarize', async (req, res) => {
  try {
    const { company, person, intel, product } = req.body;

    if (!intel) {
      return res.status(400).json({ error: 'Intel data is required' });
    }

    // If no Anthropic API key, return a demo summary
    if (!anthropic) {
      const demoSummary = {
        companyOverview: `Demo mode: ${company || 'Company'} appears to be a growing business. Add your ANTHROPIC_API_KEY for real AI analysis.`,
        painPoints: ['Scaling sales operations', 'Improving team productivity', 'Managing pipeline visibility'],
        talkingPoints: ['Automation saves 10+ hours/week', 'Real-time pipeline insights', 'Easy integration with existing tools'],
        objections: ['Budget constraints', 'Timing - not ready to switch'],
        personalConnection: 'Add ANTHROPIC_API_KEY for personalized intel',
        discoveryQuestions: ['What does your current process look like?', 'What are your biggest bottlenecks?', 'How do you measure success?'],
        redFlags: [],
        greenFlags: ['Active hiring suggests growth', 'Recent funding indicates budget']
      };
      return res.json({ success: true, summary: demoSummary });
    }

    const prompt = `You are a sales intelligence assistant. Analyze this prospect research and create a pitch preparation summary.

COMPANY: ${company || 'Unknown'}
PROSPECT: ${person || 'Unknown'}
YOUR PRODUCT: ${product || 'B2B Sales Platform'}

SCRAPED INTELLIGENCE:
${JSON.stringify(intel, null, 2)}

Create a concise, actionable pitch prep brief with:
1. Company Overview (funding, size, growth signals)
2. Key Pain Points (what they likely need based on intel)
3. Talking Points (how your product solves their problems)
4. Potential Objections (what they might push back on)
5. Personal Connection (anything about the prospect specifically)
6. Questions to Ask (discovery questions based on intel)

Format as JSON with these exact keys:
- companyOverview (string)
- painPoints (array of strings)
- talkingPoints (array of strings)
- objections (array of strings)
- personalConnection (string)
- discoveryQuestions (array of strings)
- redFlags (array of strings - any concerning signals)
- greenFlags (array of strings - positive buying signals)

Respond ONLY with valid JSON, no other text.`;

    const anthropicResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: 'You are an expert sales strategist. Respond with ONLY valid JSON, no markdown, no code blocks.',
        messages: [
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    const rawText = anthropicResponse.data.content[0].text;
    // Extract JSON from markdown code blocks if present
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || rawText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawText;
    const summary = JSON.parse(jsonText.trim());

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Summarize error:', error.message);
    res.status(500).json({
      error: 'Failed to generate summary',
      details: error.message
    });
  }
});

/**
 * POST /full-research
 * Complete research pipeline: scrape + search + summarize
 */
router.post('/full-research', async (req, res) => {
  try {
    const { companyUrl, prospectName, companyName, yourProduct } = req.body;

    if (!companyUrl) {
      return res.status(400).json({ error: 'Company URL is required' });
    }

    const results = {
      company: companyName || new URL(companyUrl).hostname,
      prospect: prospectName,
      scrapedData: null,
      searchResults: null,
      summary: null
    };

    // Step 1: Scrape company website
    try {
      const firecrawlResponse = await axios.post(
        `${FIRECRAWL_BASE_URL}/scrape`,
        {
          url: companyUrl,
          formats: ['markdown'],
          onlyMainContent: true
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const page = firecrawlResponse.data.data;
      results.scrapedData = extractSalesIntel(page ? [page] : []);
    } catch (e) {
      console.log('Website scrape failed, continuing:', e.message);
    }

    // Step 2: Search for news/mentions
    try {
      const searchResponse = await axios.post(
        `${FIRECRAWL_BASE_URL}/search`,
        {
          query: `${companyName || 'company'} funding news 2025 2026`,
          limit: 5,
          scrapeOptions: {
            formats: ['markdown']
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      results.searchResults = searchResponse.data.results?.slice(0, 3) || [];
    } catch (e) {
      console.log('Search failed, continuing:', e.message);
    }

    // Step 3: Generate summary
    const allIntel = {
      website: results.scrapedData,
      news: results.searchResults
    };

    try {
      // If no Anthropic API key, return demo summary
      if (!anthropic) {
        results.summary = {
          companyOverview: `Demo mode: ${companyName || 'Company'} appears to be a growing business based on ${companyUrl}. Add your ANTHROPIC_API_KEY for real AI analysis.`,
          painPoints: ['Scaling sales operations', 'Improving team productivity', 'Managing pipeline visibility'],
          talkingPoints: ['Automation saves 10+ hours/week', 'Real-time pipeline insights', 'Easy integration with existing tools'],
          objections: ['Budget constraints', 'Timing - not ready to switch'],
          personalConnection: 'Add ANTHROPIC_API_KEY for personalized intel',
          discoveryQuestions: ['What does your current process look like?', 'What are your biggest bottlenecks?', 'How do you measure success?'],
          redFlags: [],
          greenFlags: ['Active hiring suggests growth', 'Recent funding indicates budget']
        };
      } else {
        const prompt = `You are a sales intelligence assistant. Analyze this prospect research and create a pitch preparation summary.

COMPANY: ${companyName || 'Unknown'}
PROSPECT: ${prospectName || 'Unknown'}
YOUR PRODUCT: ${yourProduct || 'B2B Sales Platform'}

SCRAPED INTELLIGENCE:
${JSON.stringify(allIntel, null, 2)}

Create a concise, actionable pitch prep brief with:
1. Company Overview (funding, size, growth signals)
2. Key Pain Points (what they likely need based on intel)
3. Talking Points (how your product solves their problems)
4. Potential Objections (what they might push back on)
5. Personal Connection (anything about the prospect specifically)
6. Questions to Ask (discovery questions based on intel)

Format as JSON with these exact keys:
- companyOverview (string, 2-3 sentences)
- painPoints (array of 3-5 strings)
- talkingPoints (array of 3-5 strings)
- objections (array of 2-3 strings)
- personalConnection (string)
- discoveryQuestions (array of 3-5 strings)
- redFlags (array of strings - any concerning signals)
- greenFlags (array of strings - positive buying signals)

Respond ONLY with valid JSON, no other text.`;

        const anthropicResponse = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2000,
            system: 'You are an expert sales strategist who creates concise, actionable pitch briefs. Always respond with valid JSON.',
            messages: [
              { role: 'user', content: prompt }
            ]
          },
          {
            headers: {
              'x-api-key': process.env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json'
            }
          }
        );

        const rawText = anthropicResponse.data.content[0].text;
        // Extract JSON from markdown code blocks if present
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || rawText.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawText;
        results.summary = JSON.parse(jsonText.trim());
      }
    } catch (e) {
      console.log('Summary generation failed:', e.message);
      results.summary = {
        companyOverview: 'Summary generation unavailable',
        painPoints: ['Unknown - manual research needed'],
        talkingPoints: ['Focus on discovering their needs'],
        objections: ['Budget constraints', 'Timing concerns'],
        personalConnection: 'Research the prospect before the call',
        discoveryQuestions: ['What are your biggest challenges?', 'How do you currently handle this?'],
        redFlags: [],
        greenFlags: []
      };
    }

    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Full research error:', error.message);
    res.status(500).json({
      error: 'Research failed',
      details: error.message
    });
  }
});

// Helper function to extract sales-relevant intel
function extractSalesIntel(pages) {
  const intel = {
    about: '',
    team: [],
    funding: '',
    products: [],
    hiring: [],
    news: [],
    techStack: []
  };

  const fundingKeywords = ['funding', 'raised', 'series', 'investment', 'investors', 'valuation'];
  const hiringKeywords = ['hiring', 'careers', 'jobs', 'openings', 'join our team'];
  const techKeywords = ['tech stack', 'technology', 'powered by', 'built with'];

  pages.forEach(page => {
    const content = page.markdown || page.html || '';
    const lowerContent = content.toLowerCase();
    const url = page.url || '';

    // Detect page type
    if (url.includes('about') || lowerContent.includes('about us')) {
      intel.about = content.slice(0, 1000);
    }

    if (url.includes('team') || url.includes('leadership')) {
      intel.team.push({ url, content: content.slice(0, 500) });
    }

    // Check for funding mentions
    if (fundingKeywords.some(k => lowerContent.includes(k))) {
      intel.funding += content.slice(0, 500) + '\n';
    }

    // Check for hiring signals
    if (hiringKeywords.some(k => lowerContent.includes(k)) || url.includes('careers')) {
      intel.hiring.push({ url, content: content.slice(0, 300) });
    }

    // Products/services
    if (url.includes('product') || url.includes('solution') || url.includes('services')) {
      intel.products.push({ url, content: content.slice(0, 500) });
    }
  });

  return intel;
}

export default router;
