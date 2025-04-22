"""
All db access for particular API endpoints is represented here. There
 should be no other sql statements outside of this module except for
 database initialization and seeding.
"""
GET_MARKERS = """
    SELECT
        layer,
        json_build_object(
            'id', id,
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

POST_MARKER = """
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

GET_USER = """
    SELECT
        *
    FROM
        users
    WHERE
        username = %(username)s;
"""

PATCH_MARKER = """
    UPDATE markers
    SET title=%(title)s,
        description=%(description)s,
        layer=%(layer)s,
        lat=%(lat)s,
        lng=%(lng)s,
        username=%(username)s,
        updated_at=%(updated_at)s
    WHERE
        id=%(id)s;
"""

DELETE_MARKER = """
    DELETE
    FROM
        markers
    WHERE
        id=%(id)s and username=%(username)s;
"""