# Mad FUN - Discover Madeira through Nostr

A decentralized social exploration app for Madeira Island enthusiasts, built on the Nostr protocol.

## Features

- **Social Graph** - Visualize connections between Madeira enthusiasts
- **Madeira Feed** - See beautiful images of Madeira shared on Nostr
- **Community Feed** - Read posts from trusted Nostr users about Madeira
- **nostr-login Integration** - Sign in with NIP-07 extensions or any compatible signer

## Tech Stack

- **Next.js** - React framework for production
- **React** - UI Library
- **NDK (Nostr Dev Kit)** - SDK for interacting with the Nostr protocol
- **Tailwind CSS** - Utility-first CSS framework
- **nostr-login** - Elegant login experience for Nostr

## Getting Started

### Prerequisites

- Node.js 18+ or Bun

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/madfun.git
   cd madfun
   ```

2. Install dependencies:
   ```
   npm install
   # or
   bun install
   ```

3. Start the development server:
   ```
   npm run dev
   # or
   bun run dev
   ```

## App Structure

```
madfun/
├── pages/           # Next.js pages
│   ├── index.tsx    # Main page
│   ├── _app.tsx     # App container
├── src/             # Source code
│   ├── App.tsx      # Main application component
│   ├── components/  # React components
│   │   ├── Feed/              # Feed components
│   │   │   └── CommunityFeed.tsx  # Displays community posts
│   │   ├── ImageFeed/         # Image feed components
│   │   │   ├── ImageCard.tsx      # Image card component
│   │   │   └── MadeiraImageFeed.tsx # Displays Madeira images
│   │   └── SocialGraph/       # Social graph components
│   │       └── SocialGraph.tsx    # Displays the social network
│   ├── context/    # React context
│   │   └── NostrContext.tsx   # Provides Nostr functionality
│   ├── types/      # TypeScript types
│   │   ├── global.d.ts    # Global type definitions
│   │   └── index.ts       # Type exports
│   └── utils/      # Utility functions
├── styles/         # CSS styles
│   └── globals.css # Global styles
```

## Deployment

Build for production:

```
npm run build
# or
bun run build
```

## Madeira Hashtags

The app focuses on these Madeira-related hashtags:
- #madeira
- #travelmadeira
- #visitmadeira
- #funchal
- #fanal
- #espetada
- #freemadeira
- #madstr

## License

MIT 