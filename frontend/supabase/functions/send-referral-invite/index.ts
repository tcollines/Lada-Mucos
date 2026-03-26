import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Require caller to be authenticated
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const { email, referrerCode, origin } = await req.json();

        if (!email || !referrerCode) {
            return new Response(JSON.stringify({ error: 'email and referrerCode are required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Admin client with service-role key (stored as a Supabase secret)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // Supabase Auth redirects strip the # fragment (like #/signup), so we must pass 
        // the redirect URL cleanly and ensure the app router handles the ref parameter.
        const baseUrl = origin || 'https://lada.ug';
        const referralUrl = `${baseUrl}/?ref=${referrerCode}#/signup`;

        const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: referralUrl,
            data: { referrer_code: referrerCode },
        });

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(
            JSON.stringify({ success: true, message: `Invite sent to ${email}` }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message ?? 'Internal server error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
