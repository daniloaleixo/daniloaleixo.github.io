# Danilo Aleixo - Personal Portfolio

A modern, responsive personal portfolio website built with Node.js, Express, and modern web technologies.

## 🚀 Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern Tech Stack**: Built with Node.js 18+, Express 4, and modern build tools
- **Email Integration**: Contact form with SendGrid email service
- **Performance Optimized**: Minified CSS/JS, optimized assets
- **SEO Friendly**: Proper meta tags and structured data

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/daniloaleixo/daniloaleixo.github.io.git
   cd daniloaleixo.github.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional, for email functionality)
   ```bash
   export SENDGRID_API_KEY=your_sendgrid_api_key_here
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with nodemon for automatic reloading on file changes.

### Production Mode
```bash
npm start
```

### Build Assets
```bash
npm run build
```
This compiles and minifies CSS and JavaScript files.

### Watch Mode (for development)
```bash
npm run watch
```
This watches for changes in SCSS and JS files and automatically rebuilds them.

## 🧪 Testing

Run the test suite to verify everything is working:
```bash
npm test
```

## 📁 Project Structure

```
daniloaleixo.github.io/
├── public/                 # Static assets
│   ├── assets/            # Images, icons, PDFs
│   ├── css/               # Compiled CSS
│   ├── js/                # JavaScript files
│   └── libs/              # Third-party libraries
├── scss/                  # SCSS source files
├── index.html             # Main HTML file
├── index.js               # Express server
├── gulpfile.js            # Build configuration
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### Port Configuration
The server runs on port 5000 by default. You can change this by setting the `PORT` environment variable:
```bash
export PORT=3000
npm start
```

### Email Configuration
To enable the contact form email functionality, set your SendGrid API key:
```bash
export SENDGRID_API_KEY=your_api_key_here
```

## 🚀 Deployment

### Heroku
This project is configured for Heroku deployment. Simply push to your Heroku repository:
```bash
git push heroku main
```

### Other Platforms
The project can be deployed to any Node.js hosting platform (Vercel, Netlify, Railway, etc.).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Danilo Aleixo**
- GitHub: [@daniloaleixo](https://github.com/daniloaleixo)
- LinkedIn: [danilo-aleixo](https://www.linkedin.com/in/danilo-aleixo/)
- Medium: [@daniloaleixo94](https://medium.com/@daniloaleixo94)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.




