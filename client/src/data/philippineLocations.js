// Main geographical divisions
export const MAIN_DIVISIONS = ['Luzon', 'Visayas', 'Mindanao'];

// Complete list of regions
export const PHILIPPINES_REGIONS = {
  'Luzon': [
    {
      name: 'National Capital Region (NCR)',
      provinces: ['Metropolitan Manila']
    },
    {
      name: 'Cordillera Administrative Region (CAR)',
      provinces: ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province']
    },
    {
      name: 'Ilocos Region (Region I)',
      provinces: ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan']
    },
    {
      name: 'Cagayan Valley (Region II)',
      provinces: ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino']
    },
    {
      name: 'Central Luzon (Region III)',
      provinces: ['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales']
    },
    {
      name: 'CALABARZON (Region IV-A)',
      provinces: ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal']
    },
    {
      name: 'MIMAROPA (Region IV-B)',
      provinces: ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon']
    },
    {
      name: 'Bicol Region (Region V)',
      provinces: ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon']
    }
  ],
  'Visayas': [
    {
      name: 'Western Visayas (Region VI)',
      provinces: ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo', 'Negros Occidental']
    },
    {
      name: 'Central Visayas (Region VII)',
      provinces: ['Bohol', 'Cebu', 'Negros Oriental', 'Siquijor']
    },
    {
      name: 'Eastern Visayas (Region VIII)',
      provinces: ['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte']
    }
  ],
  'Mindanao': [
    {
      name: 'Zamboanga Peninsula (Region IX)',
      provinces: ['Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay']
    },
    {
      name: 'Northern Mindanao (Region X)',
      provinces: ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental']
    },
    {
      name: 'Davao Region (Region XI)',
      provinces: ['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Oriental', 'Davao Occidental']
    },
    {
      name: 'SOCCSKSARGEN (Region XII)',
      provinces: ['North Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat']
    },
    {
      name: 'Caraga (Region XIII)',
      provinces: ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur']
    },
    {
      name: 'Bangsamoro (BARMM)',
      provinces: ['Basilan', 'Lanao del Sur', 'Maguindanao', 'Sulu', 'Tawi-Tawi']
    }
  ]
};

