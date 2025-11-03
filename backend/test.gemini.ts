// test-gemini.js
// Run this with: node test-gemini.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Your API key
const API_KEY = 'AIzaSyD-Z014BURIxGkqAhrgg-J4vxgw328kCl8';

async function testGemini() {
  console.log('🧪 Testing Gemini API...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    console.log('1️⃣ Testing gemini-pro model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent('Say hello in one sentence.');
    const response = result.response.text();
    
    console.log('✅ Success! Response:', response);
    console.log('\n✅ Your Gemini API is working correctly!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n📋 Error details:', error);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n⚠️  Your API key appears to be invalid.');
      console.error('Please check: https://makersuite.google.com/app/apikey');
    } else if (error.message.includes('404')) {
      console.error('\n⚠️  Model not found. Try these alternatives:');
      console.error('   - gemini-pro');
      console.error('   - gemini-1.5-pro');
      console.error('   - gemini-1.5-flash');
    }
  }
}

// List available models
async function listModels() {
  try {
    console.log('\n2️⃣ Testing model availability...');
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    const modelsToTest = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest'
    ];
    
    console.log('\nTesting models:');
    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('test');
        console.log(`  ✅ ${modelName} - Working`);
      } catch (error) {
        console.log(`  ❌ ${modelName} - Not available (${error.message.split(':')[0]})`);
      }
    }
    
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

// Run tests
(async () => {
  await testGemini();
  await listModels();
})();