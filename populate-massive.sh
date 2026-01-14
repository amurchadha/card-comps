#!/bin/bash

# MASSIVE Database Population
# Premier League, Champions League, + Everything Else
# Let's build a huge database

RELAY_URL="https://relay.steepforce.com/search"
API_KEY="cardcomps_relay_2026"
LOG_FILE="/home/aaron/projects/card-comps/populate-massive.log"
DELAY=60

echo "=== MASSIVE Database Population ===" | tee "$LOG_FILE"
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
# PREMIER LEAGUE - ALL 20 TEAMS
# ============================================

echo "=== PREMIER LEAGUE ===" | tee -a "$LOG_FILE"

# Arsenal
search "topps chrome saka"
search "topps chrome saliba"
search "topps chrome rice declan"
search "topps chrome martinelli"
search "topps chrome odegaard"
search "topps chrome raya"
search "prizm saka"

# Manchester City
search "topps chrome haaland"
search "topps chrome foden"
search "topps chrome rodri"
search "topps chrome bernardo silva"
search "topps chrome grealish"
search "topps chrome ederson"
search "prizm haaland"

# Liverpool
search "topps chrome salah"
search "topps chrome van dijk"
search "topps chrome luis diaz"
search "topps chrome mac allister"
search "topps chrome gakpo"
search "topps chrome szoboszlai"
search "prizm salah"

# Manchester United
search "topps chrome garnacho"
search "topps chrome rashford"
search "topps chrome mainoo"
search "topps chrome bruno fernandes"
search "topps chrome hojlund"
search "topps chrome mount mason"
search "prizm garnacho"

# Chelsea
search "topps chrome palmer cole"
search "topps chrome jackson nicolas"
search "topps chrome mudryk"
search "topps chrome caicedo"
search "topps chrome enzo fernandez"
search "prizm cole palmer"

# Tottenham
search "topps chrome son heung"
search "topps chrome maddison"
search "topps chrome van de ven"
search "topps chrome romero cristian"
search "topps chrome vicario"

# Newcastle
search "topps chrome isak"
search "topps chrome gordon anthony"
search "topps chrome guimaraes"
search "topps chrome tonali"
search "prizm isak"

# Aston Villa
search "topps chrome watkins ollie"
search "topps chrome martinez emiliano"
search "topps chrome mcginn"
search "topps chrome cash matty"

# Brighton
search "topps chrome mitoma"
search "topps chrome pedro joao"
search "topps chrome welbeck"

# West Ham
search "topps chrome paqueta"
search "topps chrome bowen jarrod"
search "topps chrome kudus"

# Brentford
search "topps chrome mbeumo"
search "topps chrome toney ivan"
search "topps chrome wissa"

# Crystal Palace
search "topps chrome olise"
search "topps chrome eze eberechi"
search "topps chrome mateta"

# Wolves
search "topps chrome cunha matheus"
search "topps chrome neto pedro"
search "topps chrome hwang hee"

# Bournemouth
search "topps chrome solanke"
search "topps chrome semenyo"

# Fulham
search "topps chrome robinson antonee"
search "topps chrome jimenez raul"

# Nottingham Forest
search "topps chrome wood chris"
search "topps chrome awoniyi"
search "topps chrome gibbs-white"

# Everton
search "topps chrome calvert-lewin"
search "topps chrome pickford"

# Leicester
search "topps chrome vardy"
search "topps chrome ndidi"
search "topps chrome maddison leicester"

# Ipswich
search "topps chrome hutchinson omari"

# Southampton
search "topps chrome aribo"

# ============================================
# UEFA CHAMPIONS LEAGUE TEAMS
# ============================================

echo "=== CHAMPIONS LEAGUE ===" | tee -a "$LOG_FILE"

# Real Madrid
search "topps chrome bellingham"
search "topps chrome vinicius jr"
search "topps chrome rodrygo"
search "topps chrome valverde"
search "topps chrome tchouameni"
search "topps chrome camavinga"
search "topps chrome modric"
search "topps chrome courtois"
search "prizm bellingham"
search "prizm vinicius"

# Barcelona
search "topps chrome yamal lamine"
search "topps chrome pedri"
search "topps chrome gavi"
search "topps chrome raphinha"
search "topps chrome ter stegen"
search "topps chrome araujo"
search "prizm lamine yamal"

# Bayern Munich
search "topps chrome musiala"
search "topps chrome sane"
search "topps chrome kane harry"
search "topps chrome kimmich"
search "topps chrome davies alphonso"
search "prizm musiala"

# PSG
search "topps chrome dembele ousmane"
search "topps chrome hakimi"
search "topps chrome marquinhos"
search "topps chrome zaire-emery"
search "topps chrome vitinha"
search "prizm zaire-emery"

# Borussia Dortmund
search "topps chrome adeyemi"
search "topps chrome brandt"
search "topps chrome hummels"
search "topps chrome reus"

