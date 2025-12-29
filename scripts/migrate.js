const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function migrate() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ Error: DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Supabase requires SSL, usually self-signed is ok for tools
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // 1. Pre-flight check: Check if table already exists
        const checkRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'learning_sessions'
      );
    `);

        if (checkRes.rows[0].exists) {
            console.warn('⚠️  Table "learning_sessions" already exists.');
            console.log('   The migration uses "IF NOT EXISTS", so it should be safe.');
            console.log('   Proceeding to ensure columns and policies...');
        } else {
            console.log('✅ Table "learning_sessions" does not exist. Creating...');
        }

        // 2. Read migration file
        const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20251229_add_learning_sessions_table.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // 3. Run in transaction
        await client.query('BEGIN');

        try {
            await client.query(sql);
            await client.query('COMMIT');
            console.log('🎉 Migration applied successfully!');

            // 4. Verify
            const verifyRes = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'learning_sessions';
      `);
            console.log('\n📊 Table Structure (learning_sessions):');
            verifyRes.rows.forEach(row => {
                console.log(`   - ${row.column_name} (${row.data_type})`);
            });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
