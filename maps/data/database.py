"""
Connection details for the database.
"""
import os

import psycopg2

conn = psycopg2.connect(
    host="127.0.0.1",
    port=5432,
    database="maps",
    user=os.environ.get('DB_USERNAME'))
conn.autocommit = True
