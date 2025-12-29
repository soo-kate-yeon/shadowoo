#!/bin/bash
# Database Schema Validation Script
# Compares current DB schema with migration file before applying

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MIGRATION_FILE="${1}"
SCHEMA_DUMP="./backups/schema_current.sql"

if [ -z "$MIGRATION_FILE" ]; then
    echo -e "${RED}Usage: ./scripts/db-schema-check.sh <migration_file.sql>${NC}"
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

echo -e "${BLUE}=== Database Schema Validation ===${NC}\n"

# 1. Dump current schema
echo -e "${YELLOW}1. Dumping current schema...${NC}"
mkdir -p ./backups
pg_dump "$DATABASE_URL" --schema-only > "$SCHEMA_DUMP"
echo -e "${GREEN}✓ Schema dumped${NC}\n"

# 2. Check for table existence conflicts
echo -e "${YELLOW}2. Checking for table conflicts...${NC}"
TABLES_IN_MIGRATION=$(grep -i "create table" "$MIGRATION_FILE" | sed -E 's/.*create table (if not exists )?([a-z_\.]+).*/\2/i' || true)

if [ -n "$TABLES_IN_MIGRATION" ]; then
    while IFS= read -r table; do
        if grep -qi "create table.*${table}" "$SCHEMA_DUMP"; then
            echo -e "${YELLOW}  ⚠ Table '${table}' already exists${NC}"
            echo -e "    ${BLUE}Suggestion: Use 'CREATE TABLE IF NOT EXISTS' or 'ALTER TABLE'${NC}"
        else
            echo -e "${GREEN}  ✓ Table '${table}' is new${NC}"
        fi
    done <<< "$TABLES_IN_MIGRATION"
else
    echo -e "${GREEN}  ✓ No table creation conflicts${NC}"
fi
echo ""

# 3. Check for column conflicts
echo -e "${YELLOW}3. Checking for column additions...${NC}"
ALTER_COLUMNS=$(grep -i "alter table.*add column" "$MIGRATION_FILE" || true)
if [ -n "$ALTER_COLUMNS" ]; then
    echo "$ALTER_COLUMNS" | while IFS= read -r line; do
        TABLE=$(echo "$line" | sed -E 's/.*alter table ([a-z_\.]+).*/\1/i')
        COLUMN=$(echo "$line" | sed -E 's/.*add column ([a-z_]+).*/\1/i')
        
        if grep -qi "\"${COLUMN}\"" "$SCHEMA_DUMP"; then
            echo -e "${YELLOW}  ⚠ Column '${COLUMN}' may already exist${NC}"
        else
            echo -e "${GREEN}  ✓ Column '${COLUMN}' is new in ${TABLE}${NC}"
        fi
    done
else
    echo -e "${GREEN}  ✓ No column additions${NC}"
fi
echo ""

# 4. Summary
echo -e "${BLUE}=== Validation Complete ===${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review the warnings above"
echo "  2. Create backup: ${BLUE}./scripts/db-backup.sh pre_migration_$(date +%Y%m%d)${NC}"
echo "  3. Apply migration: ${BLUE}./scripts/db-migrate.sh $MIGRATION_FILE${NC}"
echo ""
echo -e "${GREEN}Current schema saved to: $SCHEMA_DUMP${NC}"