// Cities and Municipalities by Province
export const CITIES_MUNICIPALITIES = {
  'Metropolitan Manila': [
    'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila',
    'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig',
    'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela'
  ],
  'Cebu': [
    'Cebu City', 'Lapu-Lapu City', 'Mandaue City', 'Bogo City', 'Carcar City',
    'Danao City', 'Naga City', 'Talisay City', 'Toledo City', 'Alcantara',
    'Alcoy', 'Alegria', 'Aloguinsan', 'Argao', 'Asturias', 'Badian',
    'Balamban', 'Bantayan', 'Barili', 'Boljoon', 'Borbon', 'Carmen',
    'Catmon', 'Compostela', 'Consolacion', 'Cordova', 'Daanbantayan',
    'Dalaguete', 'Dumanjug', 'Ginatilan', 'Liloan', 'Madridejos',
    'Malabuyoc', 'Medellin', 'Minglanilla', 'Moalboal', 'Oslob', 'Pilar',
    'Pinamungajan', 'Poro', 'Ronda', 'Samboan', 'San Fernando', 'San Francisco',
    'San Remigio', 'Santa Fe', 'Santander', 'Sibonga', 'Sogod', 'Tabogon',
    'Tabuelan', 'Tuburan', 'Tudela'
  ],
  'Abra': [
    'Bangued', 'Boliney', 'Bucay', 'Bucloc', 'Daguioman', 'Danglas',
    'Dolores', 'La Paz', 'Lacub', 'Lagangilang', 'Lagayan', 'Langiden',
    'Licuan-Baay', 'Luba', 'Malibcong', 'Manabo', 'Peñarrubia', 'Pidigan',
    'Pilar', 'Sallapadan', 'San Isidro', 'San Juan', 'San Quintin', 'Tayum',
    'Tineg', 'Tubo', 'Villaviciosa'
  ],
  'Apayao': [
    'Calanasan', 'Conner', 'Flora', 'Kabugao', 'Luna', 'Pudtol', 'Santa Marcela'
  ],
  'Benguet': [
    'Baguio City', 'Atok', 'Bakun', 'Bokod', 'Buguias', 'Itogon', 'Kabayan',
    'Kapangan', 'Kibungan', 'La Trinidad', 'Mankayan', 'Sablan', 'Tuba', 'Tublay'
  ],
  'Ifugao': [
    'Aguinaldo', 'Alfonso Lista', 'Asipulo', 'Banaue', 'Hingyon', 'Hungduan',
    'Kiangan', 'Lagawe', 'Lamut', 'Mayoyao', 'Tinoc'
  ],
  'Kalinga': [
    'Tabuk City', 'Balbalan', 'Lubuagan', 'Pasil', 'Pinukpuk', 'Rizal',
    'Tanudan', 'Tinglayan'
  ],
  'Mountain Province': [
    'Barlig', 'Bauko', 'Besao', 'Bontoc', 'Natonin', 'Paracelis', 'Sabangan',
    'Sadanga', 'Sagada', 'Tadian'
  ],
  'Ilocos Norte': [
    'Laoag City', 'Batac City', 'Adams', 'Bacarra', 'Badoc', 'Bangui', 'Banna',
    'Burgos', 'Carasi', 'Currimao', 'Dingras', 'Dumalneg', 'Marcos', 'Nueva Era',
    'Pagudpud', 'Paoay', 'Pasuquin', 'Piddig', 'Pinili', 'San Nicolas', 'Sarrat',
    'Solsona', 'Vintar'
  ],
  'Ilocos Sur': [
    'Vigan City', 'Candon City', 'Alilem', 'Banayoyo', 'Bantay', 'Burgos',
    'Cabugao', 'Caoayan', 'Cervantes', 'Galimuyod', 'Gregorio del Pilar',
    'Lidlidda', 'Magsingal', 'Nagbukel', 'Narvacan', 'Quirino', 'Salcedo',
    'San Emilio', 'San Esteban', 'San Ildefonso', 'San Juan', 'San Vicente',
    'Santa', 'Santa Catalina', 'Santa Cruz', 'Santa Lucia', 'Santa Maria',
    'Santiago', 'Santo Domingo', 'Sigay', 'Sinait', 'Sugpon', 'Suyo', 'Tagudin'
  ],
  'La Union': [
    'San Fernando City', 'Agoo', 'Aringay', 'Bacnotan', 'Bagulin', 'Balaoan',
    'Bangar', 'Bauang', 'Burgos', 'Caba', 'Luna', 'Naguilian', 'Pugo',
    'Rosario', 'San Gabriel', 'San Juan', 'Santo Tomas', 'Santol', 'Sudipen',
    'Tubao'
  ],
  'Pangasinan': [
    'Dagupan City', 'Alaminos City', 'San Carlos City', 'Urdaneta City',
    'Agno', 'Aguilar', 'Alcala', 'Anda', 'Asingan', 'Balungao', 'Bani',
    'Basista', 'Bautista', 'Bayambang', 'Binalonan', 'Binmaley', 'Bolinao',
    'Bugallon', 'Burgos', 'Calasiao', 'Dasol', 'Infanta', 'Labrador',
    'Laoac', 'Lingayen', 'Mabini', 'Malasiqui', 'Manaoag', 'Mangaldan',
    'Mangatarem', 'Mapandan', 'Natividad', 'Pozzorubio', 'Rosales', 'San Fabian',
    'San Jacinto', 'San Manuel', 'San Nicolas', 'San Quintin', 'Santa Barbara',
    'Santa Maria', 'Santo Tomas', 'Sison', 'Sual', 'Tayug', 'Umingan',
    'Urbiztondo', 'Villasis'
  ],
  'Batanes': [
    'Basco', 'Itbayat', 'Ivana', 'Mahatao', 'Sabtang', 'Uyugan'
  ],
  'Cagayan': [
    'Tuguegarao City', 'Abulug', 'Alcala', 'Allacapan', 'Amulung', 'Aparri',
    'Baggao', 'Ballesteros', 'Buguey', 'Calayan', 'Camalaniugan', 'Claveria',
    'Enrile', 'Gattaran', 'Gonzaga', 'Iguig', 'Lal-lo', 'Lasam', 'Pamplona',
    'Peñablanca', 'Piat', 'Rizal', 'Sanchez-Mira', 'Santa Ana', 'Santa Praxedes',
    'Santa Teresita', 'Santo Niño', 'Solana', 'Tuao'
  ],
  'Isabela': [
    'Ilagan City', 'Santiago City', 'Cauayan City', 'Alicia', 'Angadanan',
    'Aurora', 'Benito Soliven', 'Burgos', 'Cabagan', 'Cabatuan', 'Cordon',
    'Delfin Albano', 'Dinapigue', 'Divilacan', 'Echague', 'Gamu', 'Jones',
    'Luna', 'Maconacon', 'Mallig', 'Naguilian', 'Palanan', 'Quezon',
    'Quirino', 'Ramon', 'Reina Mercedes', 'Roxas', 'San Agustin', 'San Guillermo',
    'San Isidro', 'San Manuel', 'San Mariano', 'San Mateo', 'San Pablo',
    'Santa Maria', 'Santo Tomas', 'Tumauini'
  ],
  'Nueva Vizcaya': [
    'Bayombong', 'Aritao', 'Ambaguio', 'Alfonso Castañeda', 'Bagabag',
    'Bambang', 'Diadi', 'Dupax del Norte', 'Dupax del Sur', 'Kasibu',
    'Kayapa', 'Quezon', 'Santa Fe', 'Solano', 'Villaverde'
  ],
  'Quirino': [
    'Cabarroguis', 'Aglipay', 'Diffun', 'Maddela', 'Nagtipunan', 'Saguday'
  ],
  'Aurora': [
    'Baler', 'Casiguran', 'Dilasag', 'Dinalungan', 'Dingalan', 'Dipaculao',
    'Maria Aurora', 'San Luis'
  ],
  'Bataan': [
    'Balanga City', 'Abucay', 'Bagac', 'Dinalupihan', 'Hermosa', 'Limay',
    'Mariveles', 'Morong', 'Orani', 'Orion', 'Pilar', 'Samal'
  ],
  'Bulacan': [
    'Malolos City', 'Meycauayan City', 'San Jose del Monte City',
    'Angat', 'Balagtas', 'Baliuag', 'Bocaue', 'Bulakan', 'Bustos',
    'Calumpit', 'Doña Remedios Trinidad', 'Guiguinto', 'Hagonoy',
    'Marilao', 'Norzagaray', 'Obando', 'Pandi', 'Paombong', 'Plaridel',
    'Pulilan', 'San Ildefonso', 'San Miguel', 'San Rafael', 'Santa Maria'
  ],
  'Nueva Ecija': [
    'Cabanatuan City', 'Gapan City', 'Muñoz City', 'Palayan City',
    'San Jose City', 'Aliaga', 'Bongabon', 'Cabiao', 'Carranglan',
    'Cuyapo', 'Gabaldon', 'General Mamerto Natividad', 'General Tinio',
    'Guimba', 'Jaen', 'Laur', 'Licab', 'Llanera', 'Lupao', 'Nampicuan',
    'Pantabangan', 'Peñaranda', 'Quezon', 'Rizal', 'San Antonio',
    'San Isidro', 'San Leonardo', 'Santa Rosa', 'Santo Domingo',
    'Talavera', 'Talugtug', 'Zaragoza'
  ],
  'Pampanga': [
    'Angeles City', 'San Fernando City', 'Mabalacat City',
    'Apalit', 'Arayat', 'Bacolor', 'Candaba', 'Floridablanca',
    'Guagua', 'Lubao', 'Macabebe', 'Magalang', 'Masantol',
    'Mexico', 'Minalin', 'Porac', 'San Luis', 'San Simon',
    'Santa Ana', 'Santa Rita', 'Santo Tomas', 'Sasmuan'
  ],
  'Tarlac': [
    'Tarlac City', 'Anao', 'Bamban', 'Camiling', 'Capas',
    'Concepcion', 'Gerona', 'La Paz', 'Mayantoc', 'Moncada',
    'Paniqui', 'Pura', 'Ramos', 'San Clemente', 'San Jose',
    'San Manuel', 'Santa Ignacia', 'Victoria'
  ],
  'Zambales': [
    'Olongapo City', 'Botolan', 'Cabangan', 'Candelaria', 'Castillejos',
    'Iba', 'Masinloc', 'Palauig', 'San Antonio', 'San Felipe',
    'San Marcelino', 'San Narciso', 'Santa Cruz', 'Subic'
  ],
  'Batangas': [
    'Batangas City', 'Lipa City', 'Tanauan City', 'Santo Tomas City',
    'Agoncillo', 'Alitagtag', 'Balayan', 'Balete', 'Bauan', 'Calaca',
    'Calatagan', 'Cuenca', 'Ibaan', 'Laurel', 'Lemery', 'Lian',
    'Lobo', 'Mabini', 'Malvar', 'Mataas na Kahoy', 'Nasugbu', 'Padre Garcia',
    'Rosario', 'San Jose', 'San Juan', 'San Luis', 'San Nicolas', 'San Pascual',
    'Santa Teresita', 'Taal', 'Talisay', 'Taysan', 'Tingloy', 'Tuy'
  ],
  'Cavite': [
    'Bacoor City', 'Cavite City', 'Dasmariñas City', 'General Trias City',
    'Imus City', 'Tagaytay City', 'Trece Martires City',
    'Alfonso', 'Amadeo', 'Carmona', 'General Mariano Alvarez', 'Indang',
    'Kawit', 'Magallanes', 'Maragondon', 'Mendez', 'Naic', 'Noveleta',
    'Rosario', 'Silang', 'Tanza', 'Ternate'
  ],
  'Laguna': [
    'Biñan City', 'Cabuyao City', 'Calamba City', 'San Pablo City',
    'Santa Rosa City', 'San Pedro City',
    'Alaminos', 'Bay', 'Calauan', 'Cavinti', 'Famy', 'Kalayaan', 'Liliw',
    'Los Baños', 'Luisiana', 'Lumban', 'Mabitac', 'Magdalena', 'Majayjay',
    'Nagcarlan', 'Paete', 'Pagsanjan', 'Pakil', 'Pangil', 'Pila', 'Rizal',
    'Santa Cruz', 'Santa Maria', 'Siniloan', 'Victoria'
  ],
  'Quezon': [
    'Lucena City', 'Tayabas City',
    'Agdangan', 'Alabat', 'Atimonan', 'Buenavista', 'Burdeos', 'Calauag',
    'Candelaria', 'Catanauan', 'Dolores', 'General Luna', 'General Nakar',
    'Guinayangan', 'Gumaca', 'Infanta', 'Jomalig', 'Lopez', 'Lucban',
    'Macalelon', 'Mauban', 'Mulanay', 'Padre Burgos', 'Pagbilao',
    'Panukulan', 'Patnanungan', 'Perez', 'Pitogo', 'Plaridel', 'Polillo',
    'Quezon', 'Real', 'Sampaloc', 'San Andres', 'San Antonio', 'San Francisco',
    'San Narciso', 'Sariaya', 'Tagkawayan', 'Tiaong', 'Unisan'
  ],
  'Rizal': [
    'Antipolo City', 'Cainta', 'Angono', 'Baras', 'Binangonan', 'Cardona',
    'Jala-Jala', 'Morong', 'Pililla', 'Rodriguez', 'San Mateo', 'Tanay',
    'Taytay', 'Teresa'
  ],
  'Marinduque': [
    'Boac', 'Buenavista', 'Gasan', 'Mogpog', 'Santa Cruz', 'Torrijos'
  ],
  'Occidental Mindoro': [
    'Mamburao', 'Abra de Ilog', 'Calintaan', 'Looc', 'Lubang', 'Magsaysay',
    'Paluan', 'Rizal', 'Sablayan', 'San Jose', 'Santa Cruz'
  ],
  'Oriental Mindoro': [
    'Calapan City', 'Baco', 'Bansud', 'Bongabong', 'Bulalacao', 'Gloria',
    'Mansalay', 'Naujan', 'Pinamalayan', 'Pola', 'Puerto Galera', 'Roxas',
    'San Teodoro', 'Socorro', 'Victoria'
  ],
  'Palawan': [
    'Puerto Princesa City', 'Aborlan', 'Agutaya', 'Araceli', 'Balabac',
    'Bataraza', 'Brooke\'s Point', 'Busuanga', 'Cagayancillo', 'Coron',
    'Culion', 'Cuyo', 'Dumaran', 'El Nido', 'Kalayaan', 'Linapacan',
    'Magsaysay', 'Narra', 'Quezon', 'Rizal', 'Roxas', 'San Vicente',
    'Sofronio Española', 'Taytay'
  ],
  'Romblon': [
    'Romblon', 'Alcantara', 'Banton', 'Cajidiocan', 'Calatrava', 'Concepcion',
    'Corcuera', 'Ferrol', 'Looc', 'Magdiwang', 'Odiongan', 'San Agustin',
    'San Andres', 'San Fernando', 'San Jose', 'Santa Fe', 'Santa Maria'
  ],
  'Albay': [
    'Legazpi City', 'Ligao City', 'Tabaco City',
    'Bacacay', 'Camalig', 'Daraga', 'Guinobatan', 'Jovellar', 'Libon',
    'Malilipot', 'Malinao', 'Manito', 'Oas', 'Pio Duran', 'Polangui',
    'Rapu-Rapu', 'Santo Domingo', 'Tiwi'
  ],
  'Camarines Norte': [
    'Daet', 'Basud', 'Capalonga', 'Jose Panganiban', 'Labo', 'Mercedes',
    'Paracale', 'San Lorenzo Ruiz', 'San Vicente', 'Santa Elena', 'Talisay',
    'Vinzons'
  ],
  'Camarines Sur': [
    'Naga City', 'Iriga City',
    'Baao', 'Balatan', 'Bato', 'Bombon', 'Buhi', 'Bula', 'Cabusao',
    'Calabanga', 'Camaligan', 'Canaman', 'Caramoan', 'Del Gallego',
    'Gainza', 'Garchitorena', 'Goa', 'Lagonoy', 'Libmanan', 'Lupi',
    'Magarao', 'Milaor', 'Minalabac', 'Nabua', 'Ocampo', 'Pamplona',
    'Pasacao', 'Pili', 'Presentacion', 'Ragay', 'Sagñay', 'San Fernando',
    'San Jose', 'Sipocot', 'Siruma', 'Tigaon', 'Tinambac'
  ],
  'Catanduanes': [
    'Virac', 'Bagamanoc', 'Baras', 'Bato', 'Caramoran', 'Gigmoto',
    'Pandan', 'Panganiban', 'San Andres', 'San Miguel', 'Viga'
  ],
  'Masbate': [
    'Masbate City', 'Aroroy', 'Baleno', 'Balud', 'Batuan', 'Cataingan',
    'Cawayan', 'Claveria', 'Dimasalang', 'Esperanza', 'Mandaon', 'Milagros',
    'Mobo', 'Monreal', 'Palanas', 'Pio V. Corpuz', 'Placer', 'San Fernando',
    'San Jacinto', 'San Pascual', 'Uson'
  ],
  'Sorsogon': [
    'Sorsogon City', 'Barcelona', 'Bulan', 'Bulusan', 'Casiguran', 'Castilla',
    'Donsol', 'Gubat', 'Irosin', 'Juban', 'Magallanes', 'Matnog',
    'Pilar', 'Prieto Diaz', 'Santa Magdalena'
  ],
  'Aklan': [
    'Kalibo', 'Altavas', 'Balete', 'Banga', 'Batan', 'Buruanga',
    'Ibajay', 'Lezo', 'Libacao', 'Madalag', 'Makato', 'Malay',
    'Malinao', 'Nabas', 'New Washington', 'Numancia', 'Tangalan'
  ],
  'Antique': [
    'San Jose de Buenavista', 'Anini-y', 'Barbaza', 'Belison', 'Bugasong',
    'Caluya', 'Culasi', 'Hamtic', 'Laua-an', 'Libertad', 'Pandan',
    'Patnongon', 'Sebaste', 'Sibalom', 'Tibiao', 'Tobias Fornier', 'Valderrama'
  ],
  'Capiz': [
    'Roxas City', 'Cuartero', 'Dao', 'Dumalag', 'Dumarao', 'Ivisan',
    'Jamindan', 'Ma-ayon', 'Mambusao', 'Panay', 'Panitan', 'Pilar',
    'Pontevedra', 'President Roxas', 'Sapian', 'Sigma', 'Tapaz'
  ],
  'Guimaras': [
    'Jordan', 'Buenavista', 'Nueva Valencia', 'San Lorenzo', 'Sibunag'
  ],
  'Iloilo': [
    'Iloilo City', 'Passi City',
    'Ajuy', 'Alimodian', 'Anilao', 'Badiangan', 'Balasan', 'Banate',
    'Barotac Nuevo', 'Barotac Viejo', 'Batad', 'Bingawan', 'Cabatuan',
    'Calinog', 'Carles', 'Concepcion', 'Dingle', 'Dueñas', 'Dumangas',
    'Estancia', 'Guimbal', 'Igbaras', 'Janiuay', 'Lambunao', 'Leganes',
    'Lemery', 'Leon', 'Maasin', 'Miagao', 'Mina', 'New Lucena', 'Oton',
    'Pavia', 'Pototan', 'San Dionisio', 'San Enrique', 'San Joaquin',
    'San Miguel', 'San Rafael', 'Santa Barbara', 'Sara', 'Tigbauan',
    'Tubungan', 'Zarraga'
  ],
  'Negros Occidental': [
    'Bacolod City', 'Bago City', 'Cadiz City', 'Escalante City',
    'Himamaylan City', 'Kabankalan City', 'La Carlota City', 'Sagay City',
    'San Carlos City', 'Silay City', 'Sipalay City', 'Talisay City',
    'Victorias City',
    'Binalbagan', 'Calatrava', 'Candoni', 'Cauayan', 'Enrique B. Magalona',
    'Hinigaran', 'Hinoba-an', 'Ilog', 'Isabela', 'La Castellana', 'Manapla',
    'Moises Padilla', 'Murcia', 'Pontevedra', 'Pulupandan', 'Salvador Benedicto',
    'San Enrique', 'Toboso', 'Valladolid'
  ],
  'Bohol': [
    'Tagbilaran City', 'Alburquerque', 'Alicia', 'Anda', 'Antequera',
    'Baclayon', 'Balilihan', 'Batuan', 'Bien Unido', 'Bilar', 'Buenavista',
    'Calape', 'Candijay', 'Carmen', 'Catigbian', 'Clarin', 'Corella',
    'Cortes', 'Dagohoy', 'Danao', 'Dauis', 'Dimiao', 'Duero', 'Garcia Hernandez',
    'Getafe', 'Guindulman', 'Inabanga', 'Jagna', 'Lila', 'Loay', 'Loboc',
    'Loon', 'Mabini', 'Maribojoc', 'Panglao', 'Pilar', 'President Carlos P. Garcia',
    'Sagbayan', 'San Isidro', 'San Miguel', 'Sevilla', 'Sierra Bullones',
    'Sikatuna', 'Talibon', 'Trinidad', 'Tubigon', 'Ubay', 'Valencia'
  ],
  'Negros Oriental': [
    'Dumaguete City', 'Bais City', 'Bayawan City', 'Canlaon City',
    'Guihulngan City', 'Tanjay City',
    'Amlan', 'Ayungon', 'Bacong', 'Basay', 'Bindoy', 'Dauin', 'Jimalalud',
    'La Libertad', 'Mabinay', 'Manjuyod', 'Pamplona', 'San Jose',
    'Santa Catalina', 'Siaton', 'Sibulan', 'Tayasan', 'Valencia',
    'Vallehermoso', 'Zamboanguita'
  ],
  'Siquijor': [
    'Siquijor', 'Enrique Villanueva', 'Larena', 'Lazi', 'Maria', 'San Juan'
  ],
  'Biliran': [
    'Naval', 'Almeria', 'Biliran', 'Cabucgayan', 'Caibiran', 'Culaba',
    'Kawayan', 'Maripipi'
  ],
  'Eastern Samar': [
    'Borongan City', 'Arteche', 'Balangiga', 'Balangkayan', 'Can-avid',
    'Dolores', 'General MacArthur', 'Giporlos', 'Guiuan', 'Hernani',
    'Jipapad', 'Lawaan', 'Llorente', 'Maslog', 'Maydolong', 'Mercedes',
    'Oras', 'Quinapondan', 'Salcedo', 'San Julian', 'San Policarpo',
    'Sulat', 'Taft'
  ],
  'Leyte': [
    'Tacloban City', 'Ormoc City', 'Baybay City',
    'Abuyog', 'Alangalang', 'Albuera', 'Babatngon', 'Barugo', 'Bato',
    'Burauen', 'Calubian', 'Capoocan', 'Carigara', 'Dagami', 'Dulag',
    'Hilongos', 'Hindang', 'Inopacan', 'Isabel', 'Jaro', 'Javier',
    'Julita', 'Kananga', 'La Paz', 'Leyte', 'MacArthur', 'Mahaplag',
    'Matag-ob', 'Matalom', 'Mayorga', 'Merida', 'Palo', 'Palompon',
    'Pastrana', 'San Isidro', 'San Miguel', 'Santa Fe', 'Tabango',
    'Tabontabon', 'Tanauan', 'Tolosa', 'Tunga', 'Villaba'
  ],
  'Northern Samar': [
    'Catarman', 'Allen', 'Biri', 'Bobon', 'Capul', 'Catubig',
    'Gamay', 'Laoang', 'Lapinig', 'Las Navas', 'Lavezares',
    'Lope de Vega', 'Mapanas', 'Mondragon', 'Palapag', 'Pambujan',
    'Rosario', 'San Antonio', 'San Isidro', 'San Jose', 'San Roque',
    'San Vicente', 'Silvino Lobos', 'Victoria'
  ],
  'Samar': [
    'Catbalogan City', 'Calbayog City',
    'Almagro', 'Basey', 'Calbiga', 'Daram', 'Gandara', 'Hinabangan',
    'Jiabong', 'Marabut', 'Matuguinao', 'Motiong', 'Pagsanghan',
    'Paranas', 'Pinabacdao', 'San Jorge', 'San Jose de Buan',
    'San Sebastian', 'Santa Margarita', 'Santa Rita', 'Santo Niño',
    'Tagapul-an', 'Talalora', 'Tarangnan', 'Villareal', 'Zumarraga'
  ],
  'Southern Leyte': [
    'Maasin City', 'Anahawan', 'Bontoc', 'Hinunangan', 'Hinundayan',
    'Libagon', 'Liloan', 'Limasawa', 'Macrohon', 'Malitbog', 'Padre Burgos',
    'Pintuyan', 'Saint Bernard', 'San Francisco', 'San Juan', 'San Ricardo',
    'Silago', 'Sogod', 'Tomas Oppus'
  ],
  'Zamboanga del Norte': [
    'Dipolog City', 'Dapitan City',
    'Bacungan', 'Baliguian', 'Godod', 'Gutalac', 'Jose Dalman', 'Kalawit',
    'Katipunan', 'La Libertad', 'Labason', 'Leon B. Postigo', 'Liloy',
    'Manukan', 'Mutia', 'Piñan', 'Polanco', 'President Manuel A. Roxas',
    'Rizal', 'Salug', 'Sergio Osmeña Sr.', 'Siayan', 'Sibuco', 'Sibutad',
    'Sindangan', 'Siocon', 'Sirawai', 'Tampilisan'
  ],
  'Zamboanga del Sur': [
    'Pagadian City', 'Zamboanga City',
    'Aurora', 'Bayog', 'Dimataling', 'Dinas', 'Dumalinao', 'Dumingag',
    'Guipos', 'Josefina', 'Kumalarang', 'Labangan', 'Lakewood', 'Lapuyan',
    'Mahayag', 'Margosatubig', 'Midsalip', 'Molave', 'Pitogo', 'Ramon Magsaysay',
    'San Miguel', 'San Pablo', 'Sominot', 'Tabina', 'Tambulig', 'Tigbao',
    'Tukuran', 'Vincenzo A. Sagun'
  ],
  'Zamboanga Sibugay': [
    'Ipil', 'Alicia', 'Buug', 'Diplahan', 'Imelda', 'Kabasalan',
    'Mabuhay', 'Malangas', 'Naga', 'Olutanga', 'Payao', 'Roseller Lim',
    'Siay', 'Talusan', 'Titay', 'Tungawan'
  ],
  'Bukidnon': [
    'Malaybalay City', 'Valencia City',
    'Baungon', 'Cabanglasan', 'Damulog', 'Dangcagan', 'Don Carlos',
    'Impasugong', 'Kadingilan', 'Kalilangan', 'Kibawe', 'Kitaotao',
    'Lantapan', 'Libona', 'Malitbog', 'Manolo Fortich', 'Maramag',
    'Pangantucan', 'Quezon', 'San Fernando', 'Sumilao', 'Talakag'
  ],
  'Camiguin': [
    'Mambajao', 'Catarman', 'Guinsiliban', 'Mahinog', 'Sagay'
  ],
  'Lanao del Norte': [
    'Iligan City', 'Bacolod', 'Baloi', 'Baroy', 'Kapatagan', 'Kauswagan',
    'Kolambugan', 'Lala', 'Linamon', 'Magsaysay', 'Maigo', 'Matungao',
    'Munai', 'Nunungan', 'Pantao Ragat', 'Pantar', 'Poona Piagapo',
    'Salvador', 'Sapad', 'Sultan Naga Dimaporo', 'Tagoloan', 'Tangcal',
    'Tubod'
  ],
  'Misamis Occidental': [
    'Oroquieta City', 'Ozamiz City', 'Tangub City',
    'Aloran', 'Baliangao', 'Bonifacio', 'Calamba', 'Clarin', 'Concepcion',
    'Don Victoriano Chiongbian', 'Jimenez', 'Lopez Jaena', 'Panaon',
    'Plaridel', 'Sapang Dalaga', 'Sinacaban', 'Tudela'
  ],
  'Misamis Oriental': [
    'Cagayan de Oro City', 'El Salvador City', 'Gingoog City',
    'Alubijid', 'Balingasag', 'Balingoan', 'Binuangan', 'Claveria',
    'Gitagum', 'Initao', 'Jasaan', 'Kinoguitan', 'Lagonglong', 'Laguindingan',
    'Libertad', 'Lugait', 'Magsaysay', 'Manticao', 'Medina', 'Naawan',
    'Opol', 'Salay', 'Sugbongcogon', 'Tagoloan', 'Talisayan', 'Villanueva'
  ],
  'Davao de Oro': [
    'Nabunturan', 'Compostela', 'Laak', 'Mabini', 'Maco',
    'Maragusan', 'Mawab', 'Monkayo', 'Montevista', 'New Bataan',
    'Pantukan'
  ],
  'Davao del Norte': [
    'Tagum City', 'Panabo City', 'Island Garden City of Samal',
    'Asuncion', 'Braulio E. Dujali', 'Carmen', 'Kapalong', 'New Corella',
    'San Isidro', 'Santo Tomas', 'Talaingod'
  ],
  'Davao del Sur': [
    'Digos City', 'Davao City',
    'Bansalan', 'Hagonoy', 'Kiblawan', 'Magsaysay', 'Malalag',
    'Matanao', 'Padada', 'Santa Cruz', 'Sulop'
  ],
  'Davao Oriental': [
    'Mati City', 'Baganga', 'Banaybanay', 'Boston', 'Caraga', 'Cateel',
    'Governor Generoso', 'Lupon', 'Manay', 'San Isidro', 'Tarragona'
  ],
  'Davao Occidental': [
    'Malita', 'Don Marcelino', 'Jose Abad Santos', 'Santa Maria', 'Sarangani'
  ],
  'North Cotabato': [
    'Kidapawan City', 'Alamada', 'Aleosan', 'Antipas', 'Arakan',
    'Banisilan', 'Carmen', 'Kabacan', 'Libungan', 'M\'lang', 'Magpet',
    'Makilala', 'Matalam', 'Midsayap', 'Pigcawayan', 'Pikit', 'President Roxas',
    'Tulunan'
  ],
  'Sarangani': [
    'Alabel', 'Glan', 'Kiamba', 'Maasim', 'Maitum', 'Malapatan', 'Malungon'
  ],
  'South Cotabato': [
    'General Santos City', 'Koronadal City',
    'Banga', 'Lake Sebu', 'Norala', 'Polomolok', 'Santo Niño',
    'Surallah', 'T\'boli', 'Tampakan', 'Tantangan', 'Tupi'
  ],
  'Sultan Kudarat': [
    'Tacurong City', 'Bagumbayan', 'Columbio', 'Esperanza', 'Isulan',
    'Kalamansig', 'Lambayong', 'Lebak', 'Lutayan', 'Palimbang',
    'President Quirino', 'Senator Ninoy Aquino'
  ],
  'Agusan del Norte': [
    'Butuan City', 'Cabadbaran City',
    'Buenavista', 'Carmen', 'Jabonga', 'Kitcharao', 'Las Nieves',
    'Magallanes', 'Nasipit', 'Remedios T. Romualdez', 'Santiago', 'Tubay'
  ],
  'Agusan del Sur': [
    'Bayugan City', 'Bunawan', 'Esperanza', 'La Paz', 'Loreto',
    'Prosperidad', 'Rosario', 'San Francisco', 'San Luis', 'Santa Josefa',
    'Sibagat', 'Talacogon', 'Trento', 'Veruela'
  ],
  'Dinagat Islands': [
    'San Jose', 'Basilisa', 'Cagdianao', 'Dinagat', 'Libjo',
    'Loreto', 'Tubajon'
  ],
  'Surigao del Norte': [
    'Surigao City', 'Alegria', 'Bacuag', 'Burgos', 'Claver', 'Dapa',
    'Del Carmen', 'General Luna', 'Gigaquit', 'Mainit', 'Malimono',
    'Pilar', 'Placer', 'San Benito', 'San Francisco', 'San Isidro',
    'Santa Monica', 'Sison', 'Socorro', 'Tagana-an', 'Tubod'
  ],
  'Surigao del Sur': [
    'Tandag City', 'Bislig City',
    'Barobo', 'Bayabas', 'Cagwait', 'Cantilan', 'Carmen', 'Carrascal',
    'Cortes', 'Hinatuan', 'Lanuza', 'Lianga', 'Lingig', 'Madrid',
    'Marihatag', 'San Agustin', 'San Miguel', 'Tagbina', 'Tago'
  ],
  'Basilan': [
    'Lamitan City', 'Isabela City',
    'Akbar', 'Al-Barka', 'Hadji Mohammad Ajul', 'Hadji Muhtamad',
    'Lantawan', 'Maluso', 'Sumisip', 'Tipo-Tipo', 'Tuburan', 'Ungkaya Pukan'
  ],
  'Lanao del Sur': [
    'Marawi City', 'Bacolod-Kalawi', 'Balabagan', 'Balindong', 'Bayang',
    'Binidayan', 'Buadiposo-Buntong', 'Bubong', 'Butig', 'Calanogas',
    'Ditsaan-Ramain', 'Ganassi', 'Kapai', 'Kapatagan', 'Lumba-Bayabao',
    'Lumbaca-Unayan', 'Lumbatan', 'Lumbayanague', 'Madalum', 'Madamba',
    'Maguing', 'Malabang', 'Marantao', 'Marogong', 'Masiu', 'Mulondo',
    'Pagayawan', 'Piagapo', 'Picong', 'Poona Bayabao', 'Pualas',
    'Saguiaran', 'Sultan Dumalondong', 'Tagoloan II', 'Tamparan',
    'Taraka', 'Tubaran', 'Tugaya', 'Wao'
  ],
  'Maguindanao': [
    'Cotabato City', 'Ampatuan', 'Barira', 'Buldon', 'Buluan',
    'Datu Abdullah Sangki', 'Datu Anggal Midtimbang', 'Datu Blah T. Sinsuat',
    'Datu Hoffer Ampatuan', 'Datu Montawal', 'Datu Odin Sinsuat',
    'Datu Paglas', 'Datu Piang', 'Datu Salibo', 'Datu Saudi-Ampatuan',
    'Datu Unsay', 'General Salipada K. Pendatun', 'Guindulungan',
    'Kabuntalan', 'Mamasapano', 'Mangudadatu', 'Matanog', 'Northern Kabuntalan',
    'Pagalungan', 'Paglat', 'Pandag', 'Rajah Buayan', 'Shariff Aguak',
    'Shariff Saydona Mustapha', 'South Upi', 'Sultan Kudarat',
    'Sultan Mastura', 'Sultan sa Barongis', 'Talayan', 'Talitay', 'Upi'
  ],
  'Sulu': [
    'Jolo', 'Hadji Panglima Tahil', 'Indanan', 'Kalingalan Caluang',
    'Lugus', 'Luuk', 'Maimbung', 'Old Panamao', 'Omar', 'Pandami',
    'Panglima Estino', 'Pangutaran', 'Parang', 'Pata', 'Patikul',
    'Siasi', 'Talipao', 'Tapul', 'Tongkil'
  ],
  'Tawi-Tawi': [
    'Bongao', 'Languyan', 'Mapun', 'Panglima Sugala', 'Sapa-Sapa',
    'Sibutu', 'Simunul', 'Sitangkai', 'South Ubian', 'Tandubas',
    'Turtle Islands'
  ]
};

