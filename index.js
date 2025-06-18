import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import sgMail from '@sendgrid/mail';

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Create app
const app = express();

// Set port
app.set('port', process.env.PORT || 5000);

// Serve static files
app.use(express.static('public'));

// Additional route for GitHub Pages compatibility
app.use('/public', express.static('public'));

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Main route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Email endpoint
app.post('/email', async (req, res) => {
    try {
        console.log('Email request received:', req.body);
        const { email, message } = req.body;
        if (!email || !message) {
            return res.status(400).json({ error: 'Email and message are required' });
        }
        const msg = {
            to: 'danilo_aleixo@hotmail.com',
            from: email,
            subject: 'Danilo Aleixo | Personal Website',
            text: message
        };
        await sgMail.send(msg);
        console.log('Email sent successfully');
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Start server
app.listen(app.get('port'), () => {
    console.log('🚀 Server is running on port', app.get('port'));
    console.log('📧 Email functionality:', process.env.SENDGRID_API_KEY ? 'Enabled' : 'Disabled (SENDGRID_API_KEY not set)');
});