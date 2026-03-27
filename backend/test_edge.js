const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
    try {
        const { data, error } = await supabase.functions.invoke('send-referral-invite', {
            body: { email: 'brandagl9@gmail.com', referrerCode: 'LADA-TEST', origin: 'https://lada-mucos.vercel.app' }
        });
        console.log('Result Data:', data);
        if (error && error.context) {
            const errBody = await error.context.json();
            console.log('Parsed Error JSON:', errBody);
        } else {
            console.log('Result Error:', error);
        }
    } catch (err) {
        console.error('Fetch Exception:', err);
    }
})();
