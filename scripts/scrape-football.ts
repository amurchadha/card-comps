/**
 * Cardboard Connection Football Checklist Scraper
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BASE_URL = 'https://www.cardboardconnection.com';
const DELAY_MS = 1000;

const YEARS = [
  '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017',
  '2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007',
  '2006', '2005',
];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPage(url: string, retries = 3): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CardCompsBot/1.0)' },
      });
      if (response.ok) return await response.text();
      if (response.status === 404) return null;
    } catch { /* retry */ }
    await delay(DELAY_MS);
  }
  return null;
}

function extractSetUrls(html: string): string[] {
  const urls: string[] = [];
  const linkRegex = /href="(https:\/\/www\.cardboardconnection\.com\/\d{4}-[^"]+football[^"]*)"/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    if (!urls.includes(match[1])) urls.push(match[1]);
  }
  return urls;
}

function parseSetMetadata(url: string, html: string) {
  const urlMatch = url.match(/\/(\d{4})-([^\/]+)/);
  const year = urlMatch ? urlMatch[1] : '';
  const slug = urlMatch ? urlMatch[2] : '';
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || html.match(/<title>([^<|]+)/i);
  const name = titleMatch ? titleMatch[1].trim() : slug.replace(/-/g, ' ');

  let manufacturer = 'Unknown';
  const lower = slug.toLowerCase();
  if (lower.includes('panini') || lower.includes('prizm') || lower.includes('donruss') || lower.includes('select') || lower.includes('mosaic') || lower.includes('contenders') || lower.includes('optic')) {
    manufacturer = 'Panini';
  } else if (lower.includes('topps') || lower.includes('bowman') || lower.includes('chrome')) {
    manufacturer = 'Topps';
  } else if (lower.includes('leaf')) {
    manufacturer = 'Leaf';
  } else if (lower.includes('upper-deck')) {
    manufacturer = 'Upper Deck';
  }

  let productLine = '';
  const patterns = ['prizm', 'select', 'mosaic', 'donruss', 'contenders', 'optic', 'national-treasures', 'flawless', 'immaculate', 'spectra', 'origins', 'chronicles', 'score', 'absolute', 'phoenix', 'certified', 'chrome', 'finest', 'bowman'];
  for (const p of patterns) {
    if (lower.includes(p)) { productLine = p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); break; }
  }
  return { name, year, manufacturer, productLine };
}

interface CardEntry { cardNumber: string; playerName: string; team: string; subsetName: string; isRookie: boolean; isAutograph: boolean; isInsert: boolean; }

function parseChecklist(html: string): CardEntry[] {
  const cards: CardEntry[] = [];
  const seen = new Set<string>();
  const text = html.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
  const entries = text.split(/<br\s*\/?>/gi);

  let currentSubset = 'Base', isRookie = false, isAuto = false, isInsert = false;

  for (const entry of entries) {
    const clean = entry.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) continue;

    if (/^(base\s*(set|cards?)|checklist)/i.test(clean) && clean.length < 80) { currentSubset = 'Base'; isRookie = false; isAuto = false; isInsert = false; continue; }
    if (/rookie/i.test(clean) && clean.length < 80 && !/\d+\s+\w/.test(clean)) { currentSubset = 'Rookies'; isRookie = true; isAuto = false; isInsert = false; continue; }
    if (/(autograph|signature)/i.test(clean) && clean.length < 80 && !/\d+\s+\w/.test(clean)) { currentSubset = 'Autographs'; isRookie = false; isAuto = true; isInsert = false; continue; }

    const cardMatch = clean.match(/^(\d+)\s+([A-Z][a-zA-Z\.\s\-']+?(?:\s+(?:Jr\.|Sr\.|III|II|IV))?)\s*[-–]\s*(.+)$/);
    if (cardMatch) {
      const [, cardNumber, playerName, team] = cardMatch;
      if (playerName.length < 2 || /^(checklist|header|team|logo)/i.test(playerName)) continue;
      const key = `${cardNumber}-${playerName}-${currentSubset}`;
      if (seen.has(key)) continue;
      seen.add(key);
      cards.push({ cardNumber: cardNumber.trim(), playerName: playerName.trim(), team: team.trim(), subsetName: currentSubset, isRookie, isAutograph: isAuto, isInsert });
    }
  }
  return cards;
}

async function scrapeYear(year: string) {
  console.log(`\n=== Scraping ${year} football sets ===`);
  const yearUrl = `${BASE_URL}/sports-cards-sets/nfl-football-cards/${year}-football-cards`;
  const yearHtml = await fetchPage(yearUrl);
  if (!yearHtml) { console.log(`Failed to fetch year page for ${year}`); return; }

  const setUrls = extractSetUrls(yearHtml);
  console.log(`Found ${setUrls.length} set URLs`);

  for (const setUrl of setUrls) {
    console.log(`\nProcessing: ${setUrl}`);
    await delay(DELAY_MS);
    const setHtml = await fetchPage(setUrl);
    if (!setHtml) continue;

    const metadata = parseSetMetadata(setUrl, setHtml);
    console.log(`  Set: ${metadata.name}`);

    const { data: existingSet } = await supabase.from('card_sets').select('id').eq('source_url', setUrl).single();
    let setId: string;

    if (existingSet) {
      setId = existingSet.id;
    } else {
      const { data: newSet, error } = await supabase.from('card_sets').insert({
        name: metadata.name, year: metadata.year, sport: 'football',
        manufacturer: metadata.manufacturer, product_line: metadata.productLine, source_url: setUrl,
      }).select('id').single();
      if (error) { console.log(`  Error: ${error.message}`); continue; }
      setId = newSet.id;
      console.log(`  Created set: ${setId}`);
    }

    const cards = parseChecklist(setHtml);
    console.log(`  Found ${cards.length} cards`);
    if (cards.length === 0) continue;

    await supabase.from('card_catalog').delete().eq('set_id', setId);
    for (let i = 0; i < cards.length; i += 100) {
      const batch = cards.slice(i, i + 100).map(c => ({
        set_id: setId, card_number: c.cardNumber, player_name: c.playerName, team: c.team,
        subset_name: c.subsetName, is_rookie: c.isRookie, is_autograph: c.isAutograph, is_insert: c.isInsert,
      }));
      await supabase.from('card_catalog').insert(batch);
    }
    console.log(`  Inserted ${cards.length} cards`);
  }
}

async function main() {
  console.log('Football Checklist Scraper\n');
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) { console.error('Missing env vars'); process.exit(1); }
  for (const year of YEARS) await scrapeYear(year);
  const { count } = await supabase.from('card_catalog').select('*', { count: 'exact', head: true });
  console.log(`\nTotal cards in DB: ${count}`);
}

main().catch(console.error);
