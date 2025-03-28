"""
Serialization and deserialization utils in support of the API
"""
import datetime
from collections import defaultdict

from maps.settings import TIMESTAMP_FMT

MODIFIERS = {
    1184: lambda d: datetime.datetime.strftime(
        d,
        TIMESTAMP_FMT)
}
UPDATED_AT = 'updated_at'


def add_updated_at_timestamp(values_dict: dict) -> dict:
    """
    This util will add the current "updated_at" timestamp to any
     dictionary. It's meant to be used for POST/PUT requests.
    :param values_dict:
    :return:
    """
    values_dict[UPDATED_AT] = datetime.datetime.now().strftime(TIMESTAMP_FMT)
    return values_dict


def serialize_get_pins(results: tuple) -> dict:
    """
    This rearranges the results of selecting markers into a format
     expected by the web client.
    :param results: all markers
    :return: dictionary of marker lists with layers as the keys
    """
    serialized = defaultdict(list)
    for layer, marker_details in results:
        serialized[layer].append(marker_details)
    return serialized


def serialize_post_pin(values: dict) -> dict:

    values = add_updated_at_timestamp(values)
    return values
