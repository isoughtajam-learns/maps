"""
All db access for particular API endpoints is represented here. There
 should be no other sql statements outside of this module except for
 database initialization and seeding.
"""
GET_PINS = """
    SELECT
        layer,
        json_build_object(
            'title', title,
            'description', description,
            'lat', lat,
            'lng', lng,
            'created_at', created_at,
            'updated_at', updated_at
        )
    FROM markers
    WHERE
        username = %(username)s;
"""

POST_PIN = """
    INSERT INTO markers (title, description, layer, lat, lng, username, 
    updated_at)
    VALUES (%(title)s, %(description)s, %(layer)s, %(lat)s, %(lng)s, 
    %(username)s, %(updated_at)s);
"""

GET_PASS = """
    SELECT
        encoded
    FROM
        users
    WHERE
        username = %(username)s;
"""

CREATE_USER = """
    INSERT INTO users (username, encoded, updated_at)
    VALUES (%(username)s, %(encoded)s, %(updated_at)s);
"""