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
    FROM markers;
"""

POST_PIN = """
    INSERT INTO markers (title, description, layer, lat, lng, 
    updated_at)
    VALUES (%(title)s, %(description)s, %(layer)s, %(lat)s, %(lng)s, 
    %(updated_at)s);
"""
