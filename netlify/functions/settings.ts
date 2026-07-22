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
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase settings query warning:', error.message || JSON.stringify(error));
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(null),
        };
      }

      if (!data) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(null),
        };
      }

      const settings = {
        siteTitle: data.site_title || '',
        siteSubtitle: data.site_subtitle || '',
        siteTagline: data.site_tagline || '',
        bio: data.bio || '',
        profileImage: data.profile_image || '',
        instagramUrl: data.instagram_url || '',
        vimeoUrl: data.vimeo_url || '',
        youtubeUrl: data.youtube_url || '',
        exploreDanceUrl: data.explore_dance_url || '',
        contactEmail: data.contact_email || '',
        contactPhone: data.contact_phone || '',
        accentColor: data.accent_color || '',
        heroVideoUrl: data.hero_video_url || '',
        seoKeywords: data.seo_keywords || '',
        adminPasscode: data.admin_passcode || '',
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(settings),
      };
    }

    if (event.httpMethod === 'POST') {
      const settings = JSON.parse(event.body || '{}');

      const row = {
        id: 'default',
        site_title: settings.siteTitle,
        site_subtitle: settings.siteSubtitle,
        site_tagline: settings.siteTagline,
        bio: settings.bio,
        profile_image: settings.profileImage,
        instagram_url: settings.instagramUrl,
        vimeo_url: settings.vimeoUrl,
        youtube_url: settings.youtubeUrl,
        explore_dance_url: settings.exploreDanceUrl,
        contact_email: settings.contactEmail,
        contact_phone: settings.contactPhone,
        accent_color: settings.accentColor,
        hero_video_url: settings.heroVideoUrl,
        seo_keywords: settings.seoKeywords,
        admin_passcode: settings.adminPasscode,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('site_settings').upsert(row, { onConflict: 'id' });
      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Settings saved successfully' }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  } catch (err: any) {
    const errMsg = err?.message || err?.details || (typeof err === 'object' ? JSON.stringify(err) : String(err));
    console.error('Settings Function Error:', errMsg);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: errMsg }),
    };
  }
};