// Add this new object for barangays
export const BARANGAYS_BY_CITY = {
  // Metro Manila
  'Manila': {
    'Binondo': [
      'Barangay 287', 'Barangay 288', 'Barangay 289', 'Barangay 290',
      'Barangay 291', 'Barangay 292', 'Barangay 293', 'Barangay 294'
    ],
    'Quiapo': [
      'Barangay 306', 'Barangay 307', 'Barangay 308', 'Barangay 309',
      'Barangay 310', 'Barangay 311', 'Barangay 312', 'Barangay 313',
      'Barangay 314', 'Barangay 315', 'Barangay 316'
    ],
    'Sampaloc': [
      'Barangay 395', 'Barangay 396', 'Barangay 397', 'Barangay 398',
      'Barangay 399', 'Barangay 400', 'Barangay 401', 'Barangay 402'
    ]
  },

  'Quezon City': {
    'District I': [
      'Alicia', 'Bagong Pag-asa', 'Bahay Toro', 'Balingasa', 'Bungad',
      'Damar', 'Damayan', 'Del Monte', 'Katipunan', 'Mariblo',
      'Masambong', 'N.S. Amoranto', 'Nayong Kanluran', 'Paang Bundok',
      'Pag-ibig sa Nayon', 'Paltok', 'Paraiso', 'Phil-Am', 'Project 6',
      'Ramon Magsaysay', 'Salvacion', 'San Antonio', 'San Isidro Labrador',
      'San Jose', 'Santa Cruz', 'Santa Teresita', 'Santo Cristo',
      'Santo Domingo', 'Sienna', 'St. Peter the Apostle', 'Talayan',
      'Veterans Village', 'West Triangle', 'San Isidro Galas'
    ],
    'District II': [
      'Bagong Silangan', 'Batasan Hills', 'Commonwealth', 'Holy Spirit',
      'Payatas'
    ]
  },

  'Makati': {
    'District I': [
      'Poblacion', 'Valenzuela', 'Tejeros', 'Singkamas', 'Pio del Pilar',
      'Palanan', 'Olympia', 'Kasilawan', 'Carmona', 'Bel-Air', 'Santa Cruz'
    ],
    'District II': [
      'Pembo', 'Comembo', 'East Rembo', 'West Rembo', 'Rizal',
      'Pitogo', 'South Cembo', 'Cembo', 'Post Proper Northside',
      'Post Proper Southside', 'Guadalupe Nuevo', 'Guadalupe Viejo'
    ]
  },

  // Cebu City
  'Cebu City': {
    'North District': [
      'Adlaon', 'Agsungot', 'Apas', 'Bacayan', 'Banilad', 'Binaliw',
      'Budlaan', 'Busay', 'Cambinocot', 'Capitol Site', 'Carreta',
      'Central', 'Cogon Ramos', 'Day‑as', 'Ermita', 'Guba', 'Hipodromo',
      'Kalubihan', 'Kamagayan', 'Kamputhaw', 'Kasambagan', 'Lahug',
      'Lorega‑San Miguel', 'Lusaran', 'Luz', 'Mabini', 'Mabolo',
      'Malubog', 'Parian', 'Paril', 'Pit‑os', 'Pulangbato', 'Sambag I',
      'Sambag II', 'San Antonio', 'San Jose', 'San Roque', 'Santa Cruz',
      'Sirao', 'T. Padilla', 'Talamban', 'Taptap', 'Tejero', 'Tinago',
      'Zapatera'
    ],
    'South District': [
      'Basak Pardo', 'Basak San Nicolas', 'Bonbon', 'Buhisan', 'Bulacao',
      'Calamba', 'Cogon Pardo', 'Duljo Fatima', 'Guadalupe', 'Inayawan',
      'Kalunasan', 'Kinasang‑an Pardo', 'Labangon', 'Mambaling', 'Pahina Central',
      'Pahina San Nicolas', 'Pamutan', 'Pardo', 'Pasil', 'Poblacion Pardo',
      'Punta Princesa', 'Quiot', 'San Nicolas Proper', 'Sapangdaku',
      'Sawang Calero', 'Sinsin', 'Suba', 'Sudlon I', 'Sudlon II',
      'Tabunan', 'Tagbao', 'Tisa', 'Toong'
    ]
  },

  // Davao City
  'Davao City': {
    'District I': [
      '1-A', '2-A', '3-A', '4-A', '5-A', '6-A', '7-A', '8-A', '9-A', '10-A',
      'Poblacion District', 'Talomo District'
    ],
    'District II': [
      'Agdao', 'Buhangin', 'Sasa', 'Bunawan', 'Panacan', 'Tibungco'
    ],
    'District III': [
      'Toril', 'Tugbok', 'Calinan', 'Baguio', 'Marilog', 'Paquibato'
    ]
  },

  'Pasig': {
    'District I': [
      'Bagong Ilog', 'Bagong Katipunan', 'Bambang', 'Buting', 'Caniogan',
      'Kapasigan', 'Kapitolyo', 'Malinao', 'Oranbo', 'Palatiw', 'Pineda',
      'Sagad', 'San Antonio', 'San Joaquin', 'San Jose', 'San Nicolas',
      'Santa Cruz', 'Santa Rosa', 'Santo Tomas', 'Ugong'
    ],
    'District II': [
      'Dela Paz', 'Kalawaan', 'Manggahan', 'Maybunga', 'Pinagbuhatan',
      'Rosario', 'San Miguel', 'Santa Lucia', 'Santolan'
    ]
  },

  'Taguig': {
    'District I': [
      'Bagumbayan', 'Bambang', 'Calzada', 'Hagonoy', 'Ibayo-Tipas',
      'Ligid-Tipas', 'Lower Bicutan', 'New Lower Bicutan', 'Napindan',
      'Palingon', 'San Miguel', 'Santa Ana', 'Tuktukan', 'Ususan', 'Wawa'
    ],
    'District II': [
      'Central Bicutan', 'Central Signal Village', 'Fort Bonifacio',
      'Katuparan', 'North Daang Hari', 'North Signal Village',
      'Pinagsama', 'South Daang Hari', 'South Signal Village',
      'Tanyag', 'Upper Bicutan', 'Western Bicutan'
    ]
  },

  'Para��aque': {
    'District I': [
      'Baclaran', 'Don Galo', 'La Huerta', 'San Dionisio',
      'Santo Niño', 'Tambo'
    ],
    'District II': [
      'B.F. Homes', 'Don Bosco', 'Marcelo Green Village',
      'Merville', 'Moonwalk', 'San Antonio', 'San Isidro',
      'San Martin de Porres', 'Sun Valley'
    ]
  },

  'Baguio City': {
    'Central Business District': [
      'Abanao-Zandueta-Kayeng-Chugum', 'Burnham-Legarda',
      'City Camp Central', 'City Camp Proper', 'Harrison-Claudio Carantes',
      'Lower Magsaysay', 'Session Road Area', 'Upper Magsaysay'
    ],
    'Northern District': [
      'Ambiong', 'Aurora Hill Proper', 'Aurora Hill North Central',
      'Aurora Hill South Central', 'Campo Filipino', 'City Camp Northern',
      'Dizon Subdivision', 'Dominican Hill-Mirador', 'Engineers Hill',
      'Fairview Village', 'Ferdinand', 'Happy Hollow', 'Hillside',
      'Holyghost Extension', 'Holyghost Proper', 'Imelda Village',
      'Lualhati', 'Military Cut-off', 'New Lucban', 'San Roque Village',
      'Santo Tomas Proper', 'Scout Barrio'
    ],
    'Southern District': [
      'Cabinet Hill-Teachers Camp', 'Camp 7', 'Camp 8', 'Country Club Village',
      'Gabriela Silang', 'Greenwater Village', 'Loakan Proper',
      'Loakan-Apugan', 'Loakan-Liwanag', 'Lopez Jaena', 'Lower Rock Quarry',
      'Lucnab', 'Middle Rock Quarry', 'Modern Site East', 'Modern Site West',
      'Outlook Drive', 'Pinsao Pilot Project', 'Pinsao Proper',
      'Poliwes', 'Quezon Hill Proper', 'Quezon Hill Upper', 'Rock Quarry Middle',
      'Saint Joseph Village', 'Upper Rock Quarry'
    ]
  },

  'Iloilo City': {
    'City Proper': [
      'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5',
      'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10',
      'Barangay 11', 'Barangay 12', 'Barangay 13', 'Barangay 14', 'Barangay 15'
    ],
    'Jaro': [
      'Balantang', 'Benedicto', 'Buhang', 'Buntatala', 'Camalig',
      'Cubay', 'Desamparados', 'Dungon A', 'Dungon B', 'El 98',
      'Fajardo', 'Lopez Jaena', 'Luna', 'M.V. Hechanova', 'Quintin Salas',
      'San Roque', 'San Vicente', 'Seminario', 'Simon Ledesma', 'Tabuc Suba'
    ],
    'Molo': [
      'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5',
      'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10',
      'San Juan', 'San Pedro', 'South Baluarte', 'North Baluarte', 'North Fundidor'
    ]
  },

  'Cagayan de Oro': {
    'First District': [
      'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4',
      'Carmen', 'Consolacion', 'Gusa', 'Lapasan', 'Macabalan',
      'Macasandig', 'Nazareth', 'Patag', 'Puerto'
    ],
    'Second District': [
      'Agusan', 'Balulang', 'Bayabas', 'Bonbon', 'Bugo',
      'Bulua', 'Cugman', 'Iponan', 'Kauswagan', 'Lumbia',
      'Pagatpat', 'Pagalungan', 'Tablon', 'Tignapoloan'
    ]
  },

  'General Santos': {
    'District I': [
      'Apopong', 'Baluan', 'Batomelong', 'Buayan',
      'Calumpang', 'City Heights', 'Conel', 'Dadiangas East',
      'Dadiangas North', 'Dadiangas South', 'Dadiangas West',
      'Fatima', 'Katangawan', 'Labangal', 'Lagao'
    ],
    'District II': [
      'Ligaya', 'Mabuhay', 'San Isidro', 'San Jose',
      'Siguel', 'Sinawal', 'Tambler', 'Tinagacan',
      'Upper Labay'
    ]
  },

  'Bacolod City': {
    'North District': [
      'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5',
      'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10',
      'Barangay 11', 'Barangay 12', 'Barangay 13', 'Barangay 14', 'Barangay 15',
      'Barangay 16', 'Barangay 17', 'Barangay 18', 'Barangay 19', 'Barangay 20'
    ],
    'South District': [
      'Barangay 21', 'Barangay 22', 'Barangay 23', 'Barangay 24', 'Barangay 25',
      'Barangay 26', 'Barangay 27', 'Barangay 28', 'Barangay 29', 'Barangay 30',
      'Barangay 31', 'Barangay 32', 'Barangay 33', 'Barangay 34', 'Barangay 35',
      'Barangay 36', 'Barangay 37', 'Barangay 38', 'Barangay 39', 'Barangay 40',
      'Barangay 41'
    ]
  },

  'Zamboanga City': {
    'West District': [
      'Ayala', 'Baliwasan', 'Campo Islam', 'Canelar',
      'Divisoria', 'Labuan', 'Malagutay', 'Pasonanca',
      'Recodo', 'San Jose Cawa-Cawa', 'San Jose Gusu',
      'San Roque', 'Santa Barbara', 'Santa Maria',
      'Santo Niño', 'Tetuan', 'Tumaga', 'Zone I',
      'Zone II', 'Zone III', 'Zone IV'
    ],
    'East District': [
      'Arena Blanco', 'Boalan', 'Bunguiao', 'Cabaluay',
      'Cabatangan', 'Cacao', 'Calabasa', 'Calarian',
      'Culianan', 'Curuan', 'Dita', 'Guiwan',
      'Kasanyangan', 'La Paz', 'Lamisahan', 'Landang Gua',
      'Lanzones', 'Lapakan', 'Latuan', 'Licomo',
      'Limaong', 'Lubigan', 'Lumayang', 'Lumbangan',
      'Lunzuran', 'Maasin', 'Manicahan', 'Mariki',
      'Mercedes', 'Muti', 'Pangapuyan', 'Panubigan',
      'Putik', 'Quiniput', 'Rio Hondo', 'Salaan',
      'San Jose Gusu', 'Sangali', 'Sibulao',
      'Sinubong', 'Sinunuc', 'Tagasilay', 'Taguiti',
      'Talabaan', 'Talisayan', 'Talon-Talon',
      'Taluksangay', 'Tetuan', 'Tictapul', 'Tigbalabag',
      'Tolosa', 'Tugbungan', 'Tumalutab', 'Victoria',
      'Vitali', 'Zambowood'
    ]
  },

  'Caloocan': {
    'North Caloocan': [
      'Bagong Silang', 'Bagumbong', 'Camarin', 'Deparo', 'Kaybiga', 
      'Llano', 'Malaria', 'Pag-asa', 'Pangarap Village', 'Potrero',
      'Tala', 'Victory Heights'
    ],
    'South Caloocan': [
      'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5',
      'Grace Park East', 'Grace Park West', 'University Hills', 'Morning Breeze',
      'Sangandaan', 'Kaunlaran Village', 'Santa Quiteria'
    ]
  },

  'Las Piñas': {
    'District I': [
      'Almanza Uno', 'Almanza Dos', 'B.F. International Village',
      'Daniel Fajardo', 'Elias Aldana', 'Ilaya', 'Manuyo Uno',
      'Manuyo Dos', 'Pamplona Uno', 'Pamplona Dos', 'Pamplona Tres',
      'Pilar', 'Pulang Lupa Uno', 'Pulang Lupa Dos'
    ],
    'District II': [
      'CAA-BF International', 'Talon Uno', 'Talon Dos', 'Talon Tres',
      'Talon Kuatro', 'Talon Singko', 'Zapote'
    ]
  },

  'Marikina': {
    'District I': [
      'Barangka', 'Calumpang', 'Industrial Valley Complex',
      'Jesus De La Peña', 'Malanday', 'San Roque', 'Santa Elena',
      'Santo Niño', 'Tañong'
    ],
    'District II': [
      'Concepcion Uno', 'Concepcion Dos', 'Fortune', 'Marikina Heights',
      'Nangka', 'Parang', 'Tumana'
    ]
  },

  'Muntinlupa': {
    'District I': [
      'Bayanan', 'Putatan', 'Poblacion', 'Tunasan'
    ],
    'District II': [
      'Alabang', 'Ayala Alabang', 'Buli', 'Cupang', 'Sucat'
    ]
  },

  'Navotas': {
    'West District': [
      'North Bay Boulevard North', 'North Bay Boulevard South',
      'San Rafael Village', 'Sipac-Almacen', 'Tangos North',
      'Tangos South'
    ],
    'East District': [
      'Bagumbayan North', 'Bagumbayan South', 'Bangculasi',
      'Daanghari', 'Navotas East', 'Navotas West',
      'San Jose', 'San Roque'
    ]
  },

  'San Juan': {
    'District I': [
      'Addition Hills', 'Balong-Bato', 'Batis', 'Corazon de Jesus',
      'Ermitaño', 'Isabelita', 'Kabayanan', 'Maytunas',
      'Pasadena', 'Pedro Cruz', 'Progreso', 'Rivera',
      'Salapan', 'San Perfecto', 'Santa Lucia', 'West Crame'
    ],
    'District II': [
      'Greenhills', 'Little Baguio', 'Onse', 'Saint Joseph',
      'San Juan Heights', 'Tibagan'
    ]
  },

  'Valenzuela': {
    'District I': [
      'Arkong Bato', 'Balangkas', 'Bignay', 'Bisig', 'Coloong',
      'Dalandanan', 'Isla', 'Lawang Bato', 'Lingunan', 'Mabolo',
      'Malanday', 'Palasan', 'Pariancillo Villa', 'Pasolo',
      'Polo', 'Punturin', 'Rincon', 'Tagalag', 'Wawang Pulo'
    ],
    'District II': [
      'Bagbaguin', 'Bagong Pag-asa', 'Bitik', 'Canumay East',
      'Canumay West', 'Caruhatan', 'Daanghari', 'Gen. T. de Leon',
      'Karuhatan', 'Malinta', 'Mapulang Lupa', 'Marulas',
      'Maysan', 'Parada', 'Pag-asa', 'Paso de Blas',
      'Ugong', 'Viente Reales'
    ]
  },

  'Naga City': {
    'District I': [
      'Abella', 'Bagumbayan Norte', 'Bagumbayan Sur', 'Balatas',
      'Calauag', 'Cararayan', 'Carolina', 'Concepcion Grande',
      'Concepcion Pequeña', 'Dayangdang', 'Del Rosario',
      'Dinaga', 'Igualdad', 'Lerma', 'Liboton'
    ],
    'District II': [
      'Mabolo', 'Pacol', 'Panicuason', 'Penafrancia',
      'Sabang', 'San Felipe', 'San Francisco',
      'Santa Cruz', 'Tabuco', 'Tinago', 'Triangulo'
    ]
  },

  'Legazpi City': {
    'Albay District': [
      'Bagong Abre', 'Bagumbayan', 'Banquerohan', 'Bascaran',
      'Bigaa', 'Binanuahan East', 'Binanuahan West', 'Bogña',
      'Bonot', 'Buenavista', 'Buyuan', 'Cabagñan',
      'Cabagñan East', 'Cabagñan West', 'Cagbacong',
      'Cruzada', 'Em\'s Barrio', 'Em\'s Barrio East',
      'Em\'s Barrio South', 'Homapon'
    ],
    'Port District': [
      'Imperial Court', 'Kawit-East Washington Drive',
      'Lapu-lapu', 'Maoyod', 'Mariawa', 'Pigcale',
      'Sabang', 'San Joaquin', 'San Roque', 'Victory Village'
    ]
  },

  'Tacloban City': {
    'District I': [
      'Abucay', 'Anibong', 'Apitong', 'Barangay 1', 'Barangay 2',
      'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6',
      'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10'
    ],
    'District II': [
      'Bagacay', 'Barayong', 'Basper', 'Cabalawan', 'Caibaan',
      'Camansihay', 'Camansinay', 'Campetic', 'Diit', 'Fatima',
      'Libertad', 'Marasbaras', 'Nula-Tula', 'Palanog', 'Pampango',
      'San Jose', 'San Roque', 'Santa Elena', 'Santo Niño'
    ]
  },

  'Butuan City': {
    'District I': [
      'Agusan Pequeño', 'Ambago', 'Ampayon', 'Anticala', 'Antongalon',
      'Baan', 'Bancasi', 'Banza', 'Bayanihan', 'Buhangin', 'Doongan',
      'Golden Ribbon', 'Holy Redeemer', 'Humabon', 'Imadejas'
    ],
    'District II': [
      'Jose Rizal', 'Lapu-lapu', 'Lemon', 'Libertad', 'Limaha',
      'Lumbocan', 'Mahay', 'Mahogany', 'Maibu', 'Mandamo',
      'Masao', 'Maug', 'New Society Village', 'Obrero', 'Ong Yiu'
    ]
  },

  'Cotabato City': {
    'District I': [
      'Bagua', 'Kalanganan', 'Poblacion', 'Rosary Heights',
      'Tamontaka', 'Bagua Mother', 'Kalanganan Mother'
    ],
    'District II': [
      'Mother Bagua', 'Mother Kalanganan', 'Mother Tamontaka',
      'PC Hill', 'RH Mother', 'Rosary Heights Mother', 'Tamontaka Mother'
    ]
  },

  'Iligan City': {
    'District I': [
      'Acmac', 'Bagong Silang', 'Bunawan', 'Digkilaan', 'Hindang',
      'Hinaplanon', 'Kabacsanan', 'Kalilangan', 'Luinab', 'Mahayahay',
      'Mainit', 'Mandulog', 'Maria Cristina', 'Panoroganan', 'Poblacion'
    ],
    'District II': [
      'Puga-an', 'Rogongon', 'San Miguel', 'San Roque', 'Santiago',
      'Saray', 'Suarez', 'Tambacan', 'Tibanga', 'Tipanoy',
      'Tomas L. Cabili', 'Tubod', 'Upper Hinaplanon', 'Villa Verde'
    ]
  },

  'Marawi City': {
    'District I': [
      'Amito Marantao', 'Banggolo Poblacion', 'Bubong', 'Cadayonan',
      'Daguduban', 'Dansalan', 'Datu Saber', 'Gadongan', 'Kapantaran',
      'Lilod Madaya', 'Lumbaca Madaya', 'Marinaut', 'Matampay'
    ],
    'District II': [
      'Norhaya Village', 'Panggao Saduc', 'Raya Madaya', 'Raya Saduc',
      'Sabala Amanao', 'Sabala Amanao Proper', 'Saber', 'Saduc Proper',
      'Tuca', 'Tolali', 'Wawalayan Calocan', 'Wawalayan Marinaut'
    ]
  },

  'Pagadian City': {
    'District I': [
      'Balangasan', 'Balintawak', 'Baloyboan', 'Banale', 'Bogo',
      'Bomba', 'Bulatok', 'Bulawan', 'Dampalan', 'Danlugan',
      'Dao', 'Deborok', 'Depore', 'Dumagoc', 'Gatas'
    ],
    'District II': [
      'Gubac', 'Kagawasan', 'Kahayagan', 'Kalasan', 'Kawit',
      'Lala', 'Lenienza', 'Lizon Valley', 'Lower Sibatang',
      'Lumad', 'Macasing', 'Manga', 'Muricay', 'Napolan'
    ]
  },

  'Zamboanga City': {
    'West Coast': [
      'Ayala', 'Baliwasan', 'Boalan', 'Bolong', 'Busay',
      'Cabaluay', 'Cacao', 'Calabasa', 'Calarian', 'Campo Islam',
      'Capisan', 'Cawit', 'Culianan', 'Divisoria', 'Dulian',
      'Dulian-Bunguiao', 'Guisao', 'Guiwan', 'Kasanyangan',
      'La Paz', 'Labuan', 'Lamisahan', 'Landang Gua', 'Lanzones',
      'Lapakan', 'Latuan', 'Licomo', 'Limaong', 'Lubigan'
    ],
    'East Coast': [
      'Lumayang', 'Lumbangan', 'Lunzuran', 'Maasin', 'Malagutay',
      'Mampang', 'Manalipa', 'Mangusu', 'Manicahan', 'Mariki',
      'Mercedes', 'Muti', 'Pamucutan', 'Pangapuyan', 'Panubigan',
      'Pasilmanta', 'Pasonanca', 'Putik', 'Quiniput', 'Recodo',
      'Rio Hondo', 'Salaan', 'San Jose Cawa-cawa', 'San Jose Gusu',
      'San Ramon', 'San Roque', 'Sangali', 'Santa Barbara', 'Santa Catalina'
    ]
  },

  'Cotabato City': {
    'Mother Barangays': [
      'Bagua Mother', 'Kalanganan Mother', 'Poblacion Mother',
      'Rosary Heights Mother', 'Tamontaka Mother'
    ],
    'Regular Barangays': [
      'Bagua I', 'Bagua II', 'Bagua III', 'Kalanganan I',
      'Kalanganan II', 'Poblacion I', 'Poblacion II', 'Poblacion III',
      'Poblacion IV', 'Poblacion V', 'Poblacion VI', 'Poblacion VII',
      'Poblacion VIII', 'Poblacion IX', 'Rosary Heights I',
      'Rosary Heights II', 'Rosary Heights III', 'Rosary Heights IV',
      'Rosary Heights V', 'Rosary Heights VI', 'Rosary Heights VII',
      'Rosary Heights VIII', 'Rosary Heights IX', 'Rosary Heights X',
      'Rosary Heights XI', 'Rosary Heights XII', 'Rosary Heights XIII'
    ]
  },

  'Butuan City': {
    'Urban District': [
      'Ambago', 'Ampayon', 'Anticala', 'Antongalon', 'Agusan Pequeño',
      'Baan KM 3', 'Babag', 'Bancasi', 'Banza', 'Bayanihan',
      'Buhangin', 'Doongan', 'Golden Ribbon', 'Holy Redeemer',
      'Humabon', 'Imadejas', 'J.P. Rizal', 'Lapu-lapu', 'Lemon',
      'Libertad', 'Limaha', 'Mahay', 'Mahogany', 'Mandamo'
    ],
    'Rural District': [
      'Manila de Bugabus', 'Maon', 'Masao', 'Maug', 'Obrero',
      'Ong Yiu', 'Pagatpatan', 'Pangabugan', 'Pinamanculan',
      'Port Poyohon', 'Rajah Soliman', 'San Ignacio', 'San Mateo',
      'San Vicente', 'Santo Niño', 'Sikatuna', 'Silongan',
      'Sumilihon', 'Taguibo', 'Tandang Sora', 'Tiniwisan',
      'Villa Kananga', 'Washington'
    ]
  },

  'Bacolod City': {
    'North District': [
      'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4',
      'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8',
      'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12',
      'Barangay 13', 'Barangay 14', 'Barangay 15', 'Barangay 16',
      'Barangay 17', 'Barangay 18', 'Barangay 19', 'Barangay 20',
      'Barangay 21', 'Barangay 22', 'Barangay 23', 'Barangay 24'
    ],
    'South District': [
      'Alangilan', 'Alijis', 'Banago', 'Bata', 'Cabug',
      'Estefania', 'Felisa', 'Granada', 'Handumanan',
      'Mandalagan', 'Mansilingan', 'Montevista', 'Pahanocoy',
      'Punta Taytay', 'Singcang-Airport', 'Sum-ag', 'Taculing',
      'Tangub', 'Villamonte', 'Vista Alegre'
    ]
  },

  'Roxas City': {
    'District I': [
      'Barangay I (Poblacion)', 'Barangay II (Poblacion)',
      'Barangay III (Poblacion)', 'Barangay IV (Poblacion)',
      'Barangay V (Poblacion)', 'Barangay VI (Poblacion)',
      'Barangay VII (Poblacion)', 'Barangay VIII (Poblacion)',
      'Barangay IX (Poblacion)', 'Barangay X (Poblacion)',
      'Barangay XI (Poblacion)', 'Barangay XII (Poblacion)'
    ],
    'District II': [
      'Adlawan', 'Banica', 'Baybay', 'Bolo', 'Culasi',
      'Dayao', 'Dumolog', 'Inzo Arnaldo Village', 'Jumaguicjic',
      'Lanot', 'Lawaan', 'Libas', 'Loctugan', 'Lonoy',
      'Milibili', 'San Jose', 'Sibaguan', 'Tanza',
      'Tanque', 'Timpas'
    ]
  },

  'Ormoc City': {
    'District I': [
      'Alegria', 'Bagong Buhay', 'Batuan', 'Cabulihan',
      'Calingcaguing', 'Can-adieng', 'Can-untog', 'Catmon',
      'Cogon', 'Concepcion', 'Curva', 'Danhug', 'Dela Paz',
      'District 1', 'District 2', 'District 3', 'District 4',
      'District 5', 'District 6', 'District 7', 'District 8',
      'District 9', 'District 10', 'District 11', 'District 12'
    ],
    'District II': [
      'Doña Feliza', 'Donghol', 'Esperanza', 'Green Valley',
      'Hibunawon', 'Hugpa', 'Ipil', 'Labrador', 'Liberty',
      'Liloan', 'Linao', 'Luna', 'Mabato', 'Macabug',
      'Magaswi', 'Mahayag', 'Mahayahay', 'Margen', 'Mas-in',
      'Nasunogan', 'Naungan', 'Punta', 'Quezon, Jr.',
      'Rufina Tan', 'Sabang Bao', 'San Antonio', 'San Isidro',
      'San Jose', 'San Pablo', 'San Vicente', 'Santo Niño',
      'Sumangga', 'Valencia'
    ]
  },

  'Dumaguete City': {
    'District I': [
      'Bagacay', 'Bajumpandan', 'Balugo', 'Banilad', 'Bantayan',
      'Batinguel', 'Buñao', 'Cadawinonan', 'Calindagan', 'Cambagroy',
      'Camanjac', 'Candau-ay', 'Cantil-e'
    ],
    'District II': [
      'Daro', 'Junob', 'Looc', 'Mangnao', 'Motong', 'Piapi',
      'Poblacion 1', 'Poblacion 2', 'Poblacion 3', 'Poblacion 4',
      'Poblacion 5', 'Poblacion 6', 'Poblacion 7', 'Poblacion 8',
      'Pulantubig', 'Tabuc-tubig', 'Taclobo', 'Talay'
    ]
  },

  'Tagbilaran City': {
    'District I': [
      'Bool', 'Cogon', 'Dampas', 'Dao', 'Mansasa', 'Poblacion I',
      'Poblacion II', 'Poblacion III', 'San Isidro', 'Taloto',
      'Ubujan'
    ],
    'District II': [
      'Booy', 'Cabawan', 'Manga', 'Poblacion', 'Tiptip'
    ]
  },

  'Catbalogan City': {
    'District I': [
      'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4',
      'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8',
      'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12',
      'Barangay 13'
    ],
    'District II': [
      'Bunuanan', 'Cagutsan', 'Canlapwas', 'Guindapunan',
      'Guinsorongan', 'Iguid', 'Ibol', 'Lagundi', 'Libas',
      'Lobo', 'Mercedes', 'Maulong', 'Muñoz', 'Pangdan',
      'Payao', 'Pupua', 'San Andres', 'San Vicente'
    ]
  },

  'Laoag City': {
    'District I': [
      'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4',
      'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8',
      'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12'
    ],
    'District II': [
      'Araniw', 'Balatong', 'Balacad', 'Barit-Pandan',
      'Buttong', 'Cabungaan', 'Caaoacan', 'Calayab',
      'Camangaan', 'Cataban', 'Dibua', 'Gabu', 'La Paz',
      'Lagui-Sail', 'Nalbo', 'Nangalisan', 'Navotas',
      'Padsan', 'Pila', 'San Mateo', 'Santa Angela',
      'Santa Joaquina', 'Santa Rosa', 'Suyo', 'Talingaan',
      'Vira', 'Zamboanga'
    ]
  },

  'Vigan City': {
    'District I': [
      'Pagburnayan', 'Pagpartian', 'Paoa', 'Pantay Daya',
      'Pantay Fatima', 'Pantay Laud', 'Salindeg', 'San Julian Norte',
      'San Julian Sur', 'Tamag'
    ],
    'District II': [
      'Ayusan Norte', 'Ayusan Sur', 'Barangay I', 'Barangay II',
      'Barangay III', 'Barangay IV', 'Barangay V', 'Barangay VI',
      'Barangay VII', 'Barangay VIII', 'Barangay IX', 'Beddeng Daya',
      'Beddeng Laud', 'Bongtolan', 'Bulala', 'Cabaroan Daya',
      'Cabaroan Laud', 'Mindoro', 'Nagsangalan', 'Paratong',
      'Raois', 'Rivero', 'San Jose', 'San Pedro'
    ]
  },

  'Batangas City': {
    'Urban District': [
      'Alangilan', 'Balagtas', 'Balete', 'Banaba Center',
      'Banaba East', 'Banaba West', 'Barangay 1', 'Barangay 2',
      'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6',
      'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10',
      'Barangay 11', 'Barangay 12', 'Barangay 13', 'Barangay 14',
      'Barangay 15', 'Barangay 16', 'Barangay 17', 'Barangay 18',
      'Barangay 19', 'Barangay 20', 'Barangay 21', 'Barangay 22',
      'Barangay 23', 'Barangay 24'
    ],
    'Rural District': [
      'Bilogo', 'Bolbok', 'Conde Itaas', 'Conde Labac',
      'Cuta', 'Dalig', 'Dela Paz', 'Dela Paz Proper',
      'Dumantay', 'Dumuclay', 'Gulod Itaas', 'Gulod Labac',
      'Haligue Kanluran', 'Haligue Silangan', 'Kumintang Ibaba',
      'Kumintang Ilaya', 'Libjo', 'Maapaz', 'Malibayo',
      'Malitam', 'Maruclap', 'Pagkilatan', 'Paharang Kanluran',
      'Paharang Silangan', 'Pallocan Kanluran', 'Pallocan Silangan',
      'Pinamucan', 'Sampaga', 'San Agapito', 'San Agustin',
      'San Isidro', 'Santa Clara', 'Santa Rita Aplaya',
      'Santa Rita Karsada', 'Santo Domingo', 'Santo Niño',
      'Simlong', 'Sirang Lupa', 'Sorosoro Ibaba', 'Sorosoro Ilaya',
      'Tabangao Aplaya', 'Tabangao Dao', 'Talahib Pandayan',
      'Talahib Payapa', 'Tinga Itaas', 'Tinga Labac',
      'Tulo', 'Wawa'
    ]
  },

  'Mandaue City': {
    'North District': [
      'Alang-alang', 'Bakilid', 'Banilad', 'Basak', 'Cabancalan',
      'Canduman', 'Casili', 'Casuntingan', 'Centro', 'Cubacub',
      'Guizo', 'Ibabao-Estancia', 'Jagobiao', 'Labogon', 'Looc'
    ],
    'South District': [
      'Maguikay', 'Mantuyong', 'Opao', 'Pagsabungan', 'Subangdaku',
      'Tabok', 'Tawason', 'Tingub', 'Tipolo', 'Umapad'
    ]
  },

  'Lapu-Lapu City': {
    'District I': [
      'Agus', 'Babag', 'Bankal', 'Basak', 'Buaya',
      'Calawisan', 'Canjulao', 'Caw-oy', 'Gun-ob', 'Ibo',
      'Looc', 'Mactan', 'Maribago', 'Marigondon', 'Pajac',
      'Pajo', 'Poblacion', 'Punta Engaño', 'Pusok', 'Subabasbas'
    ],
    'District II': [
      'Baring', 'Caubian', 'Cawhagan', 'Marigondon', 'Pangan-an',
      'Sabang', 'Santa Rosa', 'Talima', 'Tingo', 'Tungasan'
    ]
  },

  'Talisay City, Cebu': {
    'North District': [
      'Biasong', 'Bulacao', 'Cansojong', 'Dumlog', 'Lagtang',
      'Lawaan I', 'Lawaan II', 'Lawaan III', 'Linao', 'Maghaway',
      'Mohon', 'Poblacion', 'Pooc', 'San Isidro', 'San Roque',
      'Tabunok', 'Tangke'
    ],
    'South District': [
      'Camp 4', 'Cadulawan', 'Candulawan', 'Jaclupan', 'Manipis',
      'Tapul', 'Campo 4'
    ]
  },

  'Tagum City': {
    'District I': [
      'Apokon', 'Bincungan', 'Busaon', 'Canocotan', 'La Filipina',
      'Liboganon', 'Madaum', 'Magdum', 'Magugpo East', 'Magugpo North',
      'Magugpo South', 'Magugpo West', 'Mankilam', 'New Balamban',
      'Nueva Fuerza', 'Pagsabangan', 'Pandapan', 'San Agustin',
      'San Isidro', 'San Miguel', 'Visayan Village'
    ],
    'District II': [
      'Cuambogan', 'Hijo', 'Maduao', 'Magugpo Poblacion',
      'San Jose', 'Tipaz'
    ]
  },

  'Panabo City': {
    'District I': [
      'A.O. Floirendo', 'Cagangohan', 'Dapco', 'Gredu',
      'J.P. Laurel', 'Katipunan', 'Kauswagan', 'Kiotoy',
      'Mabunao', 'Maduao', 'Malativas', 'Manay', 'New Malitbog',
      'New Pandan', 'New Visayas', 'Quezon', 'Salvacion',
      'San Francisco', 'San Nicolas', 'San Pedro', 'San Roque',
      'San Vicente', 'Santa Cruz', 'Santo Niño', 'Tagpore',
      'Tibungol', 'Upper Licanan'
    ],
    'District II': [
      'Buenavista', 'Consolacion', 'Datu Abdul', 'Kasilak',
      'Little Panay', 'Lower Panaga', 'Mabunao', 'Nanyo',
      'New Malaga', 'New Valencia', 'Panabo', 'Poblacion',
      'San Pedro', 'Southern Davao', 'Waterfall'
    ]
  },

  'Digos City': {
    'District I': [
      'Aplaya', 'Balabag', 'Binaton', 'Cogon', 'Colorado',
      'Dawis', 'Dulangan', 'Goma', 'Igpit', 'Mahayag',
      'Matti', 'Pandanon', 'San Jose', 'San Miguel', 'Sinawilan',
      'Soong', 'Tiguman', 'Zone I', 'Zone II', 'Zone III'
    ],
    'District II': [
      'Atty. Zafra', 'Badiang', 'Bangkas', 'Kapatagan', 'Lungag',
      'Ruparan', 'San Agustin', 'Tres de Mayo'
    ]
  },

  'Kidapawan City': {
    'District I': [
      'Amas', 'Amazion', 'Balabag', 'Balindog', 'Binoligan',
      'Gayola', 'Ginatilan', 'Ilomavis', 'Kalaisan', 'Lanao',
      'Linangkob', 'Macebolig', 'Malinan', 'Marbel', 'Mateo',
      'New Bohol', 'Nuangan', 'Paco', 'Patadon', 'Perez',
      'Poblacion', 'San Isidro', 'San Roque', 'Santo Niño',
      'Sibawan', 'Singao', 'Sudapin', 'Sumbac', 'Tapodoc'
    ],
    'District II': [
      'Bangkal', 'Birada', 'Junction', 'Katipunan', 'Magsaysay',
      'Manongol', 'New Cebu', 'Puas Inda', 'San Vicente'
    ]
  },

  'Koronadal City': {
    'District I': [
      'Assumption', 'Avancena', 'Caloocan', 'Concepcion',
      'General Paulino Santos', 'Mabini', 'Morales', 'Poblacion',
      'San Isidro', 'Santa Cruz', 'Santo Niño', 'Zone I',
      'Zone II', 'Zone III', 'Zone IV'
    ],
    'District II': [
      'Carpenter Hill', 'Esperanza', 'GPS', 'Magsaysay',
      'Namnama', 'New Pangasinan', 'Paraiso', 'Rotonda',
      'San Jose', 'Santa Rosa', 'Saravia', 'Zulueta'
    ]
  },

  'Angeles City': {
    'District I': [
      'Agapito del Rosario', 'Amsic', 'Bagong Bayan', 'Balibago',
      'Capaya', 'Claro M. Recto', 'Cutcut', 'Lourdes North West',
      'Lourdes Sur', 'Lourdes Sur East', 'Main Gate', 'Malabañas',
      'Margot', 'Mining', 'Pampang', 'Pulung Maragul', 'Pulungbulu',
      'Salapungan', 'San Jose', 'San Nicolas', 'Santa Teresita',
      'Santo Cristo', 'Santo Domingo', 'Santo Rosario', 'Tabun'
    ],
    'District II': [
      'Anunas', 'Cuayan', 'Ninoy Aquino', 'Pandan', 'Pulung Cacutud',
      'San Francisco', 'Santa Trinidad', 'Sapalibutad', 'Sapangbato',
      'Virgen Delos Remedios'
    ]
  },

  'Olongapo City': {
    'District I': [
      'Asinan', 'Banicain', 'East Bajac-bajac', 'East Tapinac',
      'Gordon Heights', 'Kalaklan', 'Mabayuan', 'New Cabalan',
      'New Ilalim', 'New Kababae', 'New Kalalake', 'Old Cabalan',
      'Pag-asa', 'Santa Rita'
    ],
    'District II': [
      'Barretto', 'West Bajac-bajac', 'West Tapinac', 'Barangay 21',
      'Barangay 185', 'Barangay 67', 'Barangay 93'
    ]
  },

  'Lucena City': {
    'District I': [
      'Ibabang Dupay', 'Ibabang Iyam', 'Ilayang Dupay', 'Ilayang Iyam',
      'Mayao Crossing', 'Mayao Kanluran', 'Mayao Parada', 'Mayao Silangan',
      'Ransohan', 'Salinas', 'Silangang Mayao', 'Talao-talao'
    ],
    'District II': [
      'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4',
      'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8',
      'Barangay 9', 'Barangay 10', 'Barangay 11', 'Gulang-gulang',
      'Market View', 'Cotta'
    ]
  },

  'San Pablo City': {
    'District I': [
      'San Roque I', 'San Roque II', 'San Roque III', 'San Roque IV',
      'San Rafael', 'San Cristobal', 'San Gabriel', 'San Gregorio',
      'San Lucas I', 'San Lucas II', 'San Miguel', 'Santa Maria Magdalena'
    ],
    'District II': [
      'Dolores', 'San Agustin', 'San Antonio I', 'San Antonio II',
      'San Francisco', 'San Isidro', 'San Jose', 'San Juan',
      'San Nicolas', 'San Pedro', 'Santa Ana', 'Santa Cruz',
      'Santa Filomena', 'Santa Monica', 'Santa Veronica', 'Santiago I',
      'Santiago II', 'Santo Angel', 'Santo Cristo', 'Santo Niño'
    ]
  },

  'Cabanatuan City': {
    'District I': [
      'Aduas Centro', 'Aduas Norte', 'Aduas Sur', 'Balite', 'Bangad',
      'Barrera', 'Bernardo', 'Bonifacio', 'Bitas', 'Buliran',
      'Camp Tinio', 'Caridad', 'Communal', 'Daang Sarile', 'Dicarma',
      'Fatima', 'General Luna', 'H. Concepcion', 'Ibarra', 'Isla',
      'Kalikid Norte', 'Kalikid Sur', 'Kapitan Pepe', 'Lagare',
      'Magsaysay Norte', 'Magsaysay Sur', 'Matadero'
    ],
    'District II': [
      'Mayapyap Norte', 'Mayapyap Sur', 'M.S. Garcia', 'Pagas',
      'Palagay', 'Panlapi', 'Pamaldan', 'Pangatian', 'Pula',
      'Rizdelis', 'San Isidro', 'San Josef Norte', 'San Josef Sur',
      'San Juan Accfa', 'San Roque Norte', 'San Roque Sur',
      'Santa Arcadia', 'Samon', 'Sangitan', 'Santo Niño',
      'Sumacab Este', 'Sumacab Norte', 'Sumacab Sur', 'Talipapa',
      'Valle Cruz', 'Vijandre', 'Zulueta'
    ]
  },

  'San Fernando City, Pampanga': {
    'District I': [
      'Santo Rosario', 'San Jose', 'Dolores', 'Lourdes', 'San Nicolas',
      'Santa Teresita', 'Santo Niño', 'San Juan', 'San Pedro Cutud',
      'San Agustin', 'Del Carmen', 'Santa Lucia', 'Juliana',
      'Maimpis', 'Telabastagan'
    ],
    'District II': [
      'Alasas', 'Baliti', 'Bulaon', 'Calulut', 'Del Pilar',
      'Del Rosario', 'Lara', 'Malino', 'Malpitic', 'Pandaras',
      'Panipuan', 'Pulung Bulu', 'Quebiawan', 'Saguin',
      'San Felipe', 'San Isidro', 'Santa Lucia'
    ]
  },

  'Malolos City': {
    'District I': [
      'Anilao', 'Atlag', 'Babatnin', 'Bagna', 'Balayong', 'Balite',
      'Bangkal', 'Barihan', 'Bulihan', 'Bungahan', 'Caingin',
      'Calero', 'Caliligawan', 'Canalate', 'Caniogan', 'Catmon',
      'Cofradia', 'Dakila', 'Guinhawa', 'Ligas', 'Look 1st',
      'Look 2nd', 'Longos', 'Lugam', 'Mabolo', 'Masile', 'Matimbo',
      'Mojon', 'Namayan', 'Niugan', 'Pamarawan', 'Panasahan',
      'Pinagbakahan', 'San Agustin', 'San Gabriel', 'San Juan',
      'San Pablo', 'San Vicente', 'Santiago', 'Santo Cristo',
      'Santo Niño', 'Santo Rosario', 'Santisima Trinidad',
      'Sumapang Bata', 'Sumapang Matanda', 'Taal', 'Tikay'
    ]
  },

  'Meycauayan City': {
    'District I': [
      'Bagbaguin', 'Bahay Pare', 'Bancal', 'Banga', 'Bayugo',
      'Caingin', 'Calvario', 'Camalig', 'Gasak', 'Hulo',
      'Iba', 'Langka', 'Lawa', 'Libtong', 'Liputan',
      'Longos', 'Malhacan', 'Pajo', 'Pandayan', 'Pantoc',
      'Perez', 'Poblacion', 'Saluysoy', 'Tugatog', 'Ubihan',
      'Zamora'
    ]
  },

  'San Jose del Monte City': {
    'District I': [
      'Bagong Buhay I', 'Bagong Buhay II', 'Bagong Buhay III',
      'Citrus', 'Ciudad Real', 'Fatima I', 'Fatima II', 'Fatima III',
      'Fatima IV', 'Fatima V', 'Francisco Homes-Mulawin', 'Francisco Homes-Narra',
      'Francisco Homes-Yakal', 'Gaya-Gaya', 'Graceville', 'Gumaoc Central',
      'Gumaoc East', 'Gumaoc West', 'Kaybanban', 'Kaypian', 'Lawang Pari',
      'Maharlika', 'Minuyan I', 'Minuyan II', 'Minuyan III', 'Minuyan IV',
      'Minuyan V', 'Minuyan Proper', 'Muzon', 'Paradise III', 'Poblacion I',
      'San Manuel', 'San Martin I', 'San Martin II', 'San Martin III',
      'San Martin IV', 'San Pedro', 'San Rafael I', 'San Rafael II',
      'San Rafael III', 'San Rafael IV', 'San Rafael V', 'Santa Cruz I',
      'Santa Cruz II', 'Santa Cruz III', 'Santa Cruz IV', 'Santa Cruz V',
      'Santo Cristo', 'Santo Niño I', 'Santo Niño II', 'Sapang Palay Proper',
      'St. Martin de Porres', 'Tungkong Mangga'
    ]
  },

  'Antipolo City': {
    'District I': [
      'Bagong Nayon', 'Beverly Hills', 'Calawis', 'Cupang',
      'Dalig', 'Dela Paz', 'Inarawan', 'Mambugan', 'Mayamot',
      'Muntingdilaw', 'San Isidro', 'San Jose', 'San Juan',
      'San Luis', 'San Roque'
    ],
    'District II': [
      'Bagong Nayon', 'Beverly Hills', 'Calawis', 'Cupang',
      'Dalig', 'Dela Paz', 'Inarawan', 'Mambugan', 'Mayamot',
      'Muntingdilaw', 'San Isidro', 'San Jose', 'San Juan',
      'San Luis', 'San Roque'
    ]
  },

  'Calamba City': {
    'District I': [
      'Bagong Kalsada', 'Banadero', 'Banlic', 'Barandal',
      'Batino', 'Burol', 'Camaligan', 'Halang', 'Kay-Anlog',
      'Laguerta', 'Lawa', 'Lingga', 'Looc', 'Mabato',
      'Majada Out', 'Makiling', 'Mapagong', 'Masili',
      'Mayapa', 'Milagrosa', 'Paciano Rizal', 'Palingon',
      'Palo-Alto', 'Pansol', 'Parian', 'Prinza', 'Punta',
      'Putho-Tuntungin', 'Real', 'Saimsim', 'Sampiruhan',
      'San Cristobal', 'San Jose', 'San Juan', 'Sirang Lupa',
      'Sucol', 'Turbina', 'Ulango', 'Uwisan'
    ]
  },

  'Santa Rosa City': {
    'District I': [
      'Aplaya', 'Balibago', 'Caingin', 'Dila', 'Dita',
      'Don Jose', 'Ibaba', 'Kanluran', 'Labas', 'Macabling',
      'Malitlit', 'Malusak', 'Market Area', 'Pooc', 'Pulong Santa Cruz',
      'Santo Domingo', 'Sinalhan', 'Tagapo'
    ]
  },

  'Biñan City': {
    'District I': [
      'Biñan', 'Bungahan', 'Canlalay', 'Casile', 'De La Paz',
      'Ganado', 'Langkiwa', 'Loma', 'Malaban', 'Malamig',
      'Mampalasan', 'Platero', 'Poblacion', 'San Antonio',
      'San Francisco', 'San Jose', 'San Vicente', 'Santo Domingo',
      'Santo Niño', 'Santo Tomas', 'Soro-soro', 'Timbao',
      'Tubigan', 'Zapote'
    ]
  },

  'San Pedro City': {
    'District I': [
      'Bagong Silang', 'Calendola', 'Chrysanthemum', 'Estrella',
      'Fatima', 'G.S.I.S.', 'Landayan', 'Langgam', 'Laram',
      'Magsaysay', 'Maharlika', 'Nueva', 'Pacita I', 'Pacita II',
      'Poblacion', 'Riverside', 'Rosario', 'Sampaguita Village',
      'San Antonio', 'San Lorenzo Ruiz', 'San Roque', 'San Vicente',
      'Santo Niño', 'United Bayanihan', 'United Better Living'
    ]
  },

  'Cabuyao City': {
    'District I': [
      'Baclaran', 'Banay-Banay', 'Banlic', 'Bigaa', 'Butong',
      'Casile', 'Diezmo', 'Gulod', 'Mamatid', 'Marinig',
      'Niugan', 'Pittland', 'Poblacion Uno', 'Poblacion Dos',
      'Poblacion Tres', 'Pulo', 'Sala', 'San Isidro'
    ]
  },

  'Lipa City': {
    'District I': [
      'Adya', 'Anilao', 'Anilao-Labac', 'Antipolo del Norte',
      'Antipolo del Sur', 'Bagong Pook', 'Balintawak', 'Banaybanay',
      'Bolbok', 'Bugtong na Pulo', 'Bulacnin', 'Bulaklakan',
      'Calamias', 'Cumba', 'Dagatan', 'Duhatan', 'Halang',
      'Inosluban', 'Lodlod', 'Lumbang', 'Mabini', 'Malagonlong',
      'Malitlit', 'Marauoy', 'Mataas na Lupa', 'Munting Pulo',
      'Pagolingin Bata', 'Pagolingin East', 'Pagolingin West',
      'Pangao', 'Pinagkawitan', 'Pinagtongulan', 'Plaridel',
      'Poblacion Barangay 1', 'Poblacion Barangay 2', 'Poblacion Barangay 3',
      'Poblacion Barangay 4', 'Poblacion Barangay 5', 'Poblacion Barangay 6',
      'Poblacion Barangay 7', 'Poblacion Barangay 8', 'Poblacion Barangay 9',
      'Poblacion Barangay 10', 'Poblacion Barangay 11', 'Poblacion Barangay 12',
      'Pusil', 'Quezon', 'Rizal', 'Sabang', 'Sampaguita', 'San Benito',
      'San Carlos', 'San Celestino', 'San Francisco', 'San Guillermo',
      'San Jose', 'San Lucas', 'San Salvador', 'San Sebastian',
      'Santo Niño', 'Santo Toribio', 'Sapac', 'Sico', 'Talisay',
      'Tambo', 'Tangob', 'Tanguay', 'Tibig', 'Tipacan'
    ]
  },

  'Tanauan City': {
    'District I': [
      'Altura Bata', 'Altura Matanda', 'Altura South', 'Ambulong',
      'Bagbag', 'Bagumbayan', 'Balele', 'Banjo East', 'Banjo West',
      'Bilog-Bilog', 'Boot', 'Cale', 'Darasa', 'Gonzales',
      'Hidalgo', 'Janopol', 'Janopol Oriental', 'Laurel', 'Luyos',
      'Mabini', 'Malaking Pulo', 'Maria Paz', 'Natatas',
      'Pagaspas', 'Pantay Bata', 'Pantay Matanda', 'Poblacion 1',
      'Poblacion 2', 'Poblacion 3', 'Poblacion 4', 'Poblacion 5',
      'Poblacion 6', 'Poblacion 7', 'Sala', 'Sambat', 'San Jose',
      'Santol', 'Sapac', 'Suplang', 'Talaga', 'Tinurik',
      'Trapiche', 'Ulango', 'Wawa'
    ]
  },

  'Bacoor City': {
    'District I': [
      'Alima', 'Aniban I', 'Aniban II', 'Aniban III', 'Aniban IV', 'Aniban V',
      'Banalo', 'Bayanan', 'Daang Bukid', 'Digman', 'Dulong Bayan',
      'Habay I', 'Habay II', 'Kaingin', 'Ligas I', 'Ligas II', 'Ligas III',
      'Mabolo I', 'Mabolo II', 'Mabolo III', 'Maliksi I', 'Maliksi II',
      'Maliksi III', 'Niog I', 'Niog II', 'Niog III', 'Panapaan I',
      'Panapaan II', 'Panapaan III', 'Panapaan IV', 'Panapaan V',
      'Panapaan VI', 'Panapaan VII', 'Panapaan VIII', 'Real I', 'Real II',
      'Salinas I', 'Salinas II', 'Salinas III', 'Salinas IV', 'Sineguelasan',
      'Talaba I', 'Talaba II', 'Talaba III', 'Talaba IV', 'Talaba V',
      'Talaba VI', 'Talaba VII', 'Zapote I', 'Zapote II', 'Zapote III',
      'Zapote IV', 'Zapote V'
    ]
  },

  'Dasmariñas City': {
    'First District': [
      'Burol I', 'Burol II', 'Burol III', 'Datu Esmael', 'Emmanuel Bergado I',
      'Emmanuel Bergado II', 'Langkaan I', 'Langkaan II', 'Paliparan I',
      'Paliparan II', 'Paliparan III', 'Sabang', 'Salawag', 'Salitran I',
      'Salitran II', 'Salitran III', 'Salitran IV', 'San Agustin I',
      'San Agustin II', 'San Agustin III', 'San Andres I', 'San Andres II',
      'San Esteban', 'San Jose', 'San Lorenzo I', 'San Lorenzo II',
      'San Luis I', 'San Luis II', 'San Miguel I', 'San Miguel II',
      'San Simon', 'Santa Cristina I', 'Santa Cristina II', 'Victoria Reyes',
      'Zone I', 'Zone I-A', 'Zone II', 'Zone III', 'Zone IV'
    ]
  },

  'Imus City': {
    'District I': [
      'Alapan I-A', 'Alapan I-B', 'Alapan I-C', 'Alapan II-A', 'Alapan II-B',
      'Anabu I-A', 'Anabu I-B', 'Anabu I-C', 'Anabu I-D', 'Anabu I-E',
      'Anabu I-F', 'Anabu I-G', 'Anabu II-A', 'Anabu II-B', 'Anabu II-C',
      'Anabu II-D', 'Anabu II-E', 'Anabu II-F', 'Bayan Luma I',
      'Bayan Luma II', 'Bayan Luma III', 'Bayan Luma IV', 'Bayan Luma V',
      'Bayan Luma VI', 'Bayan Luma VII', 'Bayan Luma VIII', 'Bayan Luma IX',
      'Bucandala I', 'Bucandala II', 'Bucandala III', 'Bucandala IV',
      'Bucandala V', 'Magdalo', 'Malagasang I-A', 'Malagasang I-B',
      'Malagasang I-C', 'Malagasang I-D', 'Malagasang I-E', 'Malagasang I-F',
      'Malagasang I-G', 'Malagasang II-A', 'Malagasang II-B',
      'Malagasang II-C', 'Malagasang II-D', 'Malagasang II-E',
      'Malagasang II-F', 'Malagasang II-G', 'Mariano Espeleta I',
      'Mariano Espeleta II', 'Mariano Espeleta III', 'Medicion I-A',
      'Medicion I-B', 'Medicion I-C', 'Medicion I-D', 'Medicion II-A',
      'Medicion II-B', 'Medicion II-C', 'Medicion II-D', 'Medicion II-E',
      'Medicion II-F', 'Palico I', 'Palico II', 'Palico III', 'Palico IV',
      'Pasong Buaya I', 'Pasong Buaya II', 'Pinagbuklod', 'Poblacion I-A',
      'Poblacion I-B', 'Poblacion I-C', 'Poblacion II-A', 'Poblacion II-B',
      'Poblacion III-A', 'Poblacion III-B', 'Poblacion IV-A',
      'Poblacion IV-B', 'Poblacion IV-C', 'Poblacion IV-D', 'Tanzang Luma I',
      'Tanzang Luma II', 'Tanzang Luma III', 'Tanzang Luma IV',
      'Tanzang Luma V', 'Tanzang Luma VI', 'Toclong I-A', 'Toclong I-B',
      'Toclong I-C', 'Toclong II-A', 'Toclong II-B'
    ]
  },

  'General Trias City': {
    'District I': [
      'Alingaro', 'Arnaldo', 'Bacao I', 'Bacao II', 'Bagumbayan',
      'Biclatan', 'Buenavista I', 'Buenavista II', 'Buenavista III',
      'Corregidor', 'Dulong Bayan', 'Governor Ferrer', 'Javalera',
      'Manggahan', 'Navarro', 'Panungyanan', 'Pasong Camachile I',
      'Pasong Camachile II', 'Pasong Kawayan I', 'Pasong Kawayan II',
      'Pinagtipunan', 'Poblacion', 'San Francisco', 'San Juan I',
      'San Juan II', 'Santa Clara', 'Santiago', 'Tapia', 'Tejero'
    ]
  },

  'Trece Martires City': {
    'District I': [
      'Aguado', 'Cabezas', 'Cabuco', 'De Ocampo', 'Hugo Perez',
      'Inocencio', 'Lapidario', 'Laqui', 'Luciano', 'Osorio',
      'Perez', 'San Agustin', 'Conchu'
    ]
  },

  'Laoag City': {
    'District I': [
      'Barangay 1, San Lorenzo', 'Barangay 2, Santa Joaquina',
      'Barangay 3, Nuestra Señora del Rosario', 'Barangay 4, San Guillermo',
      'Barangay 5, San Pedro', 'Barangay 6, San Nicolas',
      'Barangay 7, Santa Angela', 'Barangay 8, San Vicente',
      'Barangay 9, Santa Angela', 'Barangay 10, San Jose',
      'Barangay 11, Santa Balbina', 'Barangay 12, San Isidro',
      'Barangay 13, Nuestra Señora del Socorro', 'Barangay 14, Santo Tomas',
      'Barangay 15, San Guillermo', 'Barangay 16, San Jacinto',
      'Barangay 17, San Francisco', 'Barangay 18, San Quirino',
      'Barangay 19, Santa Marcela', 'Barangay 20, San Miguel',
      'Barangay 21, San Pedro', 'Barangay 22, San Andres',
      'Barangay 23, San Matias', 'Barangay 24, San Marcelino',
      'Barangay 25, Santa Rosa', 'Barangay 26, San Bernardo',
      'Barangay 27, San Mariano', 'Barangay 28, San Pedro',
      'Barangay 29, Santo Tomas', 'Barangay 30, Nuestra Señora de Visitacion',
      'Barangay 31, San Miguel', 'Barangay 32, San Agustin',
      'Barangay 33, Santa Rosa', 'Barangay 34, San Francisco',
      'Barangay 35, Santa Maria', 'Barangay 36, San Lorenzo',
      'Barangay 37, San Vicente', 'Barangay 38, San Agustin',
      'Barangay 39, Santa Cayetana', 'Barangay 40, San Jose',
      'Barangay 41, San Guillermo', 'Barangay 42, San Pedro',
      'Barangay 43, San Bernardo', 'Barangay 44, San Francisco',
      'Barangay 45, San Agustin', 'Barangay 46, San Nicolas',
      'Barangay 47, San Vicente', 'Barangay 48, San Lorenzo',
      'Barangay 49, Santa Monica', 'Barangay 50, San Pedro',
      'Barangay 51, San Isidro', 'Barangay 52, San Francisco',
      'Barangay 53, San Miguel', 'Barangay 54, San Lorenzo',
      'Barangay 55, San Agustin'
    ]
  },

  'Dagupan City': {
    'District I': [
      'Bacayao Norte', 'Bacayao Sur', 'Barangay I', 'Barangay II',
      'Barangay III', 'Barangay IV', 'Bolosan', 'Bonuan Binloc',
      'Bonuan Boquig', 'Bonuan Gueset', 'Calmay', 'Carael',
      'Caranglaan', 'Herrero', 'Lasip Chico', 'Lasip Grande',
      'Lomboy', 'Lucao', 'Malued', 'Mamalingling', 'Mangin',
      'Mayombo', 'Pantal', 'Poblacion Oeste', 'Pogo Chico',
      'Pogo Grande', 'Pugaro Suit', 'Salapingao', 'Salisay',
      'Tambac', 'Tapuac'
    ]
  },

  'San Carlos City, Pangasinan': {
    'District I': [
      'Abanon', 'Anando', 'Antipangol', 'Bacnar', 'Balaya',
      'Balayong', 'Baldog', 'Balococ', 'Bani',
      'Bogaoan', 'Bolingit', 'Bonifacio', 'Buenglat', 'Burgos',
      'Cacaritan', 'Caingal', 'Calobaoan', 'Calomboyan', 'Capataan',
      'Caoayan', 'Cobol', 'Coliling', 'Cruz', 'Doyong', 'Gamata',
      'Guelew', 'Ilang', 'Inerangan', 'Libas', 'Lilimasan',
      'Longos', 'Lucban', 'Mabalbalino', 'Magtaking', 'Malacañang',
      'Maliwara', 'Mamarlao', 'Manzon', 'Matagdem', 'Mestizo Norte',
      'Naguilayan', 'Padilla', 'Pagal', 'Palaming', 'Palaris',
      'Palospos', 'Pangalangan', 'Pangoloan', 'Paitan', 'Payapa',
      'Payar', 'PNR Site', 'Polo', 'Posadas',
      'Quezon', 'Quintong', 'Roxas', 'Salinap', 'San Juan',
      'San Pedro', 'Sapinit', 'Supo', 'Talang', 'Tamayo',
      'Tandoc', 'Tarece', 'Tarectec', 'Turac'
    ]
  },

  'Urdaneta City': {
    'District I': [
      'Anonas', 'Bactad East', 'Bactad West', 'Bayaoas',
      'Bolaoen', 'Cabuloan', 'Camanang', 'Camantiles',
      'Casantaan', 'Catubeng', 'Cayambanan', 'Consolacion',
      'Dilan-Paurido', 'Labit Proper', 'Labit West', 'Mabanogbog',
      'Macalong', 'Nancalobasaan', 'Nancamaliran East',
      'Nancamaliran West', 'Nancayasan', 'Oltama', 'Palina East',
      'Palina West', 'Pedro T. Orata', 'Pinmaludpod',
      'Poblacion', 'San Jose', 'San Vicente', 'Santa Lucia',
      'Santo Domingo', 'Sugcong', 'Tipuso', 'Tulong'
    ]
  },

  'Alaminos City': {
    'District I': [
      'Alos', 'Amandiego', 'Amangbangan', 'Balangobong',
      'Balayang', 'Baleyadaan', 'Bisocol', 'Bolaney',
      'Bued', 'Cabatuan', 'Cayucay', 'Dulacac',
      'Inerangan', 'Landoc', 'Linmansangan', 'Lucap',
      'Magsaysay', 'Mona', 'Palamis', 'Pandan',
      'Pangapisan North', 'Pangapisan Sur', 'Poblacion',
      'Pocal-pocal', 'Pogo', 'Quibuar', 'Sabangan',
      'San Antonio', 'San Jose', 'San Roque', 'San Vicente',
      'Santa Maria', 'Tanaytay', 'Tangcarang', 'Telbang',
      'Victoria', 'Poblacion'
    ]
  },

  'Tuguegarao City': {
    'District I': [
      'Annafunan East', 'Annafunan West', 'Atulayan Norte',
      'Atulayan Sur', 'Bagay', 'Buntun', 'Caggay',
      'Capatan', 'Carig', 'Caritan Centro', 'Caritan Norte',
      'Caritan Sur', 'Carmen', 'Centro 1', 'Centro 2',
      'Centro 3', 'Centro 4', 'Centro 5', 'Centro 6',
      'Centro 7', 'Centro 8', 'Centro 9', 'Centro 10',
      'Centro 11', 'Centro 12', 'Cataggaman Nuevo',
      'Cataggaman Pardo', 'Cataggaman Viejo', 'Dadda',
      'Gosi Norte', 'Gosi Sur', 'Larion Alto',
      'Larion Bajo', 'Leonarda', 'Libag Norte',
      'Libag Sur', 'Linao East', 'Linao Norte',
      'Linao West', 'Namabbalan Norte', 'Namabbalan Sur',
      'Pallua Norte', 'Pallua Sur', 'Pengue',
      'Pengue-Ruyu', 'Reyes', 'Tagga', 'Tanza',
      'Ugac Norte', 'Ugac Sur'
    ]
  }
};

