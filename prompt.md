Prompt:
Je souhaite créer une application qui permet à des utilisateurs de se connecter (après création d’un compte) et de pouvoir spécifier leur adresse postale de travail dans une page Profil. Cela permettra d’accéder en accueil à des icon (avatar tête, personnalisables dans le profil de chaque utilisateur) affichés sur une carte OSM (openstreetmap https://www.openstreetmap.org/). Je veux que ce projet soit techniquement réalisé en Next.js avec Prisma (https://www.prisma.io/ https://www.prisma.io/docs/orm/overview/databases/sqlite) et une base locale SQLITE. Pour l’authentification etc. J’aimerai que tu utilises BetterAuth (https://www.better-auth.com/). L’accès aux menus profil/accueil(carte), j’aimerai que ce soit sur la gauche (un drawer).

rm -f prisma/dev.db && npx prisma db push
rm -f ./dev.db && npx prisma db push
rm -rf .next && npx prisma generate
