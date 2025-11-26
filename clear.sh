rm -f prisma/dev.db && npx prisma db push
rm -f ./dev.db && npx prisma db push
rm -rf .next && npx prisma generate
