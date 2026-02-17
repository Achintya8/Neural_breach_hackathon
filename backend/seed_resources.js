const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://127.0.0.1:5000/api';
const EMAIL = 'achintyak48@gmail.com';
const PASSWORD = '1234';

// Demo Data
const resources = [
    {
        title: 'Advanced Data Structures Notes',
        subject: 'Data Structures',
        semester: 3,
        year: '2nd Year',
        branch: 'CSE',
        type: 'Notes',
        description: 'Comprehensive notes on Trees, Graphs, and Heaps.',
        privacy_level: 'PUBLIC',
        filename: 'dsa_notes.pdf',
        contentType: 'application/pdf'
    },
    {
        title: 'Operating System Internals',
        subject: 'Operating Systems',
        semester: 4,
        year: '2nd Year',
        branch: 'CSE',
        type: 'Book',
        description: 'Deep dive into kernel structures and memory management.',
        privacy_level: 'PUBLIC',
        filename: 'os_internals.pdf',
        contentType: 'application/pdf'
    },
    {
        title: 'Digital Logic Design PyQ',
        subject: 'Digital Logic',
        semester: 3,
        year: '2nd Year',
        branch: 'ECE',
        type: 'Question Paper',
        description: 'Previous year questions for DLD 2024.',
        privacy_level: 'PUBLIC',
        filename: 'dld_pyq.pdf',
        contentType: 'application/pdf'
    },
    {
        title: 'Thermodynamics Basics',
        subject: 'Thermodynamics',
        semester: 3,
        year: '2nd Year',
        branch: 'ME',
        type: 'Notes',
        description: 'Introduction to laws of thermodynamics.',
        privacy_level: 'PUBLIC',
        filename: 'thermo.txt',
        contentType: 'text/plain'
    },
    {
        title: 'Machine Learning Lab Manual',
        subject: 'Machine Learning',
        semester: 6,
        year: '3rd Year',
        branch: 'CSE',
        type: 'Lab Manual',
        description: 'Python code snippets for ML algorithms.',
        privacy_level: 'COLLEGE',
        filename: 'ml_lab.pdf',
        contentType: 'application/pdf'
    },
    {
        title: 'Campus Map 2025',
        subject: 'General',
        semester: 1,
        year: '1st Year',
        branch: 'Other',
        type: 'Other',
        description: 'Updated map of the campus.',
        privacy_level: 'PUBLIC',
        filename: 'map.jpg',
        contentType: 'image/jpeg'
    }
];

const createDummyFile = (filename, content) => {
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
};

const loginOrRegister = async () => {
    try {
        console.log(`Attempting login for ${EMAIL}...`);
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        console.log('Login successful.');
        return res.data.token;
    } catch (err) {
        console.error('Login error status:', err.response?.status);
        console.error('Login error data:', err.response?.data);

        // If 400 (Invalid credentials) or 404 (User not found if endpoint returns that), try register
        if (err.response && (err.response.status === 400 || err.response.status === 404)) {
            console.log('Login failed (likely user does not exist). Attempting registration...');
            try {
                const regRes = await axios.post(`${API_URL}/auth/register`, {
                    name: 'Achintya Kumar',
                    email: EMAIL,
                    password: PASSWORD,
                    college: 'IIT Delhi',
                    branch: 'CSE',
                    semester: 6
                });
                console.log('Registration successful. Token received.');
                return regRes.data.token;
            } catch (regErr) {
                console.error('Registration failed:', regErr.response?.data || regErr.message);
                process.exit(1);
            }
        }
        console.error('Login error:', err.response?.data || err.message);
        process.exit(1);
    }
};

const uploadResource = async (token, resource) => {
    const form = new FormData();
    form.append('title', resource.title);
    form.append('subject', resource.subject);
    form.append('semester', resource.semester);
    form.append('year', resource.year);
    form.append('branch', resource.branch);
    form.append('type', resource.type);
    form.append('description', resource.description);
    form.append('privacy_level', resource.privacy_level);

    // Create dummy file content
    const filePath = createDummyFile(resource.filename, `This is dummy content for ${resource.title}`);
    form.append('file', fs.createReadStream(filePath));

    try {
        const res = await axios.post(`${API_URL}/resources`, form, {
            headers: {
                ...form.getHeaders(),
                'x-auth-token': token
            }
        });
        console.log(`Uploaded: ${resource.title}`);

        // Cleanup
        fs.unlinkSync(filePath);
    } catch (err) {
        console.error(`Failed to upload ${resource.title}:`, err.response?.data || err.message);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
};

const main = async () => {
    const token = await loginOrRegister();
    console.log('Starting uploads...');

    for (const resource of resources) {
        await uploadResource(token, resource);
    }

    console.log('Upload phase complete.');

    // Verify count
    try {
        const res = await axios.get(`${API_URL}/resources?limit=100`, { // limit if pagination exists
            headers: { 'x-auth-token': token }
        });
        console.log(`Total resources in system: ${res.data.length || res.data.resources?.length || 0}`);
        res.data.forEach(r => console.log(`- ${r.title}`));
    } catch (err) {
        console.error('Failed to list resources:', err.message);
    }

    console.log('All done!');
};

main();