// Helper functions - Update these functions
export const getAllProvinces = () => {
  // Flatten all provinces from all regions
  const provinces = [];
  Object.values(PHILIPPINES_REGIONS).forEach(regions => {
    regions.forEach(region => {
      provinces.push(...region.provinces);
    });
  });
  console.log('Available provinces:', provinces); // Debug log
  return provinces;
};

export const getCitiesForProvince = (province) => {
  // Check if province exists and return its cities
  console.log('Getting cities for province:', province); // Debug log
  if (CITIES_MUNICIPALITIES[province]) {
    console.log('Found cities:', CITIES_MUNICIPALITIES[province]); // Debug log
    return CITIES_MUNICIPALITIES[province];
  }
  console.warn(`No cities found for province: ${province}`);
  return [];
};

export const getBarangaysForCity = (city) => {
  // First find which district contains this city
  console.log('Getting barangays for city:', city); // Debug log
  for (const [cityName, districts] of Object.entries(BARANGAYS_BY_CITY)) {
    if (cityName === city) {
      const barangays = Object.values(districts).flat();
      console.log('Found barangays:', barangays); // Debug log
      return barangays;
    }
  }
  console.warn(`No barangays found for city: ${city}`);
  return [];
};

// Add this debug function to test the data
export const debugLocationData = () => {
  console.log('All Provinces:', getAllProvinces());
  console.log('Sample Province Cities:', getCitiesForProvince('Metro Manila'));
  console.log('Sample City Barangays:', getBarangaysForCity('Manila'));
  
  // Test specific data existence
  const provinces = getAllProvinces();
  console.log('Number of provinces:', provinces.length);
  
  const sampleProvince = provinces[0];
  const citiesInSampleProvince = getCitiesForProvince(sampleProvince);
  console.log(`Cities in ${sampleProvince}:`, citiesInSampleProvince);
  
  if (citiesInSampleProvince.length > 0) {
    const sampleCity = citiesInSampleProvince[0];
    const barangaysInSampleCity = getBarangaysForCity(sampleCity);
    console.log(`Barangays in ${sampleCity}:`, barangaysInSampleCity);
  }
};

