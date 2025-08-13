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
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time**: WebSocket integration
- **File Storage**: AWS S3 compatible storage
- **Deployment**: Vercel

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager
- PostgreSQL database
- Environment variables configured (see `.env.example`)

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

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📝 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/medichat"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_BUCKET_NAME="your-s3-bucket-name"
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Generate test coverage
npm run test:coverage
```

## 📚 API Documentation

API endpoints are available at `/api/*`. Key endpoints include:

- `POST /api/auth/*` - Authentication endpoints
- `GET/POST /api/messages` - Message operations
- `GET/POST /api/appointments` - Appointment management
- `POST /api/upload` - File upload endpoint

## 🚀 Deployment

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com/):

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on every push to main branch

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
- Database management with [Prisma](https://prisma.io/)

## 📞 Support

For support, please create an issue in the GitHub repository or contact the development team.

---

**Remember: This is a demonstration project and should not be used for actual medical consultations or healthcare decisions.**
