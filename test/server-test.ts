import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const TEST_USERNAME = 'testuser';

async function testAuthentication() {
  try {
    const response = await axios.post(`${BASE_URL}/auth`, {
      username: 'testuser',
      password: 'password123'
    });
    console.log('Authentication Test:', response.data);
  } catch (error) {
    console.error('Authentication Test Failed:', error.response ? error.response.data : error.message);
  }
}

async function testCreateTemplate() {
  try {
    const response = await axios.post(`${BASE_URL}/templates/${TEST_USERNAME}`, {
      name: 'Test Template',
      content: 'This is a test template content',
      category: 'General',
      aiTool: 'claude'
    });
    console.log('Create Template Test:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('Create Template Test Failed:', error.response ? error.response.data : error.message);
  }
}

async function testGetTemplates() {
  try {
    const response = await axios.get(`${BASE_URL}/templates/${TEST_USERNAME}`);
    console.log('Get Templates Test:', response.data);
  } catch (error) {
    console.error('Get Templates Test Failed:', error.response ? error.response.data : error.message);
  }
}

async function runTests() {
  console.log('Starting server tests...');
  await testAuthentication();
  const templateId = await testCreateTemplate();
  await testGetTemplates();
}

runTests().catch(console.error);