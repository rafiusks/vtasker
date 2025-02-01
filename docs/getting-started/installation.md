# Installation Guide

## Prerequisites

Before installing vTask, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

## Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vtask.git
cd vtask
```

2. Install dependencies:
```bash
npm install
```

3. Create configuration:
```bash
# Copy example configuration
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application should now be running at `http://localhost:3000`.

## Configuration Options

Edit your `.env` file to configure:
- `PORT`: Server port (default: 3000)
- `STORAGE_PATH`: Path for task storage
- `AI_API_KEY`: (Optional) API key for AI features

## Directory Structure

```
vtask/
├── .vtask/          # Task storage
├── docs/            # Documentation
├── src/             # Source code
│   ├── components/  # React components
│   ├── routes/      # Application routes
│   └── utils/       # Utility functions
└── public/          # Static assets
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   kill -9 $(lsof -t -i:3000)
   npm run dev
   ```

2. **Missing dependencies**
   ```bash
   rm -rf node_modules
   npm install
   ```

### Getting Help

- Check our [GitHub Issues](https://github.com/yourusername/vtask/issues)
- Join our [Discord community](https://discord.gg/vtask)
- Read the [FAQ](./faq.md) 