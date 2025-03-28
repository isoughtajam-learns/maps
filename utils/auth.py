import os

import jwt

from maps.constants import USERNAME

ANONYMOUS_USER = 'anonymous_user'
SECRET = os.getenv('JWT_SECRET')

def create_token_for_user(username=None):
    """
    Given a username, generate a JWT token for the user
    :return:
    """
    if not username:
        username = ANONYMOUS_USER
    return jwt.encode({"username": username}, SECRET, algorithm='HS256')

def parse_token_from_auth_header(header) -> str:
    """
    Extract token string from Authorization header
    :param header: Authorization header taken directly from API request
    :return:
    """
    try:
        token = header.split(' ')[1]
    except Exception as e:
        print('Could not parse Authorization header: {}'.format(header))
        return None
    return token

def decode_payload_from_auth_header(header) -> dict:
    """
    Extract payload from Authorization header
    :param header: Authorization header taken directly from API request
    :return:
    """
    return jwt.decode(
        parse_token_from_auth_header(header),
        SECRET,
        algorithms=['HS256']
    )

def filter_payload_from_auth_header(header: str, keys: iter) -> dict:
    """
    Extract a subset of auth token payload
    :param header: Authorization header taken directly from API request
    :param keys: iterable of payload keys to filter down to
    :return:
    """
    payload = decode_payload_from_auth_header(header)
    return dict([(k, v) for k, v in payload.items() if k in keys])


def append_user_to_dict_from_auth_header(header: str, some_dict: dict) -> dict:
    """

    :param header:
    :param some_dict:
    :return:
    """
    some_dict.update(filter_payload_from_auth_header(header, USERNAME))
    return some_dict