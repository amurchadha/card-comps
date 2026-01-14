#!/bin/bash

# Comprehensive Card Comps Database Population
# ~300 high-value searches across all sports
# Runtime: ~5 hours at 60s intervals

RELAY_URL="https://relay.steepforce.com/search"
API_KEY="cardcomps_relay_2026"
LOG_FILE="/home/aaron/projects/card-comps/populate-comprehensive.log"
DELAY=60

echo "=== Comprehensive Database Population ===" | tee "$LOG_FILE"
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

# ============================================
# VINTAGE BASEBALL (1950s-1970s) - The Money Cards
# ============================================

# 1952 Topps - The Holy Grail Set
search "1952 topps mickey mantle"
search "1952 topps willie mays"
search "1952 topps jackie robinson"
search "1952 topps eddie mathews"
search "1952 topps pee wee reese"

# 1953 Topps
search "1953 topps mickey mantle"
search "1953 topps willie mays"
search "1953 topps satchel paige"
search "1953 topps jackie robinson"

# 1954 Topps
search "1954 topps hank aaron"
search "1954 topps ernie banks"
search "1954 topps al kaline"
search "1954 topps ted williams"

# 1955 Topps
search "1955 topps roberto clemente"
search "1955 topps sandy koufax"
search "1955 topps harmon killebrew"
search "1955 topps willie mays"

# 1956 Topps
search "1956 topps mickey mantle"
search "1956 topps willie mays"
search "1956 topps roberto clemente"
search "1956 topps jackie robinson"

# 1957 Topps
search "1957 topps mickey mantle"
search "1957 topps ted williams"
search "1957 topps willie mays"
search "1957 topps frank robinson"
search "1957 topps brooks robinson"

# 1958 Topps
search "1958 topps ted williams"
search "1958 topps mickey mantle"
search "1958 topps roger maris"

# 1959 Topps
search "1959 topps bob gibson"
search "1959 topps mickey mantle"
search "1959 topps willie mays"

# 1960s Key Cards
search "1960 topps carl yastrzemski"
search "1961 topps juan marichal"
search "1962 topps lou brock"
search "1963 topps pete rose"
search "1964 topps tony perez"
search "1965 topps steve carlton"
search "1965 topps joe morgan"
search "1967 topps tom seaver"
search "1967 topps rod carew"
search "1968 topps nolan ryan"
search "1968 topps johnny bench"
search "1969 topps reggie jackson"

# 1970s Key Rookies
search "1970 topps thurman munson"
search "1971 topps bert blyleven"
search "1973 topps mike schmidt"
search "1973 topps dwight evans"
search "1975 topps robin yount"
search "1975 topps george brett"
search "1975 topps gary carter"
search "1977 topps andre dawson"
search "1978 topps eddie murray"
search "1979 topps ozzie smith"

# ============================================
# VINTAGE BASKETBALL (1960s-1980s)
# ============================================

search "1961 fleer wilt chamberlain"
search "1961 fleer oscar robertson"
search "1961 fleer jerry west"
search "1969 topps lew alcindor"
search "1970 topps pete maravich"
search "1972 topps julius erving"
search "1974 topps bill walton"
search "1980 topps magic johnson"
search "1980 topps larry bird"
search "1981 topps kevin mchale"
search "1984 star michael jordan"
search "1986 fleer michael jordan"
search "1986 fleer charles barkley"
search "1986 fleer hakeem olajuwon"
search "1986 fleer karl malone"
search "1986 fleer patrick ewing"
search "1986 fleer isiah thomas"
search "1986 fleer clyde drexler"

# ============================================
# VINTAGE FOOTBALL (1950s-1980s)
# ============================================

search "1957 topps johnny unitas"
search "1957 topps bart starr"
search "1958 topps jim brown"
search "1965 topps joe namath"
search "1970 topps terry bradshaw"
search "1971 topps joe greene"
search "1976 topps walter payton"
search "1981 topps joe montana"
search "1984 topps john elway"
search "1984 topps dan marino"
search "1986 topps jerry rice"

# ============================================
# MODERN BASEBALL ROOKIES (2010s-2020s)
# ============================================

# Mike Trout
search "2011 topps update mike trout"
search "2011 bowman chrome mike trout"
search "2009 bowman chrome mike trout"

# Mookie Betts
search "2014 topps update mookie betts"
search "2014 bowman chrome mookie betts"

# Juan Soto
search "2018 topps update juan soto"
search "2018 bowman chrome juan soto"

# Shohei Ohtani
search "2018 topps shohei ohtani"
search "2018 bowman chrome ohtani"
search "2018 topps chrome ohtani"

# Julio Rodriguez
search "2022 topps julio rodriguez"
search "2022 bowman chrome julio rodriguez"

# Gunnar Henderson
search "2023 topps gunnar henderson"
search "2023 bowman chrome gunnar henderson"

# Corbin Carroll
search "2023 topps corbin carroll"
search "2023 bowman chrome corbin carroll"

# Elly De La Cruz
search "2023 topps elly de la cruz"
search "2023 bowman chrome elly de la cruz"

# Other Hot Prospects
search "2024 bowman chrome paul skenes"
search "2023 bowman chrome jackson holliday"
search "2023 bowman chrome jackson chourio"
search "2022 bowman chrome druw jones"