# RB Leipzig
search "topps chrome sesko"
search "topps chrome xavi simons"
search "topps chrome openda"

# Inter Milan
search "topps chrome lautaro martinez"
search "topps chrome barella"
search "topps chrome thuram marcus"

# AC Milan
search "topps chrome leao rafael"
search "topps chrome pulisic"
search "topps chrome maignan"

# Juventus
search "topps chrome vlahovic"
search "topps chrome chiesa"
search "topps chrome yildiz"

# Napoli
search "topps chrome osimhen"
search "topps chrome kvaratskhelia"
search "topps chrome di lorenzo"

# Atletico Madrid
search "topps chrome griezmann"
search "topps chrome alvarez julian"

# Benfica
search "topps chrome joao neves"
search "topps chrome di maria"

# Porto
search "topps chrome diaz luis porto"
search "topps chrome evanilson"

# Ajax
search "topps chrome brobbey"

# Celtic
search "topps chrome kyogo"
search "topps chrome hart joe"

# Rangers
search "topps chrome cantwell"

# ============================================
# LA LIGA STARS
# ============================================

echo "=== LA LIGA ===" | tee -a "$LOG_FILE"

search "topps chrome guler arda"
search "topps chrome lewandowski"
search "topps chrome de jong frenkie"
search "topps chrome savio real"
search "topps chrome endrick"

# ============================================
# BUNDESLIGA
# ============================================

echo "=== BUNDESLIGA ===" | tee -a "$LOG_FILE"

search "topps chrome wirtz florian"
search "topps chrome havertz"
search "topps chrome gittens"
search "topps chrome tah"

# ============================================
# SERIE A
# ============================================

echo "=== SERIE A ===" | tee -a "$LOG_FILE"

search "topps chrome dovbyk"
search "topps chrome lookman"
search "topps chrome lukaku"

# ============================================
# LIGUE 1
# ============================================

echo "=== LIGUE 1 ===" | tee -a "$LOG_FILE"

search "topps chrome greenwood mason"
search "topps chrome ekitike"
search "topps chrome fofana"

# ============================================
# INTERNATIONAL STARS
# ============================================

echo "=== INTERNATIONAL ===" | tee -a "$LOG_FILE"

# World Cup Stars
search "prizm messi world cup"
search "prizm mbappe world cup"
search "prizm neymar world cup"
search "prizm ronaldo world cup"
search "prizm pulisic world cup"
search "prizm modrić world cup"

# Euro Stars
search "topps chrome euro bellingham"
search "topps chrome euro yamal"
search "topps chrome euro saka"
search "topps chrome euro mbappe"

# ============================================
# FORMULA 1
# ============================================

echo "=== FORMULA 1 ===" | tee -a "$LOG_FILE"

search "topps chrome verstappen"
search "topps chrome hamilton"
search "topps chrome leclerc"
search "topps chrome norris lando"
search "topps chrome sainz"
search "topps chrome piastri"
search "topps chrome russell george"
search "topps chrome alonso fernando"
search "topps chrome perez sergio"
search "topps chrome antonelli"
search "prizm verstappen"
search "prizm hamilton"
search "topps turbo attax verstappen"
search "f1 topps chrome auto"

# ============================================
# UFC / MMA
# ============================================

echo "=== UFC ===" | tee -a "$LOG_FILE"

search "topps chrome mcgregor"
search "topps chrome jones jon"
search "topps chrome makhachev"
search "topps chrome adesanya"
search "topps chrome o'malley"
search "topps chrome chimaev"
search "topps chrome volkanovski"
search "topps chrome du plessis"
search "topps chrome pereira alex"
search "prizm mcgregor"
search "prizm jones ufc"
search "select ufc mcgregor"
search "chronicles ufc jones"

# ============================================
# NHL HOCKEY
# ============================================

echo "=== NHL ===" | tee -a "$LOG_FILE"

# Young Guns / Rookies
search "upper deck young guns bedard"
search "upper deck young guns makar"
search "upper deck young guns hughes"
search "upper deck young guns mcdavid"
search "upper deck young guns crosby"
search "upper deck young guns ovechkin"
search "upper deck young guns matthews"
search "sp authentic mcdavid"
search "sp authentic crosby"
search "o-pee-chee mcdavid"

# Gretzky
search "upper deck gretzky"
search "o-pee-chee gretzky"
search "topps gretzky"

# Other Legends
search "upper deck lemieux"
search "upper deck yzerman"
search "upper deck jagr"

# ============================================
# WWE / WRESTLING
# ============================================

echo "=== WWE ===" | tee -a "$LOG_FILE"

search "topps chrome roman reigns"
search "topps chrome cody rhodes"
search "topps chrome stone cold"
search "topps chrome undertaker"
search "topps chrome john cena"
search "topps chrome the rock"
search "topps chrome hulk hogan"
search "topps chrome bret hart"
search "topps chrome randy orton"
search "topps chrome seth rollins"
search "prizm wwe cody"
search "select wwe roman"

