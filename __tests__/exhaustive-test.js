import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3001/api';

async function testEndpoint(name, url, options, expectError = false) {
  try {
    const res = await fetch(`${API_BASE}${url}`, options);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.log(`[❌] ${name} FAILED with status ${res.status}: ${errorText}`);
      if (!expectError) return false;
      return true;
    }
    
    // Check if it's a stream
    if (res.headers.get('content-type')?.includes('text/event-stream')) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let output = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += decoder.decode(value, { stream: true });
      }
      if (output.includes('error')) {
        console.log(`[❌] ${name} STREAM ERROR: ${output.substring(0, 100)}...`);
        if (!expectError) return false;
      } else {
        console.log(`[✅] ${name} STREAM SUCCESS (${output.length} bytes)`);
      }
    } else {
      const json = await res.json();
      console.log(`[✅] ${name} SUCCESS:`, JSON.stringify(json).substring(0, 100) + '...');
    }
    return !expectError;
  } catch (err) {
    console.log(`[❌] ${name} EXCEPTION: ${err.message}`);
    return expectError;
  }
}

async function runTests() {
  console.log('--- STARTING EXHAUSTIVE API TESTS ---');

  // 1. Chat Mentor
  await testEndpoint('Chat - Normal', '/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Hi' }] })
  });
  await testEndpoint('Chat - Invalid body', '/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: 'not an array' })
  }, true);
  await testEndpoint('Chat - Empty messages', '/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [] })
  }, true);

  // 2. Verify Information
  await testEndpoint('Verify - Normal', '/verify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim: 'EVMs can be hacked via bluetooth' })
  });
  await testEndpoint('Verify - Nonsense claim', '/verify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim: 'asdfasdfasdfasdf' })
  });
  await testEndpoint('Verify - Empty claim', '/verify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim: '' })
  }, true);

  // 3. Election Info
  await testEndpoint('Info - Normal', '/election-info', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'When is the next election in Maharashtra?' })
  });

  // 4. Simulate
  await testEndpoint('Simulate - Normal', '/simulate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step: 1, stepName: 'Prep', facts: ['Fact 1'] })
  });
  await testEndpoint('Simulate - Missing step', '/simulate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stepName: 'Prep' })
  }, true);

  // 5. Image Analyze
  // We need a dummy image
  const formData = new FormData();
  formData.append('image', new Blob(['fake image data'], { type: 'image/png' }), 'test.png');
  formData.append('prompt', 'Test prompt');
  
  await testEndpoint('Analyze - Invalid Image Data', '/analyze', {
    method: 'POST',
    body: formData
  }); // This might fail because it's fake image data, let's see what Gemini does

  console.log('--- TESTS COMPLETE ---');
}

runTests();