export const getProvincesForRegion = (region) => {
  for (const division of Object.values(PHILIPPINES_REGIONS)) {
    const foundRegion = division.find(r => r.name === region);
    if (foundRegion) {
      return foundRegion.provinces;
    }
  }
  return [];
};

export const getAllCitiesMunicipalities = () => {
  return Object.values(CITIES_MUNICIPALITIES).flat();
};

export const validatePostalCode = (postalCode) => {
  const regex = /^\d{4}$/;
  return regex.test(postalCode);
};

export const searchLocations = (query, type = 'all') => {
  query = query.toLowerCase();
  
  switch(type) {
    case 'city':
      return getAllCitiesMunicipalities().filter(city => 
        city.toLowerCase().includes(query)
      );
    case 'province':
      return getAllProvinces().filter(province => 
        province.toLowerCase().includes(query)
      );
    case 'region':
      return Object.values(PHILIPPINES_REGIONS)
        .flat()
        .map(region => region.name)
        .filter(region => region.toLowerCase().includes(query));
    default:
      return {
        cities: searchLocations(query, 'city'),
        provinces: searchLocations(query, 'province'),
        regions: searchLocations(query, 'region')
      };
  }
};

// Get region for a given province
export const getRegionForProvince = (province) => {
  for (const division of Object.values(PHILIPPINES_REGIONS)) {
    for (const region of division) {
      if (region.provinces.includes(province)) {
        return region.name;
      }
    }
  }
  return null;
};

