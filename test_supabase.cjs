require('dotenv').config({ path: require('path').join(__dirname, 'backend', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY in backend/.env!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const preReg = {
        id: 'pr-test-' + Date.now(),
        name: 'Test Setup',
        email: 'test@example.com',
        phone: '00000',
        amount_paid: 1000,
        claimed: false,
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('pre_registrations').upsert(preReg).select();

    if (error) {
        console.error("Error inserting:", error);
    } else {
        console.log("Success:", data);
    }
}

testInsert();
