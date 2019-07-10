#!/bin/bash

# Set environment variables
export DATABASE_URL=postgres://postgres:djamilson@postgres:5432/gonodemodule2

export AWS_ACCESS_KEY_ID=AKIAIZC5YPQSSKWNBASA
export AWS_SECRET_ACCESS_KEY=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
export AWS_DEFAULT_REGION=us-east-1

echo $(date +"%Y-%m-%d %T"): START gonodemodule2 database backup

# get a dump of database
echo $(date +"%Y-%m-%d %T"): Dump the database
pg_dump --dbname=$DATABASE_URL | gzip > /var/backups/gonodemodule2-$(date +%Y%m%d).psql.gz

# remove all but 5 latest backups
echo $(date +"%Y-%m-%d %T"): Remove old backups
ls -1trd /var/backups/* | head -n -5 | xargs rm -f

# synchronize folder to s3 backup bucket
echo $(date +"%Y-%m-%d %T"): Push new backup to Amazon S3
aws s3 sync /var/backups https://s3.console.aws.amazon.com/s3/buckets/backup-postgre-nodejs/backup/?region=us-east-1&tab=overview

echo $(date +"%Y-%m-%d %T"): END gonodemodule2 database backup
