import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { requireAdmin } from '../_shared/require-admin.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Auth: either the shared cron secret, or an authenticated admin
    let isCron = false
    const cronSecret = req.headers.get('x-cron-secret')
    if (cronSecret) {
      const { data: expected } = await supabaseClient.rpc('get_discogs_cron_secret')
      isCron = !!expected && cronSecret === expected
    }

    if (!isCron) {
      const { response } = await requireAdmin(req, corsHeaders, 'cleanup-expired-cart')
      if (response) return response
    }

    const { data, error } = await supabaseClient
      .from('cart_items')
      .delete()
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      console.error('Error cleaning up cart items:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Successfully cleaned up expired cart items')

    return new Response(
      JSON.stringify({
        message: 'Cart cleanup completed successfully',
        deletedCount: data?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Exception in cart cleanup:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
