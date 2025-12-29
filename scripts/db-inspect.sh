#!/bin/bash
# Current Database Schema Inspector
# Shows current tables and their structure

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
else
    echo "Error: .env.local not found"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "Error: NEXT_PUBLIC_SUPABASE_URL not set"
    exit 1
fi

# Extract project ref from URL
PROJECT_REF=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed -E 's/https:\/\/([^.]+).*/\1/')

echo -e "${BLUE}=== Supabase Database Schema ===${NC}"
echo "Project: $PROJECT_REF"
echo ""

# Check if we have direct database URL
if [ -n "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Listing all tables in public schema:${NC}"
    psql "$DATABASE_URL" -c "\dt public.*"
    
    echo ""
    echo -e "${YELLOW}Checking for curated_videos table:${NC}"
    psql "$DATABASE_URL" -c "\d public.curated_videos" 2>/dev/null || echo "  Table does not exist"
    
    echo ""
    echo -e "${YELLOW}Checking for learning_sessions table:${NC}"
    psql "$DATABASE_URL" -c "\d public.learning_sessions" 2>/dev/null || echo "  Table does not exist"
else
    echo -e "${YELLOW}DATABASE_URL not available.${NC}"
    echo "Please check your Supabase project manually:"
    echo "  https://supabase.com/dashboard/project/$PROJECT_REF/editor"
fi
