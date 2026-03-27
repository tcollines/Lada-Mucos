const https = require('https');

https.get('https://frhaqssmnzqqvvecnrqe.supabase.co/functions/v1/invalid', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Edge Function 404:\n', data));
});

https.get('https://frhaqssmnzqqvvecnrqe.supabase.co/invalid', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Root 404:\n', data));
});