# ============================================
# POKEMON
# ============================================

echo "=== POKEMON ===" | tee -a "$LOG_FILE"

search "charizard base set"
search "charizard 1st edition"
search "pikachu illustrator"
search "shadowless charizard"
search "blastoise base set"
search "venusaur base set"
search "mewtwo base set"
search "mew base set"
search "gengar base set"
search "alakazam base set"
search "charizard vmax"
search "pikachu vmax"
search "umbreon vmax"
search "moonbreon"
search "psa 10 charizard"
search "psa 10 pikachu"
search "pokemon 151 charizard"
search "scarlet violet charizard"

# ============================================
# MAGIC THE GATHERING
# ============================================

echo "=== MTG ===" | tee -a "$LOG_FILE"

search "black lotus mtg"
search "mox sapphire mtg"
search "mox ruby mtg"
search "time walk mtg"
search "ancestral recall mtg"
search "underground sea mtg"
search "tropical island mtg"
search "alpha black lotus"
search "beta black lotus"

# ============================================
# MORE VINTAGE BASEBALL DEEP CUTS
# ============================================

echo "=== MORE VINTAGE ===" | tee -a "$LOG_FILE"

search "1948 leaf jackie robinson"
search "1949 bowman jackie robinson"
search "1951 bowman mickey mantle"
search "1951 bowman willie mays"
search "1933 goudey babe ruth"
search "1933 goudey lou gehrig"
search "1934 goudey lou gehrig"
search "1909 t206 honus wagner"
search "1909 t206 ty cobb"
search "1914 cracker jack shoeless joe"
search "1915 cracker jack babe ruth"
search "1939 play ball ted williams"
search "1941 play ball joe dimaggio"
search "1948 bowman stan musial"
search "1949 bowman satchel paige"

# Pre-War Tobacco
search "t206 mathewson"
search "t206 walter johnson"
search "t206 cy young"
search "t205 ty cobb"

# ============================================
# MORE VINTAGE BASKETBALL
# ============================================

echo "=== MORE VINTAGE BASKETBALL ===" | tee -a "$LOG_FILE"

search "1948 bowman george mikan"
search "1957 topps bob cousy"
search "1957 topps bill russell"
search "1961 fleer elgin baylor"
search "1972 topps julius erving"
search "1980 topps magic johnson"
search "1980 topps larry bird"
search "1997 topps chrome kobe"
search "1997 topps chrome duncan"
search "1998 topps chrome dirk"
search "1998 topps chrome vince carter"
search "2009 topps chrome harden"
search "2012 prizm anthony davis"
search "2012 prizm damian lillard"

# ============================================
# COLLEGE CARDS
# ============================================

echo "=== COLLEGE ===" | tee -a "$LOG_FILE"

search "contenders college mahomes"
search "contenders college burrow"
search "contenders college herbert"
search "contenders college stroud"
search "contenders college caleb williams"
search "panini prizm draft burrow"
search "panini prizm draft stroud"
search "bowman university skenes"
search "bowman university jackson holliday"

# ============================================
# AUTOGRAPHS - HIGH VALUE
# ============================================

echo "=== AUTOGRAPHS ===" | tee -a "$LOG_FILE"

search "topps chrome auto bellingham"
search "topps chrome auto haaland"
search "topps chrome auto yamal auto"
search "topps chrome auto saka"
search "bowman chrome auto trout"
search "bowman chrome auto soto"
search "bowman chrome auto ohtani"
search "bowman chrome auto wander"
search "national treasures mahomes auto"
search "national treasures burrow auto"
search "flawless mahomes auto"
search "topps chrome f1 auto verstappen"
search "ufc auto mcgregor"
search "prizm auto wembanyama"

# ============================================
# 1/1s AND SUPER SHORT PRINTS
# ============================================

echo "=== 1/1s AND SSP ===" | tee -a "$LOG_FILE"

search "superfractor trout"
search "superfractor ohtani"
search "superfractor mahomes"
search "1/1 mahomes"
search "1/1 burrow"
search "printing plate mahomes"
search "printing plate ohtani"
search "gold vinyl prizm"
search "black prizm 1/1"

# ============================================
# BREAKS AND SUPPLIES
# ============================================

echo "=== BOXES AND SUPPLIES ===" | tee -a "$LOG_FILE"

search "topps chrome soccer hobby"
search "topps finest soccer hobby"
search "panini prizm soccer hobby"
search "topps merlin hobby"
search "2024 prizm football hobby"
search "2024 prizm basketball hobby"
search "2024 bowman baseball hobby"
search "2024 topps series 1 hobby"
search "pokemon 151 booster box"
search "pokemon scarlet violet booster"

echo "" | tee -a "$LOG_FILE"
echo "=== MASSIVE Population Complete ===" | tee -a "$LOG_FILE"
echo "Finished: $(date)" | tee -a "$LOG_FILE"
