#!/bin/bash
RELAY_URL="https://relay.steepforce.com/search"
API_KEY="cardcomps_relay_2026"
DELAY=60

search() {
  local query="$1"
  echo "[$(date '+%H:%M:%S')] $query"
  response=$(curl -s -X POST "$RELAY_URL" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d "{\"query\": \"$query\", \"type\": \"sold_items\"}")
  items=$(echo "$response" | grep -o '"itemId"' | wc -l)
  echo "  -> $items items"
  sleep $DELAY
}

echo "=== Specific Card Searches ==="

# Ronald Acuna cards
search "2022 stadium club chrome acuna trophy hunters green"
search "2018 bowman chrome ronald acuna"
search "2022 topps chrome sonic acuna purple yellow"
search "2017 bowman prospects acuna chrome"
search "2018 topps update acuna blue jersey"
search "2018 topps acuna bat down"
search "2018 topps heritage acuna variations"
search "2018 topps now acuna moment week gold"

# Spencer Strider
search "2022 topps now spencer strider opening day"

# Michael Harris II
search "2023 topps chrome michael harris sepia"
search "2023 bowmans best michael harris reel autograph"

# Austin Riley
search "2019 topps update austin riley camo"
search "2022 panini donruss austin riley whammy"
search "2019 topps gallery austin riley autograph"

# Alejandro Garnacho
search "2023 prizm garnacho purple breakaway"
search "2022 topps project22 garnacho stanley chow"
search "2022 topps chrome garnacho auto neon green"
search "2022 topps now garnacho europa league purple"
search "2022 merlin chrome garnacho renaissance"
search "2022 topps inception garnacho emerging stars"
search "2022 select garnacho pink"
search "2022 topps chrome garnacho golazo orange"

# Shohei Ohtani
search "2018 topps shohei ohtani pitching"

# Kylian Mbappe
search "2017 topps chrome mbappe lightning strike"

# Jalen Johnson
search "2021 panini donruss optic jalen johnson red"

# George Russell F1
search "2020 topps chrome formula russell sapphire"

# Joe Burrow
search "2020 panini donruss optic joe burrow variation"

# Warren Zaire-Emery
search "2022 topps finest zaire-emery green speckle"
search "2022 topps finest zaire-emery gold"
search "2022 topps merlin zaire-emery autograph blue"

# Franck Ribery
search "2014 panini prizm world cup ribery"

# Hugo Ekitike
search "2022 topps chrome ekitike seismic refractor"

# Thierry Henry
search "1998 panini world cup henry sticker"

# Bradley Barcola
search "2023 stadium club barcola autograph"

echo ""
echo "=== Done ==="
