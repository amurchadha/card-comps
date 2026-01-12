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

echo "=== Your Card Collection Searches ==="
echo "Started: $(date)"

# Modern Cards - Acuna
search "2022 stadium club chrome acuna trophy"
search "2018 bowman chrome acuna"
search "2022 topps chrome sonic acuna"
search "2017 bowman prospects acuna"
search "2018 topps update acuna"
search "2018 topps acuna bat down"
search "2018 topps heritage acuna"
search "2018 topps now acuna"

# Spencer Strider
search "2022 topps now strider"

# Michael Harris
search "2023 topps chrome harris sepia"
search "2023 bowmans best harris auto"

# Austin Riley
search "2019 topps update riley camo"
search "2022 donruss riley whammy"
search "2019 topps gallery riley auto"

# Garnacho
search "prizm garnacho purple"
search "topps project22 garnacho"
search "topps chrome garnacho auto"
search "topps now garnacho europa"
search "merlin chrome garnacho"
search "topps inception garnacho"
search "select garnacho pink"

# Ohtani
search "2018 topps ohtani pitching"

# Mbappe
search "2017 topps chrome mbappe"

# Burrow
search "2020 donruss optic burrow"

# Zaire-Emery
search "topps finest zaire-emery"
search "topps merlin zaire-emery"

# F1 Russell
search "2020 topps chrome formula russell"

# Puka Nacua
search "2023 prizm puka nacua silver"

# Ekitike
search "topps chrome ekitike auto"

# === VINTAGE CARDS ===

# 1953 Topps
search "1953 topps warren spahn"
search "1953 topps ed mathews"

# Hank Aaron
search "1975 topps hank aaron"
search "1958 topps hank aaron 30"
search "1961 topps hank aaron"
search "1964 topps hank aaron"
search "1967 topps hank aaron"
search "1958 topps hank aaron 488"

# Willie Mays
search "1961 topps willie mays 150"
search "1967 topps willie mays"

# Ed Mathews
search "1958 topps mathews 440"
search "1959 topps mathews"
search "1962 topps mathews"
search "1955 topps mathews"
search "1957 topps mathews"
search "1954 topps mathews"
search "1955 bowman mathews"
search "1960 topps mathews"
search "1965 topps mathews"

# Warren Spahn
search "1958 topps spahn"
search "1955 topps spahn"

# Frank Robinson
search "1964 topps frank robinson"
search "1958 topps frank robinson"
search "1965 topps frank robinson"
search "1966 topps frank robinson"

# Al Kaline
search "1964 topps kaline"
search "1955 topps kaline"
search "1963 topps kaline"
search "1965 topps kaline"

# Carl Yastrzemski
search "1964 topps yastrzemski"

# Ernie Banks
search "1959 topps ernie banks"
search "1960 topps ernie banks"
search "1961 topps ernie banks"
search "1963 topps ernie banks"
search "1957 topps ernie banks"
search "1971 topps ernie banks"
search "1966 topps ernie banks"

# Phil Niekro
search "1968 topps niekro"
search "1966 topps niekro"

# Brooks Robinson
search "1964 topps brooks robinson"
search "1961 topps brooks robinson"
search "1958 topps brooks robinson"
search "1960 topps brooks robinson"
search "1965 topps brooks robinson"

# Multi-player cards
search "1958 topps sluggers supreme"
search "1959 topps fence busters"
search "1967 topps braves team"
search "1959 topps mays catch"

# Other vintage
search "1976 topps reggie jackson"
search "1953 topps monte irvin"
search "1956 topps monte irvin"
search "1957 topps campanella"
search "1955 bowman pee wee reese"
search "1955 bowman enos slaughter"
search "1963 topps stan musial"

echo ""
echo "=== Done ==="
echo "Finished: $(date)"
