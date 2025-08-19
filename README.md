# Ishema Ryanjye 🎮💚

**A Modern Educational Card Game Promoting Reproductive Health and Gender Equality**

Ishema Ryanjye is more than just a card game — it's an engaging digital platform for learning about sexual and reproductive health, preventing STIs and unplanned pregnancies, and standing up against gender-based violence. Designed for teens and youth (ages 10-24), it makes learning fun, safe, and social.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## 🌟 About the Project

Developed by the **Health Promotion Organization** in partnership with **Rwanda Biomedical Centre (RBC)** and the **World Health Organization (WHO)**, Ishema Ryanjye transforms traditional card games into a powerful educational tool that addresses critical health topics while maintaining the fun and engaging nature of gaming.

## ✨ Key Features

### 🎯 Game Modes
- **Single Player vs AI**: Challenge intelligent AI opponents with multiple difficulty levels (Easy, Medium, Hard, Very Hard, Adaptive)
- **Multiplayer Support**: Play with 2, 4, or 6 players in real-time
- **Character Selection**: Choose between Shema (male character promoting healthy relationships) and Teta (female character advocating for reproductive health and equality)

### 🤖 Advanced AI System
- **Multiple AI Personalities**: Cautious, Aggressive, Analytical, Greedy, TrapSetter, Unpredictable
- **Adaptive Difficulty**: AI that learns and adapts to player behavior
- **Strategic Gameplay**: Advanced card evaluation, memory system, and pattern recognition
- **Dynamic Learning**: AI evolves its strategy based on game outcomes

### 🌍 Multilingual Support
- **English**: Full interface and content
- **French**: Complete localization
- **Kinyarwanda**: Native language support
- **Real-time Language Switching**: Change languages without refreshing

### 📚 Educational Content
- **Interactive Questions**: Educational quizzes based on card selections
- **Health Information**: Comprehensive reproductive health content
- **"Did You Know?" Tips**: Fun facts and important health information
- **PDF Resources**: Downloadable educational materials

### 🎨 Rich User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Progressive Web App (PWA)**: Install and play offline
- **Smooth Animations**: Framer Motion powered transitions
- **Card Viewer**: Interactive card gallery with educational meanings
- **Theme Customization**: Beautiful green-themed design

### 👤 User Management
- **NextAuth.js Integration**: Secure authentication system
- **User Profiles**: Track personal progress and statistics
- **Dashboard Analytics**: Detailed game statistics and performance tracking
- **Session Management**: Secure user sessions and data protection

### 💬 Intelligent Support System
- **Floating Chat Bot**: Always-accessible AI assistant positioned as a floating widget
- **RAG-Powered Responses**: Retrieval-Augmented Generation using Pinecone vector database for contextual answers
- **Django Backend**: Robust backend service for chat processing and knowledge management
- **Smart Knowledge Base**: Vector embeddings of health content for accurate, relevant responses
- **Contextual Understanding**: Bot understands game context and provides relevant health education
- **Feedback System**: User feedback collection and management
- **Real-time Assistance**: Instant help while playing without interrupting gameplay
- **Configurable Bot**: Dynamic bot configuration, personality settings, and response customization
- **Conversation Memory**: Maintains context across chat sessions for personalized interactions

### 🎮 Advanced Gameplay Features
- **Real-time Multiplayer**: WebSocket-powered live gameplay
- **Game State Persistence**: Resume games across sessions
- **Round-by-Round Analytics**: Detailed game analysis
- **Tournament System**: Competitive gameplay modes
- **Card Holder System**: Strategic card management

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0 with shadcn/ui components
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks and Context API

### Backend & Database
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **API Routes**: Next.js API routes
- **Chat Backend**: Django-powered chat bot with RAG capabilities
- **Vector Database**: Pinecone for semantic search and knowledge retrieval
- **AI Integration**: Advanced natural language processing for contextual responses

### Additional Libraries
- **UI Components**: Radix UI primitives
- **Notifications**: Sonner
- **Progressive Web App**: next-pwa
- **Password Hashing**: bcryptjs
- **Vector Search**: Pinecone integration for RAG-powered chat
- **Development**: TypeScript, ESLint

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, pnpm, or bun
- MongoDB database
- Environment variables (see below)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Genocadio/ishemaryanjye.git
   cd ishemaryanjye
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📱 PWA Features

Ishema Ryanjye is a Progressive Web App that can be installed on mobile devices and desktop computers:

- **Offline Capability**: Core functionality works without internet
- **Native App Experience**: Full-screen mode and app-like navigation
- **Push Notifications**: Stay engaged with game updates
- **Cross-Platform**: Works on iOS, Android, Windows, macOS, and Linux

## 🎯 Game Rules & Mechanics

### Basic Gameplay
- Players receive 3 cards initially from a deck of 36 cards (4 suits: Hearts, Diamonds, Clubs, Spades)
- Cards have values: A (11 points), K (4), Q (2), J (3), 7 (10), and 3-6 (0 points)
- Each game has a trump suit that beats other suits
- Players take turns playing cards, winner takes the round
- Game continues for multiple rounds with strategic card management

### Educational Integration
- After rounds, players answer questions related to their cards
- Questions cover reproductive health, gender equality, and safety
- Correct answers provide bonus points and educational content
- "Did You Know?" facts provide additional learning opportunities
- **Smart Chat Assistant**: RAG-powered chatbot provides instant answers about health topics using vectorized knowledge base

## 🏗️ Project Structure

```
ishemaryanjye/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── game/              # Single player game
│   ├── multiplayer/       # Multiplayer game
│   └── ...
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Game-specific components
│   └── ...
├── contexts/             # React contexts
├── lib/                  # Utility libraries
│   ├── auth.ts          # Authentication configuration
│   ├── mongodb.ts       # Database connection
│   ├── gamer/           # AI game logic
│   ├── evaluator/       # Game evaluation logic
│   └── ...
├── public/              # Static assets
│   ├── cards/           # Card images
│   ├── icons/           # App icons
│   └── ...
└── types/               # TypeScript type definitions
```

## 🤝 Contributing

We welcome contributions to make Ishema Ryanjye even better! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Ensure responsive design
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Health Promotion Organization**: Project development and health expertise
- **Rwanda Biomedical Centre (RBC)**: Health guidelines and content validation  
- **World Health Organization (WHO)**: International health standards and best practices
- **Next.js Team**: Amazing framework and developer experience
- **Vercel**: Hosting and deployment platform
- **Open Source Community**: For the incredible tools and libraries

## 📞 Support & Contact

- **Floating Chat Assistant**: Use the always-visible chat bot powered by RAG and Pinecone for instant, contextual health education answers
- **Intelligent Support**: AI assistant understands your questions and provides relevant information from our comprehensive health knowledge base
- **Issues**: Report bugs and feature requests on GitHub Issues
- **Email**: Contact the Health Promotion Organization for partnership inquiries

## 🔮 Future Roadmap

- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Advanced Analytics**: Machine learning-powered game insights
- [ ] **Social Features**: Friend systems and leaderboards
- [ ] **Content Expansion**: More educational modules and topics
- [ ] **Accessibility**: Enhanced screen reader and keyboard navigation support
- [ ] **Localization**: Additional language support for regional expansion

---

**Made with ❤️ by the Health Promotion Organization**

*Empowering youth through education, one game at a time.*
