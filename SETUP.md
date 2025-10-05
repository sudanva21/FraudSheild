# FraudShield Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier available)

## 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd fraudsheild

# Install dependencies
npm install
# or
yarn install
```

## 2. Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/login to your account
3. Create a new project
4. Note down your project URL and anon public key

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local` (if not already done)
2. Update the following variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Flask Backend (for local development)
FLASK_API_URL=http://localhost:5000

# Environment
NODE_ENV=development
```

### Step 3: Set Up Database Tables

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of `supabase-setup.sql` from this repository
4. Paste and execute the SQL script

This will create all necessary tables:
- `user_profiles` - Extended user information
- `fraud_models` - AI/ML fraud detection models
- `fraud_alerts` - Generated fraud alerts
- `transaction_analysis` - Transaction data and analysis
- `api_usage` - API usage tracking
- `subscription_plans` - Available subscription tiers
- `user_subscriptions` - User subscription management

### Step 4: Configure Authentication

The authentication is already configured to use Supabase Auth. The following features are enabled:

- Email/Password authentication
- Email confirmation
- Password recovery
- Row Level Security (RLS) policies
- Automatic user profile creation on signup

## 3. Run the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 4. Application Features

### Authentication System
- ✅ Real Supabase authentication (no demo/mock auth)
- ✅ User registration with email verification
- ✅ Login/logout functionality
- ✅ Password recovery
- ✅ Protected routes and dashboard access

### Database Integration
- ✅ TypeScript types for all database tables
- ✅ Row Level Security (RLS) policies
- ✅ Automatic user profile creation
- ✅ API usage tracking
- ✅ Subscription management

### Frontend Features
- ✅ Modern Next.js 14 with App Router
- ✅ Responsive design with Tailwind CSS
- ✅ 3D floating elements (optional)
- ✅ Real-time authentication state management
- ✅ Toast notifications for user feedback

## 5. Project Structure

```
fraudsheild/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── dashboard/         # Protected dashboard
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   ├── 3d/               # 3D components (Three.js)
│   │   └── providers.tsx     # Authentication provider
│   ├── lib/                   # Utility libraries
│   │   └── supabase.ts       # Supabase client and auth functions
│   └── types/                 # TypeScript type definitions
│       └── database.ts       # Generated database types
├── supabase-setup.sql         # Database setup script
├── .env.local                 # Environment variables
└── package.json               # Dependencies and scripts
```

## 6. Troubleshooting

### Common Issues

1. **"next is not recognized" error**
   - Run: `npm install next@14.0.4 --force`
   - Or use: `npx next@14.0.4 dev`

2. **Port 3000 already in use**
   - The app will automatically use port 3001 or another available port
   - Check the terminal output for the correct URL

3. **Supabase connection issues**
   - Verify your `.env.local` file has the correct URL and keys
   - Check that your Supabase project is active
   - Ensure the database tables are created using the SQL script

4. **3D component compilation errors**
   - Three.js dependencies are temporarily commented out if causing issues
   - Uncomment imports in components if needed after resolving dependencies

### Development Commands

```bash
# Install specific Next.js version (if needed)
npm install next@14.0.4 --force

# Clear npm cache
npm cache clean --force

# Restart development server
npm run dev

# Check for TypeScript errors
npm run type-check

# Run linting
npm run lint
```

## 7. Deployment to GitHub

1. Ensure all files are committed:
```bash
git add .
git commit -m "Complete FraudShield setup with Supabase integration"
```

2. Push to GitHub:
```bash
git push origin main
```

3. For deployment to Vercel/Netlify:
   - Add environment variables in your hosting platform
   - The build process should work automatically with the current configuration

## 8. Next Steps

- Execute the `supabase-setup.sql` script in your Supabase dashboard
- Test the authentication flow (register/login)
- Verify database integration
- Deploy to your preferred hosting platform

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure Supabase project is properly configured
4. Review the troubleshooting section above

The application is now ready for production use with real Supabase authentication and database integration!