# ============================================
# MODERN BASKETBALL (2010s-2020s)
# ============================================

# LeBron James
search "2003 topps chrome lebron james"
search "2003 upper deck lebron james"

# Kevin Durant
search "2007 topps chrome kevin durant"
search "2007 bowman chrome kevin durant"

# Stephen Curry
search "2009 topps chrome stephen curry"
search "2009 panini stephen curry"

# Giannis Antetokounmpo
search "2013 panini prizm giannis"
search "2013 hoops giannis"

# Luka Doncic
search "2018 panini prizm luka doncic"
search "2018 donruss optic luka doncic"

# Ja Morant
search "2019 panini prizm ja morant"
search "2019 donruss optic ja morant"

# Anthony Edwards
search "2020 panini prizm anthony edwards"
search "2020 donruss optic anthony edwards"

# Victor Wembanyama
search "2023 prizm victor wembanyama"
search "2023 topps chrome victor wembanyama"
search "2023 bowman chrome wembanyama"

# Chet Holmgren
search "2022 prizm chet holmgren"

# ============================================
# MODERN FOOTBALL (2010s-2020s)
# ============================================

# Patrick Mahomes
search "2017 panini prizm patrick mahomes"
search "2017 donruss optic patrick mahomes"
search "2017 select patrick mahomes"

# Josh Allen
search "2018 panini prizm josh allen"
search "2018 donruss optic josh allen"

# Lamar Jackson
search "2018 panini prizm lamar jackson"
search "2018 donruss optic lamar jackson"

# Joe Burrow
search "2020 panini prizm joe burrow"
search "2020 donruss optic joe burrow"
search "2020 select joe burrow"

# Justin Herbert
search "2020 panini prizm justin herbert"
search "2020 donruss optic justin herbert"

# Trevor Lawrence
search "2021 panini prizm trevor lawrence"
search "2021 donruss optic trevor lawrence"

# CJ Stroud
search "2023 panini prizm cj stroud"
search "2023 donruss optic cj stroud"

# Caleb Williams
search "2024 prizm caleb williams"
search "2024 bowman chrome caleb williams"

# Puka Nacua
search "2023 prizm puka nacua"
search "2023 donruss optic puka nacua"

# Brock Bowers
search "2024 prizm brock bowers"

# Marvin Harrison Jr
search "2024 prizm marvin harrison jr"

# ============================================
# SOCCER / FOOTBALL (2015-2024)
# ============================================

# Kylian Mbappe
search "2017 topps chrome mbappe"
search "2018 panini prizm mbappe"
search "prizm mbappe world cup"

# Erling Haaland
search "topps chrome haaland"
search "topps finest haaland"
search "prizm haaland"

# Jude Bellingham
search "topps chrome bellingham"
search "topps finest bellingham"
search "topps merlin bellingham"

# Vinicius Jr
search "topps chrome vinicius jr"
search "topps finest vinicius"
search "prizm vinicius jr"

# Lionel Messi
search "topps chrome messi"
search "prizm messi world cup"
search "topps finest messi"

# Cristiano Ronaldo
search "topps chrome ronaldo"
search "prizm ronaldo"

# Young Stars
search "topps chrome lamine yamal"
search "topps finest lamine yamal"
search "topps chrome pedri"
search "topps chrome foden"
search "topps chrome saka"
search "topps chrome palmer"
search "topps chrome mainoo"

# More Garnacho (your cards)
search "topps chrome garnacho refractor"
search "select garnacho"
search "donruss garnacho"

# Warren Zaire-Emery
search "topps chrome zaire-emery"
search "topps finest zaire-emery"

# Florian Wirtz
search "topps chrome florian wirtz"
search "topps finest wirtz"

# Jamal Musiala
search "topps chrome musiala"
search "topps finest musiala"

# ============================================
# PARALLELS & VARIATIONS (High Value)
# ============================================

# Prizm Silvers
search "prizm silver mahomes"
search "prizm silver wembanyama"
search "prizm silver burrow"

# Bowman Chrome Autos
search "bowman chrome auto trout"
search "bowman chrome auto soto"
search "bowman chrome auto acuna auto"

# Topps Chrome Refractors
search "topps chrome refractor ohtani"
search "topps chrome refractor julio rodriguez"

# Select Tie-Dye
search "select tie-dye mahomes"
search "select tie-dye herbert"

# Optic Holo
search "donruss optic holo burrow"
search "donruss optic holo herbert"

# ============================================
# GRADED CARDS (PSA/BGS specific)
# ============================================

search "psa 10 trout rookie"
search "psa 10 ohtani rookie"
search "psa 10 mahomes prizm"
search "psa 10 luka prizm"
search "psa 9 jordan fleer"
search "bgs 9.5 jordan fleer"
search "psa 8 mantle 1952"
search "psa 7 aaron rookie"

# ============================================
# BOXES & CASES (For Breakers)
# ============================================

search "2023 bowman chrome hobby box"
search "2023 topps chrome hobby box"
search "2023 prizm football hobby box"
search "2023 prizm basketball hobby box"
search "2024 bowman chrome hobby"
search "2024 topps chrome hobby"

echo "" | tee -a "$LOG_FILE"
echo "=== Population Complete ===" | tee -a "$LOG_FILE"
echo "Finished: $(date)" | tee -a "$LOG_FILE"
