const fs = require('fs');
require('dotenv').config({ path: '../.env.local' });

const filePath = '../Files/test.pdf';
const apiEndpoint = process.env.OPENAI_API_ENDPOINT;
const apiKey = process.env.OPENAI_API_KEY;

fs.readFile(filePath, { encoding: 'base64' }, (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    const payload = {
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "file",
                        file: {
                            filename: "test.pdf",
                            file_data: `data:application/pdf;base64,${data}`
                        }
                    },
                    {
                        type: "text",
                        text: "何が書いてありますか？"
                    }
                ]
            }
        ]
    };

    fetch(`${apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response:', data);
        console.log('Message Content:', data.choices[0].message);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
