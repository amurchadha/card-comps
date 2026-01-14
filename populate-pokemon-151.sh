#!/bin/bash

# Original 151 Pokemon - Base Set Era
# All the OG Pokemon cards

RELAY_URL="https://relay.steepforce.com/search"
API_KEY="cardcomps_relay_2026"
LOG_FILE="/home/aaron/projects/card-comps/populate-pokemon-151.log"
DELAY=60

echo "=== Original 151 Pokemon ===" | tee "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"

search() {
  local query="$1"
  echo "[$(date +%H:%M:%S)] $query" | tee -a "$LOG_FILE"

  response=$(curl -s -X POST "$RELAY_URL" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d "{\"query\": \"$query\", \"type\": \"sold_items\"}")

  items=$(echo "$response" | grep -o '"itemId"' | wc -l)
  echo "  -> $items items" | tee -a "$LOG_FILE"

  sleep $DELAY
}

# Gen 1 - All 151 Pokemon (base set style searches)

# 1-10
search "bulbasaur base set"
search "ivysaur base set"
search "venusaur base set"
search "charmander base set"
search "charmeleon base set"
search "charizard base set"
search "squirtle base set"
search "wartortle base set"
search "blastoise base set"
search "caterpie base set"

# 11-20
search "metapod base set"
search "butterfree base set"
search "weedle base set"
search "kakuna base set"
search "beedrill base set"
search "pidgey base set"
search "pidgeotto base set"
search "pidgeot base set"
search "rattata base set"
search "raticate base set"

# 21-30
search "spearow base set"
search "fearow base set"
search "ekans base set"
search "arbok base set"
search "pikachu base set"
search "raichu base set"
search "sandshrew base set"
search "sandslash base set"
search "nidoran female base set"
search "nidorina base set"

# 31-40
search "nidoqueen base set"
search "nidoran male base set"
search "nidorino base set"
search "nidoking base set"
search "clefairy base set"
search "clefable base set"
search "vulpix base set"
search "ninetales base set"
search "jigglypuff base set"
search "wigglytuff base set"

# 41-50
search "zubat base set"
search "golbat base set"
search "oddish base set"
search "gloom base set"
search "vileplume base set"
search "paras base set"
search "parasect base set"
search "venonat base set"
search "venomoth base set"
search "diglett base set"

# 51-60
search "dugtrio base set"
search "meowth base set"
search "persian base set"
search "psyduck base set"
search "golduck base set"
search "mankey base set"
search "primeape base set"
search "growlithe base set"
search "arcanine base set"
search "poliwag base set"

# 61-70
search "poliwhirl base set"
search "poliwrath base set"
search "abra base set"
search "kadabra base set"
search "alakazam base set"
search "machop base set"
search "machoke base set"
search "machamp base set"
search "bellsprout base set"
search "weepinbell base set"

# 71-80
search "victreebel base set"
search "tentacool base set"
search "tentacruel base set"
search "geodude base set"
search "graveler base set"
search "golem base set"
search "ponyta base set"
search "rapidash base set"
search "slowpoke base set"
search "slowbro base set"

# 81-90
search "magnemite base set"
search "magneton base set"
search "farfetchd base set"
search "doduo base set"
search "dodrio base set"
search "seel base set"
search "dewgong base set"
search "grimer base set"
search "muk base set"
search "shellder base set"

# 91-100
search "cloyster base set"
search "gastly base set"
search "haunter base set"
search "gengar base set"
search "onix base set"
search "drowzee base set"
search "hypno base set"
search "krabby base set"
search "kingler base set"
search "voltorb base set"

# 101-110
search "electrode base set"
search "exeggcute base set"
search "exeggutor base set"
search "cubone base set"
search "marowak base set"
search "hitmonlee base set"
search "hitmonchan base set"
search "lickitung base set"
search "koffing base set"
search "weezing base set"

# 111-120
search "rhyhorn base set"
search "rhydon base set"
search "chansey base set"
search "tangela base set"
search "kangaskhan base set"
search "horsea base set"
search "seadra base set"
search "goldeen base set"
search "seaking base set"
search "staryu base set"

# 121-130
search "starmie base set"
search "mr mime base set"
search "scyther base set"
search "jynx base set"
search "electabuzz base set"
search "magmar base set"
search "pinsir base set"
search "tauros base set"
search "magikarp base set"
search "gyarados base set"

# 131-140
search "lapras base set"
search "ditto base set"
search "eevee base set"
search "vaporeon base set"
search "jolteon base set"
search "flareon base set"
search "porygon base set"
search "omanyte base set"
search "omastar base set"
search "kabuto base set"

# 141-151
search "kabutops base set"
search "aerodactyl base set"
search "snorlax base set"
search "articuno base set"
search "zapdos base set"
search "moltres base set"
search "dratini base set"
search "dragonair base set"
search "dragonite base set"
search "mewtwo base set"
search "mew base set"

# Bonus - High value variants
echo "=== HIGH VALUE VARIANTS ===" | tee -a "$LOG_FILE"
search "charizard 1st edition"
search "charizard shadowless"
search "blastoise 1st edition"
search "venusaur 1st edition"
search "pikachu 1st edition"
search "mewtwo 1st edition"
search "alakazam 1st edition"
search "gyarados 1st edition"
search "chansey 1st edition"
search "hitmonchan 1st edition"
search "ninetales 1st edition"
search "poliwrath 1st edition"
search "raichu 1st edition"
search "nidoking 1st edition"
search "clefairy 1st edition"
search "magneton 1st edition"
search "zapdos 1st edition"
search "moltres 1st edition"
search "articuno 1st edition"

# Jungle Set Holos
echo "=== JUNGLE SET ===" | tee -a "$LOG_FILE"
search "flareon jungle"
search "jolteon jungle"
search "vaporeon jungle"
search "scyther jungle"
search "pinsir jungle"
search "snorlax jungle"
search "wigglytuff jungle"
search "vileplume jungle"
search "victreebel jungle"
search "kangaskhan jungle"
search "mr mime jungle"
search "electrode jungle"
search "clefable jungle"
search "nidoqueen jungle"
search "pidgeot jungle"
search "venomoth jungle"

# Fossil Set Holos
echo "=== FOSSIL SET ===" | tee -a "$LOG_FILE"
search "dragonite fossil"
search "gengar fossil"
search "haunter fossil"
search "hypno fossil"
search "kabutops fossil"
search "lapras fossil"
search "magneton fossil"
search "moltres fossil"
search "muk fossil"
search "raichu fossil"
search "zapdos fossil"
search "aerodactyl fossil"
search "articuno fossil"
search "ditto fossil"
search "hitmonlee fossil"

echo "" | tee -a "$LOG_FILE"
echo "=== Pokemon 151 Complete ===" | tee -a "$LOG_FILE"
echo "Finished: $(date)" | tee -a "$LOG_FILE"
