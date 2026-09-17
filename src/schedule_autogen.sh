#!/bin/bash

crontab -l | { cat; echo "0 4 * * * /Users/beedurrah/Developer/bee-mission-control-cockpit/venv/bin/python /Users/beedurrah/Developer/bee-mission-control-cockpit/src/autogen_materials.py"; } | crontab -
