#!/bin/bash
# Safe Database Migration Script
# Automatically backs up before applying migration

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MIGRATION_FILE="${1}"
SKIP_BACKUP="${2}"

if [ -z "$MIGRATION_FILE" ]; then
    echo -e "${RED}Usage: ./scripts/db-migrate.sh <migration_file.sql> [--skip-backup]${NC}"
    exit 1
fi

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

# Load environment
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
else
    echo -e "${RED}Error: .env.local not found${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not set${NC}"
    exit 1
fi

echo -e "${BLUE}=== Safe Database Migration ===${NC}"
echo "Migration: $(basename $MIGRATION_FILE)"
echo ""

# Step 1: Create backup (unless skipped)
if [ "$SKIP_BACKUP" != "--skip-backup" ]; then
    echo -e "${YELLOW}Step 1: Creating backup...${NC}"
    BACKUP_NAME="pre_migration_$(date +%Y%m%d_%H%M%S)"
    ./scripts/db-backup.sh "$BACKUP_NAME"
    echo ""
else
    echo -e "${YELLOW}Step 1: Backup skipped${NC}"
    echo ""
fi

# Step 2: Apply migration with transaction
echo -e "${YELLOW}Step 2: Applying migration...${NC}"
echo "File: $MIGRATION_FILE"
echo ""

# Wrap in transaction for safety
TEMP_FILE=$(mktemp)
echo "BEGIN;" > "$TEMP_FILE"
cat "$MIGRATION_FILE" >> "$TEMP_FILE"
echo "COMMIT;" >> "$TEMP_FILE"

if psql "$DATABASE_URL" -f "$TEMP_FILE"; then
    rm "$TEMP_FILE"
    echo ""
    echo -e "${GREEN}✅ Migration applied successfully!${NC}"
    
    # Step 3: Verify
    echo ""
    echo -e "${YELLOW}Step 3: Verifying schema...${NC}"
    
    # Check if learning_sessions table exists
    TABLES=$(psql "$DATABASE_URL" -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" | grep -v '^$')
    
    if echo "$TABLES" | grep -q "learning_sessions"; then
        echo -e "${GREEN}✓ learning_sessions table created${NC}"
        
        # Show table structure
        echo ""
        echo -e "${BLUE}Table structure:${NC}"
        psql "$DATABASE_URL" -c "\d public.learning_sessions"
    fi
    
    echo ""
    echo -e "${GREEN}=== Migration Complete ===${NC}"
else
    rm "$TEMP_FILE"
    echo ""
    echo -e "${RED}❌ Migration failed - database rolled back${NC}"
    echo -e "${YELLOW}You can restore from backup if needed:${NC}"
    echo "  gunzip -c ./backups/db/${BACKUP_NAME}.sql.gz | psql \$DATABASE_URL"
    exit 1
fi
