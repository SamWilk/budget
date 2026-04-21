#!/bin/bash

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-budget}"
DB_NAME="${DB_NAME:-budget}"
PGPASSWORD="${PGPASSWORD:-budget}"

SQL_DIR="$(dirname "$0")/sql"

# Build array of .sql files in the sql folder
sql_files=()
for f in "$SQL_DIR"/*.sql; do
  [ -f "$f" ] && sql_files+=("$f")
done

if [ ${#sql_files[@]} -eq 0 ]; then
  echo "No SQL files found in $SQL_DIR"
  exit 1
fi

# Execute each file one at a time
for sql_file in "${sql_files[@]}"; do
  echo "Executing: $(basename "$sql_file")"
  PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$sql_file"
  if [ $? -ne 0 ]; then
    echo "Error executing $sql_file — aborting."
    exit 1
  fi
  echo "Done: $(basename "$sql_file")"
done

echo "All SQL files executed successfully."
