#!/bin/sh
# wait-for-postgres.sh
# Using Docker Compose Entrypoint To Check if Postgres is Running
# https://bit.ly/2KCdFxh
# Author: Kelly Andrews
set -e
cmd="$@"
# pg_isready is a postgreSQL client tool for checking the connection
# status of PostgreSQL server
while ! pg_isready -h postgres -p 5432 -U postgres > /dev/null 2> /dev/null; do
   echo "Connecting to postgres Failed"
   sleep 1
done
>&2 echo "Postgres is up - executing command"
exec $cmd
