import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ibexapbzkiboasjyysgo.supabase.co';
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
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase inquiries query warning:', error.message || JSON.stringify(error));
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([]),
        };
      }

      const inquiries = (data || []).map((row) => ({
        id: row.id,
        name: row.name || '',
        email: row.email || '',
        projectType: row.project_type || 'General',
        budget: row.budget || '',
        message: row.message || '',
        createdAt: row.created_at || new Date().toISOString(),
        status: row.status || 'new',
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(inquiries),
      };
    }

    if (event.httpMethod === 'POST') {
      const payload = JSON.parse(event.body || '[]');
      const inquiriesArray = Array.isArray(payload) ? payload : [payload];

      const dbRows = inquiriesArray.map((inq: any) => ({
        id: inq.id,
        name: inq.name,
        email: inq.email,
        project_type: inq.projectType,
        budget: inq.budget,
        message: inq.message,
        created_at: inq.createdAt || new Date().toISOString(),
        status: inq.status || 'new',
      }));

      const { error } = await supabase.from('contact_inquiries').upsert(dbRows, { onConflict: 'id' });
      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Inquiry saved successfully' }),
      };
    }

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
          body: JSON.stringify({ error: 'Missing inquiry id' }),
        };
      }

      const { error } = await supabase.from('contact_inquiries').delete().eq('id', id);
      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: `Inquiry ${id} deleted successfully` }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  } catch (err: any) {
    const errMsg = err?.message || err?.details || (typeof err === 'object' ? JSON.stringify(err) : String(err));
    console.error('Inquiries Function Error:', errMsg);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: errMsg }),
    };
  }
};
