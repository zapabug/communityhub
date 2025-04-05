# Project Architecture

## Overview
This is a Nostr-based social graph application that focuses on real-time data only.

## Core Components
- Real-time Nostr event handling
- Social graph management
- User interactions

## Technical Stack
- Frontend: React/Next.js
- Data Layer: Nostr Protocol
- State Management: [Specify your choice]

## Key Design Principles
1. Real-time first - No fallback data
2. Direct Nostr integration
3. Minimal architecture
4. Performance optimized

## Directory Structure
```
/
├── components/     # React components
├── lib/           # Core libraries and utilities
├── pages/         # Next.js pages
└── public/        # Static assets
```

## Data Flow
1. Nostr event subscription
2. Real-time processing
3. UI updates

## Performance Considerations
- Efficient relay connections
- Optimized event processing
- Minimal state updates 