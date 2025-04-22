"""
Set up postgres with the necessary tables and fill in initial data.
"""
import datetime

from database import conn
from maps.settings import TIMESTAMP_FMT

# Open a cursor to perform database operations
cur = conn.cursor()


"""
Tier 1 tables are dependencies of Tier 2 tables
"""
USERS_INIT = """
CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    username varchar(21) unique not null,
    encoded bytea not null,
    bio varchar(140),
    created_at timestamp with time zone not null default current_timestamp,
    updated_at timestamp with time zone not null
);
"""


USERS_INIT_INSERT = """
    INSERT INTO users (username, encoded, bio, updated_at)
    VALUES (%(username)s, %(encoded)s, %(bio)s, %(updated_at)s);
"""


# Execute the markers table creation sql
cur.execute(USERS_INIT)


# Insert data into the markers table
USERS_INIT_DATA = {
    'username': 'joe_blogs',
    'encoded': '',
    'bio': 'Wow! I cannot wait to publish a map.',
    'updated_at': datetime.datetime.now().strftime(TIMESTAMP_FMT)
}

cur.execute(
    USERS_INIT_INSERT, USERS_INIT_DATA
)


"""
Tier 2 tables rely directly on Tier 1 tables
"""
MARKERS_INIT = """
CREATE TABLE IF NOT EXISTS markers (
    id serial PRIMARY KEY,
    title varchar(40),
    description varchar(140),
    layer varchar(15),
    lat decimal(18, 15),
    lng decimal(18, 15),
    username varchar(21) references users(username),
    created_at timestamp with time zone not null default current_timestamp,
    updated_at timestamp with time zone not null
);
"""


MARKERS_INIT_INSERT = """
    INSERT INTO markers (title, description, layer, lat, lng, 
    username, updated_at)
    VALUES (%(title)s, %(description)s, %(layer)s, %(lat)s, %(lng)s, 
    %(username)s, %(updated_at)s);
"""


# Execute the markers table creation sql
cur.execute(MARKERS_INIT)


# Insert data into the markers table
MARKERS_INIT_DATA = {
    'title': 'The Fox Theater',
    'description': 'Best venue in **the world**',
    'layer': 'faves',
    'lat': 37.866,
    'lng': -122.26,
    'username': 'joe_blogs',
    'updated_at': datetime.datetime.now().strftime(TIMESTAMP_FMT)
}


cur.execute(
    MARKERS_INIT_INSERT, MARKERS_INIT_DATA
)
