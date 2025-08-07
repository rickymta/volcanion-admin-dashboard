#!/usr/bin/env node

/**
 * API Mode Switcher
 * Utility script to switch between Mock API and Real API modes
 * 
 * Usage:
 * npm run api:mock     - Switch to Mock API mode
 * npm run api:real     - Switch to Real API mode
 * npm run api:status   - Check current API mode
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env');

function readEnvFile() {
  try {
    return fs.readFileSync(ENV_FILE, 'utf8');
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message);
    process.exit(1);
  }
}

function writeEnvFile(content) {
  try {
    fs.writeFileSync(ENV_FILE, content, 'utf8');
  } catch (error) {
    console.error('❌ Error writing .env file:', error.message);
    process.exit(1);
  }
}

function updateEnvValue(content, key, value) {
  const lines = content.split('\n');
  let found = false;
  
  const updatedLines = lines.map(line => {
    if (line.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  
  if (!found) {
    updatedLines.push(`${key}=${value}`);
  }
  
  return updatedLines.join('\n');
}

function getCurrentMode() {
  const content = readEnvFile();
  const match = content.match(/REACT_APP_MOCK_API=(.+)/);
  return match ? match[1].trim() : 'unknown';
}

function switchToMock() {
  console.log('🔧 Switching to Mock API mode...\n');
  
  let content = readEnvFile();
  content = updateEnvValue(content, 'REACT_APP_MOCK_API', 'true');
  content = updateEnvValue(content, 'REACT_APP_API_URL', 'http://localhost:3001/api');
  
  writeEnvFile(content);
  
  console.log('✅ Successfully switched to Mock API mode');
  console.log('📋 Configuration:');
  console.log('   • API Mode: Mock');
  console.log('   • API URL: http://localhost:3001/api');
  console.log('   • Demo Credentials: john.doe@volcanion.com / password123');
  console.log('\n🔄 Please restart your development server for changes to take effect');
}

function switchToReal() {
  console.log('🌐 Switching to Real API mode...\n');
  
  let content = readEnvFile();
  content = updateEnvValue(content, 'REACT_APP_MOCK_API', 'false');
  content = updateEnvValue(content, 'REACT_APP_API_URL', 'https://localhost:7258/api');
  
  writeEnvFile(content);
  
  console.log('✅ Successfully switched to Real API mode');
  console.log('📋 Configuration:');
  console.log('   • API Mode: Real');
  console.log('   • API URL: https://localhost:7258/api');
  console.log('   • Login Endpoint: https://localhost:7258/api/v1/auth/login');
  console.log('   • Refresh Endpoint: https://localhost:7258/api/v1/auth/refresh-token');
  console.log('\n⚠️  Make sure your backend server is running on https://localhost:7258');
  console.log('🔄 Please restart your development server for changes to take effect');
}

function showStatus() {
  const currentMode = getCurrentMode();
  const isMock = currentMode === 'true';
  
  console.log('📊 Current API Configuration:\n');
  console.log(`   • Mode: ${isMock ? '🔧 Mock API' : '🌐 Real API'}`);
  console.log(`   • REACT_APP_MOCK_API: ${currentMode}`);
  
  if (isMock) {
    console.log('   • API URL: http://localhost:3001/api');
    console.log('   • Demo Account: john.doe@volcanion.com / password123');
  } else {
    console.log('   • API URL: https://localhost:7258/api');
    console.log('   • Login: https://localhost:7258/api/v1/auth/login');
    console.log('   • Refresh: https://localhost:7258/api/v1/auth/refresh-token');
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'mock':
    switchToMock();
    break;
  case 'real':
    switchToReal();
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log('🚀 API Mode Switcher\n');
    console.log('Usage:');
    console.log('  node scripts/api-switcher.js mock    - Switch to Mock API');
    console.log('  node scripts/api-switcher.js real    - Switch to Real API');
    console.log('  node scripts/api-switcher.js status  - Show current mode');
    console.log('\nOr use npm scripts:');
    console.log('  npm run api:mock');
    console.log('  npm run api:real');
    console.log('  npm run api:status');
    break;
}