// Get division for a given province or region
export const getDivisionForLocation = (location) => {
  for (const [division, regions] of Object.entries(PHILIPPINES_REGIONS)) {
    for (const region of regions) {
      if (region.name === location || region.provinces.includes(location)) {
        return division;
      }
    }
  }
  return null;
};
    

export const getDistrictsForCity = (city) => {
  if (!BARANGAYS_BY_CITY[city]) return [];
  return Object.keys(BARANGAYS_BY_CITY[city]);
};

export const searchBarangays = (query, city = null) => {
  query = query.toLowerCase();
  
  if (city) {
    return getBarangaysForCity(city).filter(barangay => 
      barangay.toLowerCase().includes(query)
    );
  }
  
  return Object.values(BARANGAYS_BY_CITY)
    .map(districts => Object.values(districts).flat())
    .flat()
    .filter(barangay => barangay.toLowerCase().includes(query));
}; 

// Add these additional helper functions

// Get all cities in a specific division (Luzon, Visayas, or Mindanao)
export const getCitiesInDivision = (division) => {
  const regions = PHILIPPINES_REGIONS[division] || [];
  const provinces = regions.map(region => region.provinces).flat();
  return provinces.map(province => CITIES_MUNICIPALITIES[province]).flat();
};

// Get all barangays in a province
export const getBarangaysInProvince = (province) => {
  const cities = CITIES_MUNICIPALITIES[province] || [];
  return cities.map(city => getBarangaysForCity(city)).flat();
};

