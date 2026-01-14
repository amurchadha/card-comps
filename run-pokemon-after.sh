#!/bin/bash
# Wait for massive script to finish, then run Pokemon
while pgrep -f "populate-massive.sh" > /dev/null; do
  sleep 60
done
echo "Massive done, starting Pokemon 151..."
cd /home/aaron/projects/card-comps
./populate-pokemon-151.sh
