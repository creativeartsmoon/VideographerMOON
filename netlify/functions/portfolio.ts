import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ibexapbzkiboasjyysgo.supabase.co';
  // Prioritize Service Role Key for backend Netlify function, fallback to Anon Key if not set
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cmjHKv0qgQIao-81vFfx3w_r5kTm_mZ';

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Supabase environment variables not configured on server' }),
    };
  }

  try {
    // GET: Fetch portfolio items
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('year', { ascending: false });

      if (error) {
        console.warn('Supabase portfolio query warning:', error.message || JSON.stringify(error));
        // Return 200 with empty array if table doesn't exist yet or query fails
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([]),
        };
      }

      const items = (data || []).map((row) => ({
        id: row.id,
        title: row.title || '',
        category: row.category || 'Commercial',
        description: row.description || '',
        videoUrl: row.video_url || '',
        thumbnailUrl: row.thumbnail_url || '',
        year: row.year || '',
        role: row.role || '',
        client: row.client || '',
        gearUsed: row.gear_used || '',
        featured: Boolean(row.featured),
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(items),
      };
    }

    // POST: Save/Upsert portfolio items (array or single)
    if (event.httpMethod === 'POST') {
      const payload = JSON.parse(event.body || '[]');
      const itemsArray = Array.isArray(payload) ? payload : [payload];

      const dbRows = itemsArray.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        description: item.description,
        video_url: item.videoUrl,
        thumbnail_url: item.thumbnailUrl,
        year: item.year,
        role: item.role,
        client: item.client,
        gear_used: item.gearUsed,
        featured: item.featured,
      }));

      const { error: upsertError } = await supabase
        .from('portfolio_items')
        .upsert(dbRows, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      // Handle full list sync: if array provided, delete items missing from array
      if (Array.isArray(payload)) {
        const keepIds = itemsArray.map((i: any) => i.id);
        if (keepIds.length > 0) {
          const { data: allItems } = await supabase.from('portfolio_items').select('id');
          if (allItems) {
            const deleteIds = allItems.map((row) => row.id).filter((id) => !keepIds.includes(id));
            if (deleteIds.length > 0) {
              await supabase.from('portfolio_items').delete().in('id', deleteIds);
            }
          }
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Portfolio updated successfully' }),
      };
    }

    // DELETE: Delete a single item by query param ?id=... or body { id }
    if (event.httpMethod === 'DELETE') {
      let id = event.queryStringParameters?.id;
      if (!id && event.body) {
        try {
          const parsed = JSON.parse(event.body);
          id = parsed.id;
        } catch (e) {
          // ignore
        }
      }

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing item id for deletion' }),
        };
      }

      const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: `Item ${id} deleted successfully` }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  } catch (err: any) {
    const errMsg = err?.message || err?.details || (typeof err === 'object' ? JSON.stringify(err) : String(err));
    console.error('Portfolio Function Error:', errMsg);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: errMsg }),
    };
  }
};