// Get all barangays in a region
export const getBarangaysInRegion = (regionName) => {
  const region = Object.values(PHILIPPINES_REGIONS)
    .flat()
    .find(r => r.name === regionName);
  
  if (!region) return [];
  
  return region.provinces
    .map(province => getBarangaysInProvince(province))
    .flat();
};

// Validate if a location exists
export const validateLocation = (location, type = 'all') => {
  switch(type) {
    case 'city':
      return getAllCitiesMunicipalities().includes(location);
    case 'province':
      return getAllProvinces().includes(location);
    case 'region':
      return Object.values(PHILIPPINES_REGIONS)
        .flat()
        .map(region => region.name)
        .includes(location);
    case 'barangay':
      return Object.values(BARANGAYS_BY_CITY)
        .map(districts => Object.values(districts).flat())
        .flat()
        .includes(location);
    default:
      return validateLocation(location, 'city') ||
             validateLocation(location, 'province') ||
             validateLocation(location, 'region') ||
             validateLocation(location, 'barangay');
  }
};

// Get nearby cities within a province
export const getNearbyCities = (city) => {
  const province = Object.entries(CITIES_MUNICIPALITIES)
    .find(([_, cities]) => cities.includes(city))?.[0];
  
  if (!province) return [];
  
  return CITIES_MUNICIPALITIES[province].filter(c => c !== city);
};

