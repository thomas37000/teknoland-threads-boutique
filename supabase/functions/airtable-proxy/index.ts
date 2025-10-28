import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AIRTABLE_URL = Deno.env.get('VITE_AIRTABLE_URL');
    const AIRTABLE_KEY = Deno.env.get('VITE_AIRTABLE_KEY');

    if (!AIRTABLE_URL || !AIRTABLE_KEY) {
      console.error('Missing Airtable credentials');
      return new Response(
        JSON.stringify({ error: 'Airtable credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { method, table, recordId, fields } = await req.json();
    console.log(`Airtable proxy: ${method} request for table ${table}`, { recordId });

    let url = `${AIRTABLE_URL}/${table}`;
    if (recordId && (method === 'PATCH' || method === 'DELETE')) {
      url += `/${recordId}`;
    }

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${AIRTABLE_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    if (fields && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify({ fields });
    }

    console.log(`Calling Airtable: ${url}`);
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error('Airtable error:', data);
      return new Response(
        JSON.stringify({ error: data.error || 'Airtable request failed' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Airtable request successful');
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in airtable-proxy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
