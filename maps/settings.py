"""
Application-wide settings that do not inherit from anywhere else
 in this project
"""
import pytz

APP_TZ = pytz.UTC
TIMESTAMP_FMT = '%Y-%m-%d %H:%M:%S %z (%Z)'
