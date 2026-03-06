# Lumina Reading - High Concurrency Database Schema (Firebase/Supabase)

## Users Collection
- id: string (PK)
- username: string (indexed)
- email: string
- avatar_url: string
- bio: string
- followers_count: number
- following_count: number
- created_at: timestamp

## Stories Collection
- id: string (PK)
- author_id: string (FK -> Users.id)
- title: string
- summary: string
- cover_url: string
- content_url: string (URL to ePub/JSON in Storage)
- category: string (indexed)
- tags: array<string>
- likes_count: number
- comments_count: number
- created_at: timestamp (indexed)

## Following Collection (Optimized for Fast Lookups)
- id: string (PK)
- follower_id: string (indexed)
- following_id: string (indexed)
- created_at: timestamp

## Comments Collection
- id: string (PK)
- story_id: string (indexed)
- user_id: string (FK -> Users.id)
- content: string (sanitized)
- parent_id: string (for nested replies)
- created_at: timestamp (indexed)

## Likes Collection
- id: string (PK)
- user_id: string (indexed)
- story_id: string (indexed)
- created_at: timestamp

## Edge Functions (Architecture for Scale)
- `onStoryCreated`: Updates author's activity feed and notifies followers.
- `onCommentAdded`: Increments `comments_count` in Stories collection via atomic transaction.
- `onFollowUser`: Increments `followers_count` and `following_count` atomically.
