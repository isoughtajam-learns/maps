"""
Connection details for the database.
"""
import os

import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="maps",
    user=os.environ.get('DB_USERNAME'))
conn.autocommit = True
