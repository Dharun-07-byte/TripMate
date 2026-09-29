const fs = require('fs');
const path = require('path');

// Enriched cities mapping for every country to ensure 6-10+ popular cities, destinations, and sights
const enrichedCities = {
  'Afghanistan': ['Kabul', 'Herat', 'Bamyan Valley', 'Mazar-i-Sharif', 'Band-e Amir National Park', 'Kandahar', 'Panjshir Valley', 'Nuristan'],
  'Albania': ['Tirana', 'Saranda', 'Ksamil', 'Berat', 'Gjirokaster', 'Theth National Park', 'Valbona Valley', 'Vlora', 'Shkodra'],
  'Algeria': ['Algiers', 'Oran', 'Constantine', 'Ghardaia', 'Djanet (Sahara)', 'Tlemcen', 'Annaba', 'Timgad', 'Bejaia'],
  'Andorra': ['Andorra la Vella', 'Soldeu', 'Escaldes-Engordany', 'Encamp', 'Canillo', 'Ordino', 'Pas de la Casa', 'Arinsal'],
  'Angola': ['Luanda', 'Benguela', 'Lubango', 'Namibe', 'Kalandula Falls', 'Huambo', 'Malanje', 'Cabo Ledo'],
  'Antigua and Barbuda': ['St. John\'s', 'English Harbour', 'Dickenson Bay', 'Codrington (Barbuda)', 'Jolly Harbour', 'Falmouth Harbour', 'Half Moon Bay', 'Shirley Heights'],
  'Argentina': ['Buenos Aires', 'Bariloche', 'Mendoza', 'Iguazu Falls', 'Ushuaia', 'El Calafate (Perito Moreno)', 'Salta', 'Cordoba', 'San Martin de los Andes'],
  'Armenia': ['Yerevan', 'Dilijan', 'Gyumri', 'Garni', 'Lake Sevan', 'Tatev', 'Tsaghkadzor', 'Goris', 'Noravank'],
  'Australia': ['Sydney', 'Melbourne', 'Gold Coast', 'Cairns (Great Barrier Reef)', 'Perth', 'Adelaide', 'Brisbane', 'Byron Bay', 'Whitsunday Islands', 'Hobart (Tasmania)'],
  'Austria': ['Vienna', 'Salzburg', 'Innsbruck', 'Hallstatt', 'Graz', 'Zell am See', 'Kitzbühel', 'Wachau Valley', 'Salzkammergut'],
  'Azerbaijan': ['Baku', 'Sheki', 'Gabala', 'Gobustan', 'Ganja', 'Khinalug', 'Lankaran', 'Shahdag Mountain Resort'],
  'Bahamas': ['Nassau', 'Exuma (Swimming Pigs)', 'Paradise Island', 'Eleuthera', 'Harbour Island (Pink Sands)', 'Grand Bahama (Freeport)', 'Abaco Islands', 'Bimini'],
  'Bahrain': ['Manama', 'Muharraq', 'Riffa', 'Amwaj Islands', 'Saar', 'Zallaq', 'Hawar Islands', 'Al Jasra'],
  'Bangladesh': ['Dhaka', 'Cox\'s Bazar', 'Sylhet (Tea Gardens)', 'Sundarbans Mangrove Forest', 'Chittagong', 'Srimangal', 'Saint Martin\'s Island', 'Bandarban Hills'],
  'Barbados': ['Bridgetown', 'Holetown', 'Oistins', 'Bathsheba', 'Speightstown', 'St. Lawrence Gap', 'Carlisle Bay', 'Crane Beach'],
  'Belarus': ['Minsk', 'Brest', 'Grodno', 'Vitebsk', 'Mir Castle Region', 'Nesvizh', 'Braslav Lakes', 'Bialowieza Forest'],
  'Belgium': ['Brussels', 'Bruges', 'Ghent', 'Antwerp', 'Leuven', 'Dinant', 'Durbuy (Ardennes)', 'Ypres', 'Namur'],
  'Belize': ['Belize City', 'San Pedro (Ambergris Caye)', 'Caye Caulker', 'Placencia', 'San Ignacio', 'Hopkins', 'Cayo District', 'Turneffe Atoll'],
  'Benin': ['Cotonou', 'Ouidah', 'Porto-Novo', 'Ganvie (Stilt Village)', 'Grand-Popo', 'Abomey', 'Pendjari National Park', 'Natitingou'],
  'Bhutan': ['Thimphu', 'Paro (Tiger\'s Nest)', 'Punakha', 'Phobjikha Valley', 'Bumthang', 'Haa Valley', 'Trongsa', 'Dochula Pass'],
  'Bolivia': ['La Paz', 'Salar de Uyuni (Salt Flats)', 'Sucre', 'Potosi', 'Copacabana (Lake Titicaca)', 'Rurrenabaque (Amazon)', 'Coroico', 'Tupiza'],
  'Bosnia and Herzegovina': ['Sarajevo', 'Mostar', 'Blagaj', 'Banja Luka', 'Jajce', 'Trebinje', 'Kravice Waterfalls', 'Konjic'],
  'Botswana': ['Maun (Okavango Delta)', 'Kasane (Chobe)', 'Gaborone', 'Francistown', 'Makgadikgadi Salt Pans', 'Moremi Game Reserve', 'Tsodilo Hills', 'Central Kalahari'],
  'Brazil': ['Rio de Janeiro', 'São Paulo', 'Salvador da Bahia', 'Iguazu Falls', 'Florianopolis', 'Manaus (Amazon)', 'Fernando de Noronha', 'Paraty', 'Jericoacoara', 'Lençóis Maranhenses'],
  'Brunei': ['Bandar Seri Begawan', 'Tutong', 'Temburong (Ulu Temburong)', 'Kuala Belait', 'Seria', 'Muara Beach', 'Kampong Ayer', 'Bangar'],
  'Bulgaria': ['Sofia', 'Plovdiv', 'Varna (Black Sea)', 'Bansko', 'Veliko Tarnovo', 'Nessebar', 'Sozopol', 'Rila Monastery & Lakes'],
  'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Banfora (Cascades)', 'Sindou Peaks', 'Koro Rock Village', 'Tiébélé (Painted Houses)', 'Gorom-Gorom', 'Ziniaré'],
  'Burundi': ['Bujumbura', 'Gitega', 'Ngozi', 'Rutana (Karera Falls)', 'Rumonge (Tanganyika Beach)', 'Kigwena Forest', 'Gishora Drum Sanctuary', 'Kirundo'],
  'Cambodia': ['Siem Reap (Angkor Wat)', 'Phnom Penh', 'Koh Rong Island', 'Battambang', 'Kampot', 'Kep', 'Koh Rong Sanloem', 'Preah Vihear'],
  'Cameroon': ['Yaounde', 'Douala', 'Kribi (Lobe Falls)', 'Limbe (Black Sands)', 'Buea (Mount Cameroon)', 'Bafoussam', 'Bamenda', 'Waza National Park'],
  'Canada': ['Vancouver', 'Banff & Lake Louise', 'Toronto', 'Montreal', 'Quebec City', 'Jasper', 'Whistler', 'Niagara-on-the-Lake', 'Tofino (Vancouver Island)', 'Calgary'],
  'Cape Verde': ['Praia (Santiago)', 'Santa Maria (Sal Island)', 'Mindelo (Sao Vicente)', 'Boa Vista Island', 'Santo Antao (Hiking Valleys)', 'Fogo Volcano', 'Tarrafal', 'Ribeira Grande'],
  'Central African Republic': ['Bangui', 'Boali (Waterfalls)', 'Berberati', 'Dzanga-Sangha Reserve', 'Bouar (Megaliths)', 'Mbaiki', 'Manovo-Gounda', 'Bambari'],
  'Chad': ['N\'Djamena', 'Faya-Largeau', 'Abeche', 'Ennedi Plateau (Rock Arches)', 'Lakes of Ounianga', 'Guelta d\'Archei', 'Zakouma National Park', 'Moundou'],
  'Chile': ['Santiago', 'Torres del Paine (Patagonia)', 'San Pedro de Atacama', 'Valparaíso', 'Easter Island (Rapa Nui)', 'Puerto Varas (Lake District)', 'Pucón', 'Chiloé Island'],
  'China': ['Beijing', 'Shanghai', 'Xi\'an', 'Chengdu', 'Guilin & Yangshuo', 'Zhangjiajie (Avatar Mountains)', 'Hangzhou', 'Suzhou', 'Lijiang & Yunnan', 'Hong Kong'],
  'Colombia': ['Medellin', 'Cartagena', 'Bogota', 'Salento (Cocora Valley)', 'Santa Marta & Tayrona', 'Cali', 'San Andres Island', 'Guatapé', 'Villa de Leyva'],
  'Comoros': ['Moroni', 'Mutsamudu', 'Fomboni', 'Mount Karthala Volcano', 'Chindini Beach', 'Lac Sale (Salt Lake)', 'Mohéli Marine Park', 'Mitsamiouli'],
  'Costa Rica': ['San Jose', 'Arenal & La Fortuna', 'Manuel Antonio', 'Monteverde Cloud Forest', 'Tamarindo & Guanacaste', 'Puerto Viejo (Caribbean)', 'Tortuguero', 'Corcovado'],
  'Croatia': ['Dubrovnik', 'Split', 'Plitvice Lakes', 'Hvar Island', 'Zadar', 'Rovinj (Istria)', 'Korčula Island', 'Zagreb', 'Brač Island'],
  'Cuba': ['Havana', 'Varadero', 'Trinidad', 'Viñales Valley', 'Cienfuegos', 'Santiago de Cuba', 'Baracoa', 'Cayo Santa Maria'],
  'Cyprus': ['Paphos', 'Limassol', 'Ayia Napa', 'Larnaca', 'Nicosia', 'Troodos Mountains', 'Protaras', 'Polis & Akamas'],
  'Czech Republic': ['Prague', 'Cesky Krumlov', 'Brno', 'Karlovy Vary', 'Pilsen', 'Kutná Hora', 'Bohemian Switzerland', 'Olomouc'],
  'Democratic Republic of the Congo': ['Kinshasa', 'Goma (Lake Kivu)', 'Lubumbashi', 'Virunga National Park', 'Mount Nyiragongo Volcano', 'Bukavu (Kahuzi-Biega)', 'Kisangani', 'Zongo'],
  'Denmark': ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Ribe', 'Helsingør (Kronborg)', 'Skagen (Two Seas)', 'Bornholm Island'],
  'Djibouti': ['Djibouti City', 'Tadjoura', 'Obock', 'Lake Assal (Salt Lake)', 'Lake Abbe (Chimneys)', 'Ardoukoba Volcano', 'Moucha Island', 'Day Forest'],
  'Dominica': ['Roseau', 'Portsmouth', 'Soufriere (Champagne Reef)', 'Trafalgar Falls', 'Calibishie', 'Scotts Head', 'Cabrits National Park', 'Boiling Lake'],
  'Dominican Republic': ['Punta Cana', 'Santo Domingo', 'Puerto Plata', 'Samaná Peninsula', 'Cabarete', 'Las Terrenas', 'Bayahibe', 'Jaragua National Park'],
  'Ecuador': ['Quito', 'Galapagos Islands', 'Cuenca', 'Baños (Volcano Swing)', 'Otavalo', 'Montañita (Surf)', 'Cotopaxi National Park', 'Guayaquil'],
  'Egypt': ['Cairo & Giza', 'Luxor', 'Aswan', 'Hurghada (Red Sea)', 'Sharm El Sheikh', 'Alexandria', 'Dahab', 'Siwa Oasis', 'Abu Simbel'],
  'El Salvador': ['San Salvador', 'El Tunco & El Zonte (Surf)', 'Santa Ana', 'Suchitoto', 'Ruta de las Flores (Juayua)', 'Lake Coatepeque', 'La Libertad', 'Apaneca'],
  'Equatorial Guinea': ['Malabo (Bioko Island)', 'Bata', 'Oyala (Ciudad de la Paz)', 'Luba & Arena Blanca', 'Pico Basile', 'Ureka (Turtle Beach)', 'Annobon Island', 'Monte Alen'],
  'Eritrea': ['Asmara', 'Massawa', 'Keren', 'Dahlak Archipelago', 'Qohaito Ancient Ruins', 'Senafe', 'Assab', 'Filfil'],
  'Estonia': ['Tallinn', 'Tartu', 'Parnu', 'Saaremaa Island', 'Hiiumaa Island', 'Haapsalu', 'Lahemaa National Park', 'Viljandi'],
  'Eswatini': ['Mbabane', 'Manzini', 'Ezulwini Valley', 'Mlilwane Wildlife Sanctuary', 'Piggs Peak', 'Hlane Royal National Park', 'Malolotja Nature Reserve', 'Ngwenya'],
  'Ethiopia': ['Addis Ababa', 'Lalibela', 'Gondar', 'Simien Mountains', 'Axum', 'Omo Valley', 'Bahar Dar (Lake Tana)', 'Danakil Depression', 'Harar'],
  'Fiji': ['Nadi', 'Suva', 'Mamanuca Islands', 'Yasawa Islands', 'Taveuni (Garden Island)', 'Pacific Harbour', 'Coral Coast', 'Kadavu'],
  'Finland': ['Helsinki', 'Rovaniemi (Lapland)', 'Tampere', 'Turku & Archipelago', 'Inari & Saariselkä', 'Porvoo', 'Kuusamo (Ruka)', 'Savonlinna'],
  'France': ['Paris', 'Nice & French Riviera', 'Lyon', 'Bordeaux', 'Marseille', 'Strasbourg', 'Chamonix (Mont Blanc)', 'Provence (Aix & Avignon)', 'Loire Valley Châteaux', 'Corsica'],
  'Gabon': ['Libreville', 'Port-Gentil', 'Franceville', 'Loango National Park (Surfing Hippos)', 'Lope National Park', 'Ivindo National Park (Kongou Falls)', 'Pointe Denis', 'Lambarene'],
  'Gambia': ['Banjul', 'Kololi & Senegambia', 'Bakau', 'Serekunda', 'Janjanbureh (Georgetown)', 'Kunta Kinteh Island', 'Tanji Fishing Village', 'Brikama'],
  'Georgia': ['Tbilisi', 'Kazbegi (Stepantsminda)', 'Batumi (Black Sea)', 'Sighnaghi (Wine City)', 'Kutaisi', 'Mestia & Svaneti', 'Borjomi', 'Gudauri'],
  'Germany': ['Berlin', 'Munich & Bavarian Alps', 'Frankfurt', 'Hamburg', 'Cologne', 'Dresden', 'Heidelberg', 'Black Forest (Freiburg)', 'Rothenburg ob der Tauber', 'Nuremberg'],
  'Ghana': ['Accra', 'Cape Coast', 'Kumasi (Ashanti)', 'Tamale', 'Elmina', 'Mole National Park', 'Busua Beach', 'Volta Region (Wli Falls)'],
  'Greece': ['Santorini', 'Athens', 'Mykonos', 'Crete (Chania & Heraklion)', 'Rhodes', 'Corfu', 'Zakynthos (Navagio)', 'Meteora Monasteries', 'Naxos & Paros'],
  'Grenada': ['St. George\'s', 'Grand Anse Beach', 'Gouyave', 'Carriacou Island', 'Levera National Park', 'Grenville', 'Annandale & Grand Etang', 'Petite Martinique'],
  'Guatemala': ['Antigua Guatemala', 'Lake Atitlan (Panajachel & San Pedro)', 'Flores', 'Tikal National Park', 'Semuc Champey', 'Quetzaltenango (Xela)', 'Rio Dulce & Livingston', 'Chichicastenango'],
  'Guinea': ['Conakry', 'Labe (Fouta Djallon)', 'Kindia', 'Kankan', 'Iles de Los', 'Dalaba', 'Chutes de Ditinn', 'Nzérékoré'],
  'Guinea-Bissau': ['Bissau', 'Bubaque Island (Bijagos)', 'Varela Beach', 'Orango Island (Saltwater Hippos)', 'Bolama Island', 'Cacheu', 'Rubane Island', 'Cantanhez'],
  'Guyana': ['Georgetown', 'Lethem (Rupununi Savannah)', 'Bartica', 'Kaieteur Falls Region', 'Iwokrama Rainforest', 'Shell Beach', 'Essequibo River Islands', 'New Amsterdam'],
  'Haiti': ['Port-au-Prince', 'Cap-Haitien (Citadelle)', 'Jacmel', 'Labadee', 'Ile-a-Vache', 'Kenscoff', 'Bassin Bleu', 'Les Cayes'],
  'Honduras': ['Tegucigalpa', 'Roatan Island (West Bay)', 'Utila', 'Copan Ruinas', 'La Ceiba (Pico Bonito)', 'San Pedro Sula', 'Guanaja Island', 'Cayos Cochinos'],
  'Hungary': ['Budapest', 'Lake Balaton (Siofok & Tihany)', 'Eger', 'Debrecen', 'Szentendre', 'Pécs', 'Tokaj Wine Region', 'Szeged'],
  'Iceland': ['Reykjavik', 'Vik (Black Sand Beach)', 'Akureyri', 'Golden Circle (Geysir & Gullfoss)', 'Snaefellsnes Peninsula', 'Jökulsárlón Glacier Lagoon', 'Husavik (Whale Watching)', 'Westfjords'],
  'India': ['Goa', 'Ladakh (Leh & Pangong)', 'Kerala Backwaters (Alleppey)', 'Jaipur & Udaipur', 'Varanasi', 'Manali & Shimla', 'Kashmir (Srinagar & Gulmarg)', 'Andaman Islands (Havelock)', 'Agra (Taj Mahal)', 'Rishikesh'],
  'Indonesia': ['Bali (Ubud, Canggu & Seminyak)', 'Komodo National Park & Labuan Bajo', 'Gili Islands', 'Lombok', 'Yogyakarta (Borobudur & Prambanan)', 'Raja Ampat', 'Jakarta', 'Mount Bromo & Ijen'],
  'Iran': ['Isfahan', 'Shiraz', 'Tehran', 'Yazd (Desert Towers)', 'Kashan', 'Tabriz', 'Kish Island', 'Qeshm Island'],
  'Iraq': ['Baghdad', 'Erbil (Kurdistan)', 'Najaf', 'Basra', 'Karbala', 'Sulaymaniyah', 'Babylon Ruins', 'Mesopotamian Marshes'],
  'Ireland': ['Dublin', 'Galway & Connemara', 'Killarney & Ring of Kerry', 'Cork & Kinsale', 'Kilkenny', 'Clifden', 'Dingle Peninsula', 'Giant\'s Causeway Coast', 'Westport'],
  'Israel': ['Tel Aviv', 'Jerusalem', 'Dead Sea (Ein Gedi)', 'Eilat (Red Sea Reefs)', 'Haifa & Mount Carmel', 'Tiberias (Sea of Galilee)', 'Nazareth', 'Acre (Akko)'],
  'Italy': ['Rome', 'Florence & Tuscany', 'Amalfi Coast (Positano & Capri)', 'Venice', 'Milan', 'Lake Como (Bellagio)', 'Cinque Terre', 'Sicily (Taormina & Palermo)', 'Dolomites (Cortina)', 'Naples'],
  'Ivory Coast': ['Abidjan', 'Yamoussoukro', 'Grand-Bassam', 'San Pedro', 'Assinie Beach', 'Man (Tooth of Man Peaks)', 'Korhogo', 'Bouaké'],
  'Jamaica': ['Montego Bay', 'Negril (Seven Mile Beach)', 'Ocho Rios', 'Kingston (Blue Mountains)', 'Port Antonio', 'Treasure Beach', 'Falmouth', 'Runaway Bay'],
  'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Mount Fuji & Hakone', 'Hokkaido (Sapporo & Niseko)', 'Nara', 'Hiroshima & Miyajima', 'Okinawa Tropical Islands', 'Takayama & Shirakawa-go', 'Kobe'],
  'Jordan': ['Petra', 'Wadi Rum Desert', 'Amman', 'Dead Sea', 'Aqaba (Red Sea)', 'Jerash Roman City', 'Madaba & Mount Nebo', 'Dana Biosphere Reserve'],
  'Kazakhstan': ['Almaty', 'Astana (Nur-Sultan)', 'Charyn Canyon', 'Turkistan', 'Aktau (Caspian Sea)', 'Kolsai Lakes & Kaindy', 'Shymkent', 'Burabay National Park'],
  'Kenya': ['Nairobi', 'Maasai Mara National Reserve', 'Diani Beach (Mombasa)', 'Amboseli (Kilimanjaro Views)', 'Lake Nakuru & Naivasha', 'Samburu Reserve', 'Lamu Old Town Island', 'Tsavo National Parks'],
  'Kuwait': ['Kuwait City', 'Salmiya', 'Hawally', 'Failaka Island', 'Al Jahra', 'Al Khiran Marina', 'Ahmadi', 'Subiya'],
  'Kyrgyzstan': ['Bishkek', 'Issyk-Kul Lake (Cholpon-Ata)', 'Song-Kul Alpine Lake', 'Karakol & Jeti-Oguz', 'Osh (Sulaiman-Too)', 'Arslanbob Walnut Forest', 'Ala Archa National Park', 'Tash Rabat'],
  'Laos': ['Luang Prabang', 'Vang Vieng', 'Vientiane', 'Si Phan Don (4000 Islands)', 'Champasak (Wat Phou)', 'Nong Khiaw', 'Pakse & Bolaven Plateau', 'Plain of Jars'],
  'Latvia': ['Riga', 'Jurmala (Beach Resort)', 'Sigulda (Gauja Valley)', 'Cesis', 'Kuldiga (Widest Waterfall)', 'Liepaja', 'Ventspils', 'Rundale Palace Region'],
  'Lebanon': ['Beirut', 'Byblos (Jbeil)', 'Baalbek', 'Batroun (Coastal Vibe)', 'Jeita Grotto', 'Chouf Cedars', 'Tyre (Sour)', 'Qadisha Sacred Valley'],
  'Liechtenstein': ['Vaduz', 'Malbun (Ski & Alpine Trails)', 'Schaan', 'Balzers (Gutenberg Castle)', 'Triesenberg', 'Planken', 'Ruggell', 'Eschen'],
  'Lithuania': ['Vilnius', 'Kaunas', 'Klaipeda', 'Trakai Island Castle', 'Nida (Curonian Spit)', 'Palanga Beach Resort', 'Siauliai (Hill of Crosses)', 'Druskininkai'],
  'Luxembourg': ['Luxembourg City', 'Vianden', 'Echternach', 'Mullerthal (Little Switzerland)', 'Clervaux', 'Esch-sur-Alzette', 'Remich (Moselle Valley)', 'Larochette'],
  'Madagascar': ['Antananarivo', 'Nosy Be Tropical Island', 'Morondava (Avenue of Baobabs)', 'Andasibe-Mantadia (Lemurs)', 'Isalo National Park', 'Ile Sainte-Marie (Whales)', 'Tsingy de Bemaraha', 'Antsirabe'],
  'Malawi': ['Lilongwe', 'Cape Maclear (Lake Malawi)', 'Blantyre', 'Nkhata Bay', 'Zomba Plateau', 'Liwonde National Park', 'Mount Mulanje', 'Majete Wildlife Reserve'],
  'Malaysia': ['Kuala Lumpur', 'Penang (George Town)', 'Langkawi Archipelago', 'Malacca Historical City', 'Sabah (Kota Kinabalu & Kinabalu Peak)', 'Sarawak (Kuching)', 'Cameron Highlands', 'Perhentian Islands', 'Taman Negara'],
  'Maldives': ['Male', 'Maafushi Island', 'Ari Atoll', 'Baa Atoll (Hanifaru Bay)', 'North Male Atoll', 'Rasdhoo Island', 'Dhigurah Island (Whale Sharks)', 'Vaadhoo (Glowing Beach)'],
  'Mali': ['Bamako', 'Djenne (Great Mud Mosque)', 'Mopti (Venice of Mali)', 'Timbuktu', 'Dogon Country (Bandiagara)', 'Segou', 'Siby', 'Gao'],
  'Malta': ['Valletta', 'Mdina (Silent City)', 'Gozo Island (Victoria & Ramla)', 'Sliema & St. Julian\'s', 'Comino Island (Blue Lagoon)', 'Marsaxlokk Fishing Village', 'Mellieha Bay', 'Three Cities'],
  'Mauritania': ['Nouakchott', 'Chinguetti (Desert Libraries)', 'Ouadane', 'Atar & Adrar Plateau', 'Nouadhibou', 'Terjit Desert Oasis', 'Banc d\'Arguin National Park', 'Richat Structure'],
  'Mauritius': ['Port Louis', 'Grand Baie', 'Flic en Flac', 'Le Morne Brabant', 'Belle Mare', 'Chamarel (Seven Coloured Earths)', 'Trou aux Biches', 'Blue Bay Marine Park', 'Rodrigues Island'],
  'Mexico': ['Mexico City', 'Cancun', 'Tulum & Riviera Maya', 'Oaxaca', 'Playa del Carmen', 'Guadalajara & Tequila', 'San Miguel de Allende', 'Puerto Vallarta', 'Cabo San Lucas', 'Mérida'],
  'Monaco': ['Monaco-Ville (The Rock)', 'Monte Carlo & Casino', 'La Condamine', 'Fontvieille Port', 'Larvotto Beach', 'Moneghetti', 'Port Hercules', 'Jardin Exotique'],
  'Mongolia': ['Ulaanbaatar', 'Gobi Desert (Khongoryn Els)', 'Lake Khovsgol (Blue Pearl)', 'Terelj National Park', 'Orkhon Valley', 'Altai Tavan Bogd (Eagle Hunters)', 'Karakorum Ancient Capital', 'Tsagaan Suvarga'],
  'Montenegro': ['Kotor (Old Town & Bay)', 'Budva Riviera', 'Perast & Our Lady of the Rocks', 'Durmitor National Park (Žabljak)', 'Tivat (Porto Montenegro)', 'Herceg Novi', 'Ulcinj Long Beach', 'Lake Skadar'],
  'Morocco': ['Marrakech', 'Fes', 'Chefchaouen (Blue Pearl)', 'Sahara Desert (Merzouga & Erg Chebbi)', 'Essaouira (Coastal Fort)', 'Casablanca', 'Tangier', 'Ouarzazate & Ait Ben Haddou', 'Dades & Todra Gorges'],
  'Mozambique': ['Maputo', 'Vilankulo & Bazaruto Archipelago', 'Tofo Beach (Mantas & Whale Sharks)', 'Ilha de Moçambique', 'Ponta do Ouro', 'Gorongosa National Park', 'Inhambane', 'Quirimbas Archipelago'],
  'Myanmar': ['Yangon', 'Bagan (Pagoda Plains)', 'Inle Lake', 'Mandalay', 'Ngapali Beach', 'Hpa-An (Karst Caves)', 'Naypyidaw', 'Kalaw (Trekking Hills)'],
  'Namibia': ['Windhoek', 'Sossusvlei & Deadvlei (Red Dunes)', 'Swakopmund (Adventure Coast)', 'Etosha National Park', 'Walvis Bay (Flamingos & Seals)', 'Damaraland', 'Skeleton Coast', 'Fish River Canyon'],
  'Nepal': ['Kathmandu & Patan', 'Pokhara (Phewa Lake)', 'Everest Base Camp & Namche Bazaar', 'Annapurna Circuit (Ghorepani Poon Hill)', 'Chitwan National Park (Rhinos)', 'Lumbini (Birthplace of Buddha)', 'Bhaktapur', 'Nagarkot (Himalayan Sunrise)'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague & Scheveningen', 'Giethoorn (Village with No Roads)', 'Haarlem', 'Keukenhof (Lisse)', 'Zaanse Schans & Volendam', 'Maastricht'],
  'New Zealand': ['Queenstown', 'Auckland', 'Rotorua (Geothermal Wonder)', 'Milford Sound & Fiordland', 'Christchurch', 'Wellington', 'Hobbiton (Matamata)', 'Bay of Islands (Paihia)', 'Wanaka', 'Lake Tekapo'],
  'Nicaragua': ['Granada (Islets of Granada)', 'San Juan del Sur (Surf Beach)', 'Ometepe Island (Twin Volcanoes)', 'Leon (Cerro Negro Sandboarding)', 'Corn Islands (Big & Little Corn)', 'Matagalpa Coffee Highlands', 'San Carlos & Solentiname', 'Estelí'],
  'Norway': ['Oslo', 'Bergen (Bryggen Wharf)', 'Tromsø (Arctic Gateway)', 'Lofoten Islands (Reine & Hamnøy)', 'Geirangerfjord', 'Flåm & Nærøyfjord', 'Stavanger (Preikestolen Pulpit Rock)', 'Ålesund (Art Nouveau)', 'Svalbard (Polar Wilderness)'],
  'Oman': ['Muscat', 'Salalah (Khareef Green Season)', 'Nizwa (Historic Fort)', 'Wahiba Sands (Desert Glamping)', 'Sur & Ras Al Jinz Turtle Reserve', 'Jebel Akhdar (Green Mountain)', 'Jebel Shams (Grand Canyon of Arabia)', 'Musandam Fjords'],
  'Pakistan': ['Islamabad', 'Lahore (Mughal Heritage)', 'Hunza Valley (Karimabad & Passu)', 'Skardu & Shangrila Lake', 'Swat Valley (Switzerland of the East)', 'Karachi', 'Peshawar', 'Fairy Meadows & Nanga Parbat'],
  'Panama': ['Panama City & Casco Viejo', 'San Blas Islands (Guna Yala)', 'Bocas del Toro (Bastimentos)', 'Boquete (Cloud Forest & Coffee)', 'Santa Catalina (Coiba Island Diving)', 'El Valle de Anton', 'Playa Venao', 'Portobelo'],
  'Peru': ['Cusco (Inca Capital)', 'Machu Picchu & Aguas Calientes', 'Lima (Miraflores & Barranco)', 'Sacred Valley (Ollantaytambo & Pisac)', 'Arequipa (Colca Canyon)', 'Lake Titicaca (Uros Floating Islands)', 'Huacachina Desert Oasis', 'Iquitos (Amazon River)'],
  'Philippines': ['El Nido (Palawan Karst Lagoons)', 'Coron (Shipwrecks & Kayangan Lake)', 'Boracay (White Beach)', 'Cebu & Oslob (Whale Sharks)', 'Siargao (Cloud 9 Surf)', 'Bohol (Chocolate Hills)', 'Banaue & Batad (Rice Terraces)', 'Manila'],
  'Poland': ['Krakow', 'Warsaw', 'Gdansk (Baltic Coast)', 'Wroclaw (City of Bridges)', 'Zakopane (Tatra Mountains)', 'Toruń', 'Poznań', 'Malbork Castle Region'],
  'Portugal': ['Lisbon (Alfama & Belém)', 'Porto (Douro River)', 'Algarve (Lagos, Albufeira & Faro)', 'Sintra (Pena Palace)', 'Madeira Island (Funchal & Levadas)', 'Azores (São Miguel Crater Lakes)', 'Cascais', 'Coimbra', 'Évora'],
  'Qatar': ['Doha (Corniche & West Bay)', 'Al Wakrah (Souq & Beach)', 'Lusail City (Marina Promenade)', 'Al Khor (Mangroves)', 'Khor Al Adaid (Inland Sea)', 'Zekreet (Film City & Desert Sculptures)', 'Mesaieed (Dune Bashing)', 'Al Zubarah UNESCO Fort'],
  'Romania': ['Bucharest', 'Brasov & Bran Castle (Dracula)', 'Sibiu', 'Cluj-Napoca (Transylvania)', 'Sighisoara (Medieval Citadel)', 'Sinaia (Peles Palace)', 'Timisoara', 'Maramures (Wooden Churches)', 'Danube Delta'],
  'Russia': ['Moscow (Red Square & Kremlin)', 'Saint Petersburg (Hermitage & Peterhof)', 'Kazan (Tatarstan)', 'Sochi (Black Sea & Ski)', 'Lake Baikal (Olkhon Island)', 'Vladivostok', 'Golden Ring (Suzdal & Vladimir)', 'Kamchatka Volcanoes'],
  'Rwanda': ['Kigali', 'Volcanoes National Park (Musanze Gorillas)', 'Lake Kivu (Gisenyi & Kibuye)', 'Nyungwe Forest (Canopy Walk)', 'Akagera National Park (Big Five)', 'Huye (National Museum)', 'Gishwati-Mukura', 'Rubavu'],
  'Saudi Arabia': ['Riyadh (Diriyah & Kingdom Centre)', 'Jeddah (Historic Al-Balad & Corniche)', 'AlUla (Hegra & Elephant Rock)', 'Medina', 'Abha & Asir Green Mountains', 'Taif (City of Roses)', 'Yanbu (Red Sea Diving)', 'NEOM & Red Sea Project'],
  'Seychelles': ['Mahe (Victoria & Beau Vallon)', 'Praslin (Anse Lazio & Vallée de Mai)', 'La Digue (Anse Source d\'Argent)', 'Silhouette Island', 'Curieuse Island (Giant Tortoises)', 'Fregate Island', 'Cousin Island Nature Reserve', 'Bird Island'],
  'Singapore': ['Marina Bay & Sands', 'Sentosa Island & Universal Studios', 'Chinatown & Little India', 'Orchard Road', 'Gardens by the Bay', 'Jewel Changi', 'Clarke Quay', 'Kampong Glam (Haji Lane)'],
  'South Africa': ['Cape Town (Table Mountain & Camps Bay)', 'Johannesburg & Soweto', 'Kruger National Park (Safari)', 'Garden Route (Knysna & Plettenberg)', 'Durban & Umhlanga', 'Stellenbosch & Franschhoek Winelands', 'Drakensberg Mountains', 'Hermanus (Whale Watching)'],
  'South Korea': ['Seoul (Hongdae, Gangnam & Myeongdong)', 'Busan (Haeundae & Gamcheon)', 'Jeju Island (Hallasan & Waterfalls)', 'Gyeongju (Historic Kingdom)', 'Incheon', 'Jeonju Hanok Village', 'Gangneung (East Coast Beaches)', 'Sokcho (Seoraksan National Park)'],
  'Spain': ['Barcelona (Gaudí Architecture)', 'Madrid (Prado & Royal Palace)', 'Seville (Plaza de España & Flamenco)', 'Valencia (City of Arts and Sciences)', 'Ibiza & Formentera', 'Mallorca (Palma & Valldemossa)', 'Granada (Alhambra Palace)', 'San Sebastián (Basque Culinary)', 'Tenerife (Canary Islands)'],
  'Sri Lanka': ['Colombo', 'Kandy (Temple of the Tooth)', 'Galle (Dutch Colonial Fort)', 'Sigiriya (Lion Rock Fortress)', 'Ella (Nine Arch Bridge & Tea Hills)', 'Mirissa & Weligama (Whales & Surf)', 'Nuwara Eliya (Little England)', 'Yala National Park (Leopards)', 'Arugam Bay (World Surf)'],
  'Sweden': ['Stockholm (Gamla Stan & Djurgården)', 'Gothenburg (Canals & Seafood)', 'Malmö (Turning Torso)', 'Abisko & Kiruna (Lapland Auroras)', 'Uppsala', 'Visby (Gotland Medieval Walled Island)', 'Lund', 'Bohuslän Coast'],
  'Switzerland': ['Zermatt (Matterhorn)', 'Interlaken & Jungfraujoch', 'Zurich & Lake Zurich', 'Lucerne (Chapel Bridge)', 'Geneva', 'Lauterbrunnen (72 Waterfalls)', 'Grindelwald & First Cliff Walk', 'Montreux (Lake Geneva & Chillon Castle)', 'St. Moritz', 'Lugano (Ticino)'],
  'Taiwan': ['Taipei (Taipei 101 & Shilin)', 'Taroko Gorge (Hualien)', 'Jiufen & Shifen (Lantern Town)', 'Kaohsiung', 'Sun Moon Lake', 'Tainan (Ancient Capital & Food)', 'Taichung (Rainbow Village)', 'Kenting National Park'],
  'Tanzania': ['Serengeti National Park (Migration)', 'Zanzibar (Stone Town & Nungwi Beaches)', 'Mount Kilimanjaro (Moshi)', 'Ngorongoro Crater', 'Arusha', 'Lake Manyara (Tree Lions)', 'Tarangire National Park', 'Mafia Island (Whale Sharks)'],
  'Thailand': ['Bangkok (Grand Palace & Wat Arun)', 'Phuket (Patong & Kata Beach)', 'Chiang Mai (Old City & Temples)', 'Krabi & Railay Beach', 'Koh Samui & Koh Phangan (Full Moon)', 'Koh Tao (Scuba Diving)', 'Pattaya', 'Ayutthaya Ancient Ruins', 'Hua Hin', 'Chiang Rai (White Temple)'],
  'Tunisia': ['Tunis (Medina & Bardo)', 'Sidi Bou Said (Blue-and-White Clifftop)', 'Djerba Island', 'Carthage Ancient Ruins', 'El Jem (Roman Colosseum)', 'Hammamet (Beach Resort)', 'Tozeur (Sahara Oases & Star Wars)', 'Sousse'],
  'Turkey': ['Istanbul (Hagia Sophia & Bosphorus)', 'Cappadocia (Goreme Hot Air Balloons)', 'Antalya & Turquoise Coast', 'Pamukkale & Hierapolis Travertines', 'Bodrum & Aegean Riviera', 'Izmir & Ephesus Ancient City', 'Fethiye (Oludeniz Blue Lagoon)', 'Trabzon & Black Sea', 'Kas & Kalkan'],
  'Uganda': ['Kampala', 'Bwindi Impenetrable Forest (Gorillas)', 'Jinja (Source of the Nile River)', 'Queen Elizabeth National Park', 'Murchison Falls National Park', 'Lake Bunyonyi (Island Canoeing)', 'Entebbe (Lake Victoria)', 'Kibale National Park (Chimpanzees)'],
  'United Arab Emirates': ['Dubai (Burj Khalifa & Marina)', 'Abu Dhabi (Sheikh Zayed Mosque & Louvre)', 'Sharjah (Heritage & Arts)', 'Ras Al Khaimah (Jebel Jais Zipline)', 'Al Ain (Garden Oasis & Jebel Hafeet)', 'Fujairah (Snoopy Island Coral)', 'Ajman', 'Hatta (Mountain Kayaking)'],
  'United Kingdom': ['London', 'Edinburgh (Royal Mile & Castle)', 'Scottish Highlands & Isle of Skye', 'Manchester & Liverpool', 'Oxford & Cambridge', 'Bath (Roman Baths & Cotswolds)', 'Belfast & Giant\'s Causeway', 'York (Historic Minster)', 'Cardiff & Snowdonia (Wales)'],
  'United States': ['New York City (Manhattan & Brooklyn)', 'Los Angeles & Hollywood', 'San Francisco & Golden Gate', 'Las Vegas & Grand Canyon', 'Hawaii (Oahu, Maui & Big Island)', 'Miami & Florida Keys', 'Chicago', 'New Orleans', 'Orlando', 'Yellowstone & Grand Teton', 'Seattle'],
  'Uruguay': ['Montevideo (Rambla & Ciudad Vieja)', 'Punta del Este & Jose Ignacio', 'Colonia del Sacramento (UNESCO Old Town)', 'Punta del Diablo (Surf Fisher Village)', 'Cabo Polonio (Seals & Off-Grid)', 'Carmelo (Wine Region)', 'Piriápolis', 'Rocha Coast'],
  'Uzbekistan': ['Samarkand (Registan Square)', 'Bukhara (Po-i-Kalyan & Lyabi Khauz)', 'Khiva (Itchan Kala Walled Fortress)', 'Tashkent (Metro Stations & Chorsu)', 'Nukus & Aral Sea Ship Graveyard', 'Shakhrisabz', 'Fergana Valley', 'Zaamin National Park'],
  'Vatican City': [
    'St. Peter\'s Basilica & Dome Climb',
    'Sistine Chapel (Michelangelo Frescoes)',
    'Vatican Museums (Raphael Rooms)',
    'St. Peter\'s Colonnaded Square',
    'Vatican Gardens & Casina Pio IV',
    'Apostolic Palace Papal Apartments',
    'Vatican Necropolis & Saint Peter\'s Tomb',
    'St. Peter\'s Treasury & Sacristy',
    'Castel Sant\'Angelo Papal Corridor'
  ],
  'Vietnam': ['Hanoi (Old Quarter & French Quarter)', 'Ha Long Bay & Lan Ha Bay Cruise', 'Da Nang (Golden Bridge & Dragon Bridge)', 'Hoi An (Ancient Lantern Town)', 'Ho Chi Minh City (Saigon)', 'Ninh Binh (Tam Coc River Karsts)', 'Sapa (Terraced Mountain Valleys)', 'Phu Quoc Tropical Island', 'Phong Nha Caves', 'Hue Imperial Citadel'],
  'Zimbabwe': ['Victoria Falls Town (Mosi-oa-Tunya)', 'Harare', 'Bulawayo', 'Hwange National Park (Elephant Herds)', 'Matobo National Park (Rhinos & Balancing Rocks)', 'Mana Pools National Park (Zambezi Safaris)', 'Great Zimbabwe Ancient Stone Ruins', 'Lake Kariba']
};