// Get cities with similar names
export const getSimilarCities = (cityName) => {
  const allCities = getAllCitiesMunicipalities();
  return allCities.filter(city => 
    city.toLowerCase().includes(cityName.toLowerCase()) ||
    cityName.toLowerCase().includes(city.toLowerCase())
  );
};

// Get complete location info
export const getLocationInfo = (location) => {
  // Try to find as city first
  for (const [province, cities] of Object.entries(CITIES_MUNICIPALITIES)) {
    if (cities.includes(location)) {
      const region = getRegionForProvince(province);
      const division = getDivisionForLocation(province);
      const districts = getDistrictsForCity(location);
      const barangays = getBarangaysForCity(location);
      
      return {
        type: 'city',
        name: location,
        province,
        region,
        division,
        districts,
        barangays,
        nearbyCities: getNearbyCities(location)
      };
    }
  }

  // Try to find as province
  if (getAllProvinces().includes(location)) {
    const region = getRegionForProvince(location);
    const division = getDivisionForLocation(location);
    const cities = CITIES_MUNICIPALITIES[location] || [];
    
    return {
      type: 'province',
      name: location,
      region,
      division,
      cities,
      barangays: getBarangaysInProvince(location)
    };
  }

  // Try to find as region
  const regionInfo = Object.values(PHILIPPINES_REGIONS)
    .flat()
    .find(r => r.name === location);

  if (regionInfo) {
    const division = getDivisionForLocation(location);
    return {
      type: 'region',
      name: location,
      division,
      provinces: regionInfo.provinces,
      cities: regionInfo.provinces
        .map(province => CITIES_MUNICIPALITIES[province])
        .flat(),
      barangays: getBarangaysInRegion(location)
    };
  }

  return null;
};

// Format address components
export const formatAddress = (components) => {
  const {
    street,
    barangay,
    city,
    province,
    region,
    postalCode
  } = components;

  const parts = [
    street,
    barangay && `Barangay ${barangay}`,
    city,
    province,
    region,
    postalCode
  ].filter(Boolean);

  return parts.join(', ');
};

// Validate complete address
export const validateAddress = (components) => {
  const {
    barangay,
    city,
    province,
    region,
    postalCode
  } = components;

  const errors = {};

  if (city && !validateLocation(city, 'city')) {
    errors.city = 'Invalid city';
  }

  if (province && !validateLocation(province, 'province')) {
    errors.province = 'Invalid province';
  }

  if (region && !validateLocation(region, 'region')) {
    errors.region = 'Invalid region';
  }

  if (barangay && city && !getBarangaysForCity(city).includes(barangay)) {
    errors.barangay = 'Invalid barangay for this city';
  }

  if (postalCode && !validatePostalCode(postalCode)) {
    errors.postalCode = 'Invalid postal code format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};