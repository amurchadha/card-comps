#!/bin/bash
# DB population script - 1 minute intervals
# Run with: nohup ./populate-db.sh > populate.log 2>&1 &

RELAY_URL="https://relay.steepforce.com/search"
API_KEY="cardcomps_relay_2026"
DELAY=60  # 1 minute

search() {
  local query="$1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Searching: $query"

  response=$(curl -s -w "\n%{size_download}" -X POST "$RELAY_URL" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d "{\"query\": \"$query\", \"type\": \"sold_items\"}")

  size=$(echo "$response" | tail -1)
  items=$(echo "$response" | head -n -1 | grep -o '"itemId"' | wc -l)

  echo "  -> $items items, ${size} bytes"

  if [ "$items" -gt 0 ]; then
    sleep $DELAY
  else
    echo "  -> No results, short wait..."
    sleep 30
  fi
}

echo "=== Card Comps DB Population ==="
echo "Started: $(date)"
echo "Delay between searches: ${DELAY}s"
echo ""

# Baseball
search "mike trout"
search "shohei ohtani"
search "aaron judge"
search "mookie betts"
search "ronald acuna"
search "juan soto"
search "trea turner"
search "freddie freeman"
search "corey seager"
search "manny machado"
search "bryce harper"
search "pete alonso"
search "vlad guerrero jr"
search "julio rodriguez"
search "bobby witt jr"
search "gunnar henderson"
search "corbin carroll"
search "ken griffey jr"
search "derek jeter"
search "mickey mantle"
search "babe ruth"
search "willie mays"
search "hank aaron"
search "jackie robinson"
search "ted williams"
search "roberto clemente"
search "nolan ryan"
search "cal ripken jr"
search "mike piazza"
search "mariano rivera"
search "david ortiz"
search "ichiro suzuki"
search "albert pujols"

# Basketball
search "michael jordan"
search "lebron james"
search "kobe bryant"
search "shaquille oneal"
search "stephen curry"
search "kevin durant"
search "giannis antetokounmpo"
search "luka doncic"
search "jayson tatum"
search "ja morant"
search "zion williamson"
search "anthony edwards"
search "victor wembanyama"
search "magic johnson"
search "larry bird"
search "kareem abdul jabbar"
search "tim duncan"
search "dirk nowitzki"
search "allen iverson"
search "vince carter"
search "kevin garnett"
search "charles barkley"
search "hakeem olajuwon"
search "scottie pippen"
search "dwyane wade"
search "carmelo anthony"
search "chris paul"
search "james harden"
search "kyrie irving"
search "kawhi leonard"
search "damian lillard"

# Football
search "patrick mahomes"
search "josh allen"
search "joe burrow"
search "lamar jackson"
search "jalen hurts"
search "justin herbert"
search "cj stroud"
search "caleb williams"
search "travis kelce"
search "tyreek hill"
search "justin jefferson"
search "jamarr chase"
search "ceedee lamb"
search "davante adams"
search "aj brown"
search "stefon diggs"
search "derrick henry"
search "christian mccaffrey"
search "saquon barkley"
search "nick chubb"
search "micah parsons"
search "tj watt"
search "aaron donald"
search "myles garrett"
search "tom brady"
search "peyton manning"
search "aaron rodgers"
search "drew brees"
search "brett favre"
search "dan marino"
search "joe montana"
search "john elway"
search "jerry rice"
search "randy moss"
search "terrell owens"
search "barry sanders"
search "emmitt smith"
search "walter payton"
search "jim brown"
search "lawrence taylor"
search "ray lewis"
search "deion sanders"
search "bo jackson"

echo ""
echo "=== Completed ==="
echo "Finished: $(date)"
