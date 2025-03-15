"""
Set up postgres with the necessary tables and fill in initial data.
"""
import datetime

from database import conn
from settings import TIMESTAMP_FMT

# Open a cursor to perform database operations
cur = conn.cursor()


MARKERS_INIT = """
CREATE TABLE IF NOT EXISTS markers (
    id serial PRIMARY KEY,
    title varchar(40),
    description varchar(140),
    layer varchar(15),
    lat decimal(18, 15),
    lng decimal(18, 15),
    created_at timestamp with time zone not null default current_timestamp,
    updated_at timestamp with time zone not null
);
"""


MARKERS_INIT_INSERT = """
    INSERT INTO markers (title, description, layer, lat, lng, updated_at)
    VALUES (%(title)s, %(description)s, %(layer)s, %(lat)s, %(lng)s, 
    %(updated_at)s);
"""

# Execute the markers table creation sql
cur.execute(MARKERS_INIT)


# Insert data into the markers table
marker_init_data = {
    'title': 'The Fox Theater',
    'description': 'Best venue in **the world**',
    'layer': 'faves',
    'lat': 37.866,
    'lng': -122.26,
    'updated_at': datetime.datetime.now().strftime(TIMESTAMP_FMT)
}

cur.execute(
    MARKERS_INIT_INSERT, marker_init_data
)
