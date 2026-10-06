# PostgreSQL Configuration Instructions

To switch this application to PostgreSQL:

1. Edit `server/prisma/schema.prisma`:
   Change `provider = "sqlite"` to `provider = "postgresql"`.

2. Update `server/.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskmanager?schema=public"
   ```

3. Run Prisma migration:
   ```bash
   cd server
   npx prisma db push
   npx prisma db seed
   ```
