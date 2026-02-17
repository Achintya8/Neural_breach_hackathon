const axios = require('axios');

async function testRegistration() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            college: 'MIT',
            branch: 'Computer Science',
            semester: 3
        });

        console.log('✓ Registration successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('✗ Registration failed');
        console.log('Error:', error.response?.data || error.message);
    }
}

testRegistration();
