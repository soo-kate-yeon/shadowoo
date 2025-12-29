# Database Migration Safety Scripts

이 디렉토리에는 안전한 데이터베이스 마이그레이션을 위한 스크립트들이 포함되어 있습니다.

## Scripts

### 1. `db-inspect.sh` - 현재 스키마 확인
현재 Supabase 데이터베이스의 테이블 구조를 확인합니다.

```bash
./scripts/db-inspect.sh
```

### 2. `db-schema-check.sh` - 마이그레이션 사전 검증
마이그레이션 파일을 적용하기 전에 충돌 가능성을 검증합니다.

```bash
./scripts/db-schema-check.sh <migration_file.sql>

# Example:
./scripts/db-schema-check.sh supabase/migrations/20251229_add_learning_sessions_table.sql
```

출력:
- ✓ 새로운 테이블/컬럼 (안전)
- ⚠ 이미 존재하는 테이블/컬럼 (주의 필요)

### 3. `db-backup.sh` - 데이터베이스 백업
프로덕션 데이터베이스 전체를 백업합니다.

```bash
./scripts/db-backup.sh [backup_name]

# Example:
./scripts/db-backup.sh pre_migration_20251229
```

백업 파일 위치: `./backups/db/*.sql.gz`
자동 로테이션: 최근 10개 백업 유지

### 4. `db-migrate.sh` - 안전한 마이그레이션
자동 백업 + 트랜잭션 마이그레이션을 실행합니다.

```bash
./scripts/db-migrate.sh <migration_file.sql>

# Example:
./scripts/db-migrate.sh supabase/migrations/20251229_add_learning_sessions_table.sql
```

특징:
- ✅ 마이그레이션 전 자동 백업
- ✅ 트랜잭션으로 실행 (실패 시 롤백)
- ✅ 성공 시 스키마 검증

## 권장 워크플로우

```bash
# Step 1: 현재 스키마 확인
./scripts/db-inspect.sh

# Step 2: 마이그레이션 파일 검증
./scripts/db-schema-check.sh supabase/migrations/20251229_add_learning_sessions_table.sql

# Step 3: 마이그레이션 적용 (자동 백업 포함)
./scripts/db-migrate.sh supabase/migrations/20251229_add_learning_sessions_table.sql
```

## 롤백 방법

마이그레이션이 잘못된 경우 백업에서 복원:

```bash
# 백업 목록 확인
ls -lh ./backups/db/

# 특정 백업으로 복원 (주의: 모든 데이터가 백업 시점으로 돌아갑니다)
gunzip -c ./backups/db/pre_migration_YYYYMMDD_HHMMSS.sql.gz | psql $DATABASE_URL
```

## 환경 변수 요구사항

`.env.local` 파일에 다음 변수가 필요합니다:

```bash
DATABASE_URL=postgresql://...  # Supabase 직접 연결 URL
# 또는
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

직접 연결 URL이 없는 경우, Supabase 대시보드에서 확인하세요:
`Project Settings > Database > Connection string > URI`