// Read current countries
const countriesJsonPath = path.resolve(__dirname, 'backend/countries.json');
let countries = JSON.parse(fs.readFileSync(countriesJsonPath, 'utf8'));

// Update each country with enriched cities
countries = countries.map(country => {
  if (enrichedCities[country.name]) {
    country.topCities = enrichedCities[country.name];
  }
  return country;
});

// Sort strictly alphabetically
countries.sort((a, b) => a.name.localeCompare(b.name));

console.log('Enriched countries count:', countries.length);

// Check minimum number of cities
let minCities = 100;
let minCountry = '';
countries.forEach(c => {
  if (c.topCities.length < minCities) {
    minCities = c.topCities.length;
    minCountry = c.name;
  }
});
console.log(`Minimum cities in any country: ${minCities} (in ${minCountry})`);

// Write to backend/countries.json
fs.writeFileSync(countriesJsonPath, JSON.stringify(countries, null, 2), 'utf8');
console.log('Updated backend/countries.json');

// Write to frontend/src/countriesData.js
const fileHeader = `// ============================================================================
// TripMate Global Countries Database
// Stored strictly in ALPHABETICAL ORDER (A - Z) by country name
// Comprehensive global travel insights, rich top cities, costs in INR, and tags
// ============================================================================

export const WORLD_COUNTRIES = ${JSON.stringify(countries, null, 2)};

// Alphabetically sorted list of all country names
export const ALL_COUNTRY_NAMES = WORLD_COUNTRIES.map(c => c.name);

// Fast O(1) Lookup by Country Name (case-insensitive)
export const COUNTRY_LOOKUP = WORLD_COUNTRIES.reduce((acc, country) => {
  acc[country.name.toLowerCase()] = country;
  return acc;
}, {});

// Helper function to safely find country by name
export const getCountryByName = (name) => {
  if (!name) return null;
  return COUNTRY_LOOKUP[name.toLowerCase()] || null;
};
`;

const frontendPath = path.resolve(__dirname, 'frontend/src/countriesData.js');
fs.writeFileSync(frontendPath, fileHeader, 'utf8');
console.log('Updated frontend/src/countriesData.js');
