#!/bin/bash
# Database Backup Script
# Usage: ./scripts/db-backup.sh [backup_name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups/db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${1:-manual_${TIMESTAMP}}"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql"

# Load environment variables
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
else
    echo -e "${RED}Error: .env.local file not found${NC}"
    exit 1
fi

# Validate DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not set in .env.local${NC}"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Starting database backup...${NC}"
echo "Backup file: $BACKUP_FILE"

# Dump the database
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    # Compress the backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    # Get file size
    SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    
    echo -e "${GREEN}✅ Backup successful!${NC}"
    echo "File: $BACKUP_FILE"
    echo "Size: $SIZE"
    
    # Keep only last 10 backups
    echo -e "${YELLOW}Cleaning old backups (keeping last 10)...${NC}"
    ls -t "$BACKUP_DIR"/*.sql.gz | tail -n +11 | xargs -r rm
    
    echo -e "${GREEN}Backup complete!${NC}"
else
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi
