#!/bin/bash

set -e

function prepare_database {
  npx prisma migrate deploy
}

if [ "$1" = 'osb-remix' ]; then
  prepare_database

  npm run start
fi