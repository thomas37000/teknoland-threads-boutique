import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getLiveFollowers(airtableUrl: string, airtableKey: string) {
  const SOUNDCLOUD_CLIENT_ID = Deno.env.get('SOUNDCLOUD_CLIENT_ID');
  
  if (!SOUNDCLOUD_CLIENT_ID) {
    console.error('Missing SoundCloud credentials');
    return new Response(
      JSON.stringify({ error: 'SoundCloud credentials not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Fetch all artists from Airtable
    console.log('Fetching artists from Airtable for live followers...');
    const artistsResponse = await fetch(`${airtableUrl}/Artistes`, {
      headers: {
        'Authorization': `Bearer ${airtableKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!artistsResponse.ok) {
      throw new Error(`Failed to fetch artists: ${artistsResponse.statusText}`);
    }

    const artistsData = await artistsResponse.json();
    const artists = artistsData.records || [];
    console.log(`Found ${artists.length} artists`);

    const artistsWithLiveFollowers = [];

    // Get live followers for each artist
    for (const artist of artists) {
      const soundcloudUrl = artist.fields.Soundcloud_url;
      
      if (!soundcloudUrl) {
        artistsWithLiveFollowers.push({
          ...artist,
          liveFollowers: artist.fields.Followers || 0
        });
        continue;
      }

      try {
        // Resolve SoundCloud URL to get user info
        const resolveUrl = `https://api.soundcloud.com/resolve?url=${encodeURIComponent(soundcloudUrl)}&client_id=${SOUNDCLOUD_CLIENT_ID}`;
        
        const scResponse = await fetch(resolveUrl);
        
        if (!scResponse.ok) {
          console.error(`SoundCloud API error for ${artist.fields.Name}: ${scResponse.statusText}`);
          artistsWithLiveFollowers.push({
            ...artist,
            liveFollowers: artist.fields.Followers || 0
          });
          continue;
        }

        const scData = await scResponse.json();
        const followers = scData.followers_count || 0;

        artistsWithLiveFollowers.push({
          ...artist,
          liveFollowers: followers
        });
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error processing ${artist.fields.Name}:`, error);
        artistsWithLiveFollowers.push({
          ...artist,
          liveFollowers: artist.fields.Followers || 0
        });
      }
    }

    console.log(`Live followers fetched for ${artistsWithLiveFollowers.length} artists`);
    
    return new Response(
      JSON.stringify({ 
        records: artistsWithLiveFollowers
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in getLiveFollowers:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function syncSoundCloudFollowers(airtableUrl: string, airtableKey: string) {
  const SOUNDCLOUD_CLIENT_ID = Deno.env.get('SOUNDCLOUD_CLIENT_ID');
  
  if (!SOUNDCLOUD_CLIENT_ID) {
    console.error('Missing SoundCloud credentials');
    return new Response(
      JSON.stringify({ error: 'SoundCloud credentials not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Fetch all artists from Airtable
    console.log('Fetching artists from Airtable...');
    const artistsResponse = await fetch(`${airtableUrl}/Artistes`, {
      headers: {
        'Authorization': `Bearer ${airtableKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!artistsResponse.ok) {
      throw new Error(`Failed to fetch artists: ${artistsResponse.statusText}`);
    }

    const artistsData = await artistsResponse.json();
    const artists = artistsData.records || [];
    console.log(`Found ${artists.length} artists`);

    let updated = 0;
    let skipped = 0;

    // Process each artist
    for (const artist of artists) {
      const soundcloudUrl = artist.fields.Soundcloud_url;
      
      if (!soundcloudUrl) {
        console.log(`Skipping ${artist.fields.Name}: No SoundCloud URL`);
        skipped++;
        continue;
      }

      try {
        // Resolve SoundCloud URL to get user info
        console.log(`Fetching SoundCloud data for ${artist.fields.Name}...`);
        const resolveUrl = `https://api.soundcloud.com/resolve?url=${encodeURIComponent(soundcloudUrl)}&client_id=${SOUNDCLOUD_CLIENT_ID}`;
        
        const scResponse = await fetch(resolveUrl);
        
        if (!scResponse.ok) {
          console.error(`SoundCloud API error for ${artist.fields.Name}: ${scResponse.statusText}`);
          skipped++;
          continue;
        }

        const scData = await scResponse.json();
        const followers = scData.followers_count || 0;

        console.log(`${artist.fields.Name}: ${followers} followers`);

        // Update Airtable record
        const updateResponse = await fetch(`${airtableUrl}/Artistes/${artist.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${airtableKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              Followers: followers
            }
          }),
        });

        if (!updateResponse.ok) {
          console.error(`Failed to update ${artist.fields.Name}: ${updateResponse.statusText}`);
          skipped++;
          continue;
        }

        updated++;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`Error processing ${artist.fields.Name}:`, error);
        skipped++;
      }
    }

    console.log(`Sync complete: ${updated} updated, ${skipped} skipped`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        updated, 
        skipped,
        total: artists.length 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in syncSoundCloudFollowers:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

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

    const { method, table, recordId, fields, action } = await req.json();

    // Handle get-live-followers action
    if (action === 'get-live-followers') {
      return await getLiveFollowers(AIRTABLE_URL, AIRTABLE_KEY);
    }

    // Handle sync-followers action
    if (action === 'sync-followers') {
      return await syncSoundCloudFollowers(AIRTABLE_URL, AIRTABLE_KEY);
    }
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
