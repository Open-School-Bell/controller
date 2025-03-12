#!/bin/bash

set -e

function prepare_database {
  npx prisma migrate deploy
  npx prisma generate
  npx prisma db seed
}

if [ "$1" = 'osb-remix' ]; then
  prepare_database

  npm run start
fi