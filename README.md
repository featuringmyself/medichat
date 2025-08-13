# MediChat 🏥💬

A modern healthcare communication platform built with Next.js, designed to facilitate secure messaging between patients and healthcare providers.

## ⚠️ Important Disclaimer

**This application is for educational and demonstration purposes only. It is NOT intended for actual medical use or to replace professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with any questions regarding medical conditions.**

## 🚀 Features

- **Secure Messaging**: End-to-end encrypted communication between patients and healthcare providers
- **Real-time Chat**: Instant messaging with typing indicators and read receipts
- **File Sharing**: Secure upload and sharing of medical documents and images
- **Appointment Scheduling**: Integrated calendar for booking and managing appointments
- **User Authentication**: Multi-factor authentication for enhanced security
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🏗️ Architecture

```
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Main application dashboard
│   ├── chat/              # Chat interface components
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Clerk
- **AI Integration**: Google Gemini API
- **Deployment**: Vercel

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager
- Environment variables configured (see below)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/featuringmyself/medichat.git
   cd medichat
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📝 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key"

# AI System Prompts
SYSTEM_PROMPT="your-system-prompt-for-ai"
CHAT_SYSTEM_PROMPT="your-chat-system-prompt"
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Authentication with [Clerk](https://clerk.com/)

## 📞 Support

For support, please create an issue in the GitHub repository or contact the development team.

**Remember: This is a demonstration project and should not be used for actual medical consultations or healthcare decisions.**
