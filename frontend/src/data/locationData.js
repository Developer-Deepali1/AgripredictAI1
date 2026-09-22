/**
 * India location hierarchy: State → District → Local Areas (Blocks/Taluks)
 *
 * Covers all 28 states and 8 union territories of India.
 * Bihar, Odisha, and West Bengal include complete district lists.
 * All other states/UTs include 5–7 representative districts.
 * To add a new state, append an entry to LOCATION_HIERARCHY following the same pattern:
 *   'State Name': { 'District Name': ['Area1', 'Area2', ...], ... }
 */

export const LOCATION_HIERARCHY = {
  // ─── Bihar (38 districts) ────────────────────────────────────────────────
  'Bihar': {
    'Araria': ['Araria', 'Forbesganj', 'Jokihat', 'Narpatganj', 'Sikti'],
    'Arwal': ['Arwal', 'Kaler', 'Kurtha', 'Sonbhadra Banshi Suryapur'],
    'Aurangabad': ['Aurangabad', 'Daudnagar', 'Goh', 'Haspura', 'Obra'],
    'Banka': ['Banka', 'Amarpur', 'Barahat', 'Belhar', 'Dhuraiya'],
    'Begusarai': ['Begusarai', 'Bachhwara', 'Barauni', 'Birpur', 'Teghra'],
    'Bhagalpur': ['Bhagalpur', 'Bihpur', 'Kahalgaon', 'Pirpainti', 'Sultanganj'],
    'Bhojpur': ['Ara', 'Agiaon', 'Barhara', 'Piro', 'Sandesh'],
    'Buxar': ['Buxar', 'Brahmpur', 'Chausa', 'Dumraon', 'Rajpur'],
    'Darbhanga': ['Darbhanga', 'Baheri', 'Biraul', 'Hayaghat', 'Kiratpur'],
    'East Champaran': ['Motihari', 'Adapur', 'Areraj', 'Chiraiya', 'Pakridayal'],
    'Gaya': ['Gaya', 'Bodh Gaya', 'Imamganj', 'Sherghati', 'Wazirganj'],
    'Gopalganj': ['Gopalganj', 'Barauli', 'Bhore', 'Kuchaikote', 'Sidhwalia'],
    'Jamui': ['Jamui', 'Chakai', 'Jhajha', 'Khaira', 'Sikandra'],
    'Jehanabad': ['Jehanabad', 'Ghoshi', 'Hulasganj', 'Kako', 'Makhdumpur'],
    'Kaimur': ['Bhabua', 'Adhaura', 'Bhagwanpur', 'Chainpur', 'Ramgarh'],
    'Katihar': ['Katihar', 'Amdabad', 'Azamnagar', 'Balrampur', 'Manihari'],
    'Khagaria': ['Khagaria', 'Alali', 'Chautham', 'Gogri', 'Mansi'],
    'Kishanganj': ['Kishanganj', 'Bahadurganj', 'Kochadhamin', 'Pothia', 'Thakurganj'],
    'Lakhisarai': ['Lakhisarai', 'Barahiya', 'Halsi', 'Pipariya', 'Surajgarha'],
    'Madhepura': ['Madhepura', 'Alamnagar', 'Bihariganj', 'Gwalpara', 'Singheshwar'],
    'Madhubani': ['Madhubani', 'Benipatti', 'Bisfi', 'Jainagar', 'Phulparas'],
    'Munger': ['Munger', 'Dharhara', 'Jamalpur', 'Kharagpur', 'Tarapur'],
    'Muzaffarpur': ['Muzaffarpur', 'Aurai', 'Bochahan', 'Kanti', 'Motipur'],
    'Nalanda': ['Biharsharif', 'Asthawan', 'Ekangarsarai', 'Hilsa', 'Noorsarai'],
    'Nawada': ['Nawada', 'Hisua', 'Nardiganj', 'Rajauli', 'Warsaliganj'],
    'Patna': ['Patna City', 'Bikram', 'Danapur', 'Masaurhi', 'Phulwari'],
    'Purnia': ['Purnia', 'Baisi', 'Banmankhi', 'Bhawanipur', 'Kasba'],
    'Rohtas': ['Sasaram', 'Bikramganj', 'Dehri', 'Nokha', 'Sherghati'],
    'Saharsa': ['Saharsa', 'Kahara', 'Mahishi', 'Patarghat', 'Salkhua'],
    'Samastipur': ['Samastipur', 'Bibhutipur', 'Dalsinghsarai', 'Mohiuddinagar', 'Pusa'],
    'Saran': ['Chhapra', 'Amnour', 'Dariapur', 'Ekma', 'Marshaghai'],
    'Sheikhpura': ['Sheikhpura', 'Ariyari', 'Barbigha', 'Chewara', 'Shekhopur Sarai'],
    'Sheohar': ['Sheohar', 'Piprahi', 'Purnahiya', 'Tariyani'],
    'Sitamarhi': ['Sitamarhi', 'Bajpatti', 'Belsand', 'Dumra', 'Riga'],
    'Siwan': ['Siwan', 'Barharia', 'Darauli', 'Hussainganj', 'Maharajganj'],
    'Supaul': ['Supaul', 'Birpur', 'Chhatapur', 'Kishunpur', 'Triveniganj'],
    'Vaishali': ['Hajipur', 'Bidupur', 'Goraul', 'Lalganj', 'Mahnar'],
    'West Champaran': ['Bettiah', 'Bagaha', 'Gaunaha', 'Narkatiaganj', 'Ramnagar'],
  },

  // ─── Odisha (30 districts) ───────────────────────────────────────────────
  'Odisha': {
    'Angul': ['Angul', 'Athamallik', 'Chhendipada', 'Kaniha', 'Talcher'],
    'Balangir': ['Balangir', 'Kantabanji', 'Patnagarh', 'Saintala', 'Titlagarh'],
    'Balasore': ['Balasore', 'Basta', 'Bhograi', 'Jaleswar', 'Simulia'],
    'Bargarh': ['Bargarh', 'Attabira', 'Bheden', 'Bijepur', 'Padampur'],
    'Bhadrak': ['Bhadrak', 'Basudevpur', 'Bhandaripokhari', 'Bonth', 'Tihidi'],
    'Boudh': ['Boudh', 'Baunsuni', 'Harbhanga', 'Kantamal', 'Purunakatak'],
    'Cuttack': ['Cuttack City', 'Athagarh', 'Banki', 'Baramba', 'Niali'],
    'Deogarh': ['Deogarh', 'Barkote', 'Reamal', 'Tileibani'],
    'Dhenkanal': ['Dhenkanal', 'Bhuban', 'Hindol', 'Kamakhyanagar', 'Odapada'],
    'Gajapati': ['Paralakhemundi', 'Gumma', 'Kashinagar', 'Mohana', 'Rayagada'],
    'Ganjam': ['Berhampur', 'Bhanjanagar', 'Chhatrapur', 'Chikiti', 'Digapahandi'],
    'Jagatsinghpur': ['Jagatsinghpur', 'Balikuda', 'Biridi', 'Kujang', 'Tirtol'],
    'Jajpur': ['Jajpur', 'Bari', 'Binjharpur', 'Dharmasala', 'Sukinda'],
    'Jharsuguda': ['Jharsuguda', 'Belpahar', 'Brajrajnagar', 'Kolabira', 'Lakhanpur'],
    'Kalahandi': ['Bhawanipatna', 'Dharmagarh', 'Junagarh', 'Kesinga', 'Narla'],
    'Kandhamal': ['Phulbani', 'Baliguda', 'Daringbadi', 'G. Udayagiri', 'Tikabali'],
    'Kendrapara': ['Kendrapara', 'Aul', 'Derabish', 'Marshaghai', 'Pattamundai'],
    'Kendujhar': ['Kendujhar', 'Anandapur', 'Barbil', 'Champua', 'Ghasipura'],
    'Khordha': ['Bhubaneswar', 'Balianta', 'Begunia', 'Jatani', 'Khordha'],
    'Koraput': ['Koraput', 'Boipariguda', 'Jeypore', 'Kotpad', 'Narayanpatna'],
    'Malkangiri': ['Malkangiri', 'Chitrakonda', 'Kalimela', 'Korukonda', 'Podia'],
    'Mayurbhanj': ['Baripada', 'Bangriposi', 'Jashipur', 'Karanjia', 'Udala'],
    'Nabarangpur': ['Nabarangpur', 'Dabugam', 'Jharigam', 'Papadahandi', 'Umerkote'],
    'Nayagarh': ['Nayagarh', 'Boudh', 'Daspalla', 'Khandapara', 'Ranpur'],
    'Nuapada': ['Nuapada', 'Boden', 'Khariar', 'Komna', 'Sinapali'],
    'Puri': ['Puri', 'Konark', 'Nimapara', 'Pipili', 'Satyabadi'],
    'Rayagada': ['Rayagada', 'Bissamcuttack', 'Gunupur', 'Kashipur', 'Kolnara'],
    'Sambalpur': ['Sambalpur', 'Bamra', 'Kuchinda', 'Maneswar', 'Rengali'],
    'Subarnapur': ['Sonepur', 'Birmaharajpur', 'Binka', 'Dunguripali', 'Tarbha'],
    'Sundargarh': ['Sundargarh', 'Bonai', 'Hemgir', 'Rajgangpur', 'Rourkela'],
  },

  // ─── West Bengal (23 districts) ─────────────────────────────────────────
  'West Bengal': {
    'Alipurduar': ['Alipurduar', 'Falakata', 'Kalchini', 'Kumargram', 'Madarihat'],
    'Bankura': ['Bankura', 'Bishnupur', 'Khatra', 'Onda', 'Sonamukhi'],
    'Birbhum': ['Suri', 'Bolpur', 'Dubrajpur', 'Nalhati', 'Rampurhat'],
    'Cooch Behar': ['Cooch Behar', 'Dinhata', 'Mathabhanga', 'Mekhliganj', 'Tufanganj'],
    'Dakshin Dinajpur': ['Balurghat', 'Buniadpur', 'Gangarampur', 'Harirampur', 'Tapan'],
    'Darjeeling': ['Darjeeling', 'Kalimpong', 'Kurseong', 'Mirik', 'Siliguri'],
    'Hooghly': ['Chinsurah', 'Arambag', 'Chanditala', 'Serampore', 'Tarakeswar'],
    'Howrah': ['Howrah City', 'Amta', 'Bagnan', 'Shyampur', 'Uluberia'],
    'Jalpaiguri': ['Jalpaiguri', 'Alipurduar', 'Dhupguri', 'Mal', 'Rajganj'],
    'Jhargram': ['Jhargram', 'Binpur', 'Gopiballavpur', 'Jamboni', 'Nayagram'],
    'Kalimpong': ['Kalimpong', 'Gorubathan', 'Kalijhora', 'Lava', 'Pedong'],
    'Kolkata': ['Kolkata City', 'Barrackpore', 'Barasat', 'Dum Dum', 'Salt Lake'],
    'Malda': ['English Bazar', 'Gazole', 'Habibpur', 'Old Malda', 'Ratua'],
    'Murshidabad': ['Berhampore', 'Jiaganj', 'Kandi', 'Lalbagh', 'Murshidabad'],
    'Nadia': ['Krishnanagar', 'Chakdaha', 'Kalyani', 'Nabadwip', 'Ranaghat'],
    'North 24 Parganas': ['Barasat', 'Barrackpore', 'Basirhat', 'Habra', 'Sandeshkhali'],
    'Paschim Bardhaman': ['Asansol', 'Durgapur', 'Jamuria', 'Kanksa', 'Raniganj'],
    'Paschim Medinipur': ['Midnapore City', 'Daspur', 'Debra', 'Ghatal', 'Sabang'],
    'Purba Bardhaman': ['Burdwan City', 'Kalna', 'Katwa', 'Memari', 'Monteswar'],
    'Purba Medinipur': ['Tamluk', 'Contai', 'Haldia', 'Nandakumar', 'Panskura'],
    'Purulia': ['Purulia', 'Arsha', 'Bandwan', 'Jhalda', 'Raghunathpur'],
    'South 24 Parganas': ['Alipore', 'Baruipur', 'Canning', 'Diamond Harbour', 'Kakdwip'],
    'Uttar Dinajpur': ['Raiganj', 'Dalkhola', 'Goalpokhar', 'Islampur', 'Karandighi'],
  },

  // ─── Andhra Pradesh ──────────────────────────────────────────────────────
  'Andhra Pradesh': {
    'Visakhapatnam': ['Visakhapatnam', 'Bheemunipatnam', 'Chodavaram', 'Paderu', 'Sabbavaram'],
    'Krishna': ['Machilipatnam', 'Gannavaram', 'Gudivada', 'Nandigama', 'Vijayawada'],
    'Guntur': ['Guntur', 'Bapatla', 'Narasaraopet', 'Palnadu', 'Tenali'],
    'East Godavari': ['Rajahmundry', 'Amalapuram', 'Kakinada', 'Pithapuram', 'Rampachodavaram'],
    'West Godavari': ['Eluru', 'Bhimavaram', 'Narsapur', 'Palacole', 'Tanuku'],
    'Kurnool': ['Kurnool', 'Adoni', 'Nandyal', 'Pattikonda', 'Yemmiganur'],
    'Kadapa': ['Kadapa', 'Jammalamadugu', 'Proddatur', 'Pulivendula', 'Rajampet'],
  },

  // ─── Arunachal Pradesh ───────────────────────────────────────────────────
  'Arunachal Pradesh': {
    'Itanagar Capital Complex': ['Itanagar', 'Nirjuli', 'Naharlagun', 'Banderdewa', 'Doimukh'],
    'East Kameng': ['Seppa', 'Bameng', 'Chayang Tajo', 'Pipu', 'Khenewa'],
    'West Kameng': ['Bomdila', 'Dirang', 'Rupa', 'Shergaon', 'Tenga'],
    'Papum Pare': ['Sagalee', 'Balijan', 'Kimin', 'Leporiang', 'Yupia'],
    'Tawang': ['Tawang', 'Bhalukpong', 'Jang', 'Lumla', 'Mukto'],
    'East Siang': ['Pasighat', 'Bilat', 'Mebo', 'Nari', 'Rottung'],
    'West Siang': ['Along', 'Kamba', 'Mechukha', 'Payum', 'Rumgong'],
  },

  // ─── Assam ───────────────────────────────────────────────────────────────
  'Assam': {
    'Kamrup Metropolitan': ['Guwahati', 'Azara', 'Chandrapur', 'Dispur', 'Hengrabari'],
    'Jorhat': ['Jorhat', 'Mariani', 'Majuli', 'Titabor', 'Teok'],
    'Dibrugarh': ['Dibrugarh', 'Chabua', 'Khowang', 'Lahowal', 'Naharkatia'],
    'Nagaon': ['Nagaon', 'Hojai', 'Kaliabor', 'Lumding', 'Raha'],
    'Sonitpur': ['Tezpur', 'Biswanath', 'Dhekiajuli', 'Gohpur', 'Sootea'],
    'Cachar': ['Silchar', 'Barkhola', 'Katigorah', 'Lakhipur', 'Sonai'],
    'Golaghat': ['Golaghat', 'Bokeliaghhat', 'Dergaon', 'Khumtai', 'Sarupathar'],
  },

  // ─── Chhattisgarh ────────────────────────────────────────────────────────
  'Chhattisgarh': {
    'Raipur': ['Raipur', 'Abhanpur', 'Arang', 'Dharsiwa', 'Tilda'],
    'Bilaspur': ['Bilaspur', 'Akaltara', 'Mungeli', 'Pendra', 'Takhatpur'],
    'Durg': ['Durg', 'Balod', 'Bemetara', 'Bhilai', 'Patan'],
    'Raigarh': ['Raigarh', 'Dharamjaigarh', 'Gharghoda', 'Kharsia', 'Sarangarh'],
    'Surguja': ['Ambikapur', 'Balrampur', 'Manendragarh', 'Premnagar', 'Surajpur'],
    'Bastar': ['Jagdalpur', 'Bakawand', 'Darbha', 'Kondagaon', 'Lohandiguda'],
    'Rajnandgaon': ['Rajnandgaon', 'Chhuikhadan', 'Dongargaon', 'Khairagarh', 'Mohla'],
  },

  // ─── Goa ─────────────────────────────────────────────────────────────────
  'Goa': {
    'North Goa': ['Panaji', 'Calangute', 'Mapusa', 'Pernem', 'Ponda'],
    'South Goa': ['Margao', 'Canacona', 'Mormugao', 'Quepem', 'Sanguem'],
  },

  // ─── Gujarat ─────────────────────────────────────────────────────────────
  'Gujarat': {
    'Ahmedabad': ['Ahmedabad', 'Bavla', 'Daskroi', 'Dholka', 'Sanand'],
    'Surat': ['Surat City', 'Chorasi', 'Kamrej', 'Mangrol', 'Olpad'],
    'Vadodara': ['Vadodara', 'Karjan', 'Padra', 'Savli', 'Waghodia'],
    'Rajkot': ['Rajkot', 'Gondal', 'Jasdan', 'Kotda Sangani', 'Lodhika'],
    'Gandhinagar': ['Gandhinagar', 'Dehgam', 'Kalol', 'Mansa', 'Petlad'],
    'Junagadh': ['Junagadh', 'Keshod', 'Mangrol', 'Talala', 'Visavadar'],
    'Bhavnagar': ['Bhavnagar', 'Gariadhar', 'Ghogha', 'Mahuva', 'Palitana'],
  },

  // ─── Haryana ─────────────────────────────────────────────────────────────
  'Haryana': {
    'Gurugram': ['Gurugram', 'Farukhnagar', 'Pataudi', 'Sohna', 'Wazirabad'],
    'Faridabad': ['Faridabad', 'Ballabhgarh', 'Badkhal', 'Tigaon', 'Palwal'],
    'Hisar': ['Hisar', 'Adampur', 'Agroha', 'Barwala', 'Hansi'],
    'Ambala': ['Ambala', 'Barara', 'Mulana', 'Naraingarh', 'Shehzadpur'],
    'Rohtak': ['Rohtak', 'Asthal Bohar', 'Lakhan Majra', 'Meham', 'Sampla'],
    'Karnal': ['Karnal', 'Assandh', 'Gharaunda', 'Indri', 'Nilokheri'],
    'Panipat': ['Panipat', 'Bapoli', 'Israna', 'Madlauda', 'Samalkha'],
  },

  // ─── Himachal Pradesh ────────────────────────────────────────────────────
  'Himachal Pradesh': {
    'Shimla': ['Shimla', 'Chopal', 'Jubbal', 'Rampur', 'Rohru'],
    'Kullu': ['Kullu', 'Anni', 'Banjar', 'Manali', 'Nirmand'],
    'Mandi': ['Mandi', 'Balh', 'Jogindernagar', 'Sarkaghat', 'Sundernagar'],
    'Kangra': ['Dharamsala', 'Dehra', 'Fatehpur', 'Nurpur', 'Palampur'],
    'Sirmaur': ['Nahan', 'Pachhad', 'Paonta Sahib', 'Rajgarh', 'Shillai'],
    'Solan': ['Solan', 'Arki', 'Kandaghat', 'Nalagarh', 'Rampurghiat'],
    'Hamirpur': ['Hamirpur', 'Barsar', 'Bhoranj', 'Nadaun', 'Sujanpur'],
  },

  // ─── Jharkhand ───────────────────────────────────────────────────────────
  'Jharkhand': {
    'Ranchi': ['Ranchi', 'Angara', 'Bundu', 'Kanke', 'Namkum'],
    'Dhanbad': ['Dhanbad', 'Baghmara', 'Baliapur', 'Gobindpur', 'Topchanchi'],
    'East Singhbhum': ['Jamshedpur', 'Baharagora', 'Boram', 'Dhalbhum', 'Ghatsila'],
    'Bokaro': ['Bokaro', 'Bermo', 'Chas', 'Chandankiyari', 'Gomia'],
    'Hazaribagh': ['Hazaribagh', 'Barkatha', 'Barkagaon', 'Ichak', 'Padma'],
    'Giridih': ['Giridih', 'Bengabad', 'Birni', 'Dhanwar', 'Dumri'],
    'Deoghar': ['Deoghar', 'Devipur', 'Madhupur', 'Mohanpur', 'Sarwan'],
  },

  // ─── Karnataka ───────────────────────────────────────────────────────────
  'Karnataka': {
    'Bengaluru Urban': ['Bengaluru', 'Anekal', 'Dasarahalli', 'Gandhinagar', 'Yelahanka'],
    'Mysuru': ['Mysuru', 'Heggadadevankote', 'Hunsur', 'Krishnarajanagara', 'Nanjangud'],
    'Tumakuru': ['Tumakuru', 'Chikkanayakanahalli', 'Gubbi', 'Kunigal', 'Pavagada'],
    'Dharwad': ['Dharwad', 'Alnavar', 'Hubli', 'Kalghatgi', 'Navalgund'],
    'Belagavi': ['Belagavi', 'Athani', 'Chikkodi', 'Hukkeri', 'Ramdurg'],
    'Dakshina Kannada': ['Mangaluru', 'Bantval', 'Belthangady', 'Puttur', 'Sullia'],
    'Shivamogga': ['Shivamogga', 'Bhadravati', 'Hosanagara', 'Sagara', 'Sorab'],
  },

  // ─── Kerala ──────────────────────────────────────────────────────────────
  'Kerala': {
    'Thiruvananthapuram': ['Thiruvananthapuram', 'Kattakada', 'Nedumangad', 'Neyyattinkara', 'Varkala'],
    'Ernakulam': ['Ernakulam', 'Aluva', 'Kothamangalam', 'Kunnathunad', 'Paravur'],
    'Kozhikode': ['Kozhikode', 'Koyilandy', 'Mukkam', 'Thamarassery', 'Vadakara'],
    'Thrissur': ['Thrissur', 'Chalakudy', 'Chavakkad', 'Kodungallur', 'Mukundapuram'],
    'Palakkad': ['Palakkad', 'Alathur', 'Attappady', 'Mannarkkad', 'Nemmara'],
    'Malappuram': ['Malappuram', 'Eranad', 'Manjeri', 'Perinthalmanna', 'Tirur'],
    'Kannur': ['Kannur', 'Iritty', 'Payyannur', 'Taliparamba', 'Thalassery'],
  },

  // ─── Madhya Pradesh ──────────────────────────────────────────────────────
  'Madhya Pradesh': {
    'Bhopal': ['Bhopal', 'Berasia', 'Phanda', 'Raisen', 'Sehore'],
    'Indore': ['Indore', 'Depalpur', 'Mhow', 'Sanwer', 'Simrol'],
    'Gwalior': ['Gwalior', 'Bhitarwar', 'Dabra', 'Morar', 'Seondha'],
    'Jabalpur': ['Jabalpur', 'Bargi', 'Kundam', 'Patan', 'Sihora'],
    'Ujjain': ['Ujjain', 'Badnagar', 'Khachrod', 'Mahidpur', 'Tarana'],
    'Rewa': ['Rewa', 'Gangev', 'Hanumana', 'Mauganj', 'Teonthar'],
    'Satna': ['Satna', 'Amarpatan', 'Majhgawan', 'Nagod', 'Ramnagar'],
  },

  // ─── Maharashtra ─────────────────────────────────────────────────────────
  'Maharashtra': {
    'Mumbai City': ['Fort', 'Andheri', 'Borivali', 'Chembur', 'Kurla'],
    'Pune': ['Pune City', 'Pune', 'Baramati', 'Haveli', 'Indapur', 'Khed', 'Shirur', 'Maval', 'Ambegaon'],
    'Nagpur': ['Nagpur', 'Hingna', 'Kamptee', 'Kalmeshwar', 'Narkhed'],
    'Nashik': ['Nashik', 'Dindori', 'Igatpuri', 'Niphad', 'Sinnar'],
    'Chhatrapati Sambhajinagar': ['Chhatrapati Sambhajinagar', 'Gangapur', 'Kannad', 'Paithan', 'Phulambri'],
    'Thane': ['Thane', 'Bhiwandi', 'Kalyan', 'Murbad', 'Ulhasnagar'],
    'Kolhapur': ['Kolhapur', 'Gadhinglaj', 'Hatkanangale', 'Karvir', 'Shahuwadi'],
  },

  // ─── Manipur ─────────────────────────────────────────────────────────────
  'Manipur': {
    'Imphal East': ['Imphal East', 'Heingang', 'Jiribam', 'Porompat', 'Sawombung'],
    'Imphal West': ['Imphal West', 'Lamphel', 'Nambol', 'Patsoi', 'Wangoi'],
    'Bishnupur': ['Bishnupur', 'Churachandpur', 'Moirang', 'Nambol', 'Oinam'],
    'Thoubal': ['Thoubal', 'Kakching', 'Lilong', 'Pallel', 'Wangjing'],
    'Senapati': ['Senapati', 'Kangpokpi', 'Paomata', 'Purul', 'Sadar Hills'],
    'Ukhrul': ['Ukhrul', 'Chingai', 'Kamjong', 'Khambi', 'Phungyar'],
  },

  // ─── Meghalaya ───────────────────────────────────────────────────────────
  'Meghalaya': {
    'East Khasi Hills': ['Shillong', 'Cherrapunji', 'Mairang', 'Mawkyrwat', 'Mawsynram'],
    'West Khasi Hills': ['Nongstoin', 'Mawshynrut', 'Ranikor', 'Riambong', 'Nongkrem'],
    'Ri Bhoi': ['Nongpoh', 'Bhoirymbong', 'Jirang', 'Nongkhlaw', 'Umsning'],
    'East Jaintia Hills': ['Khliehriat', 'Amlarem', 'Lad Rymbai', 'Saipung', 'Thadlaskein'],
    'South Garo Hills': ['Baghmara', 'Ampati', 'Chokpot', 'Mahendraganj', 'Resubelpara'],
    'East Garo Hills': ['Tura', 'Dadengiri', 'Dalu', 'Gambegre', 'Rongjeng'],
  },

  // ─── Mizoram ─────────────────────────────────────────────────────────────
  'Mizoram': {
    'Aizawl': ['Aizawl', 'Darlawn', 'Kolasib', 'Lengpui', 'Thingsulthliah'],
    'Lunglei': ['Lunglei', 'Bunghmun', 'Hnahthial', 'Lungsen', 'Tlabung'],
    'Champhai': ['Champhai', 'Khawbung', 'Ngopa', 'Tlangnuam', 'Zokhawthar'],
    'Serchhip': ['Serchhip', 'Bualpui', 'Keitum', 'Lungrang', 'Thenzawl'],
    'Kolasib': ['Kolasib', 'Bilkhawthlir', 'Kawnpui', 'Thingdawl', 'Vairengte'],
    'Lawngtlai': ['Lawngtlai', 'Bualpui NG', 'Chawngte', 'Sangau', 'Tuipang'],
  },

  // ─── Nagaland ────────────────────────────────────────────────────────────
  'Nagaland': {
    'Kohima': ['Kohima', 'Jakhama', 'Kezo', 'Pherima', 'Tseminyu'],
    'Dimapur': ['Dimapur', 'Chumoukedima', 'Medziphema', 'Niuland', 'Kuhuboto'],
    'Mokokchung': ['Mokokchung', 'Changtongya', 'Impur', 'Japu', 'Longchem'],
    'Wokha': ['Wokha', 'Bhandari', 'Chukitong', 'Mangmetong', 'Ralan'],
    'Zunheboto': ['Zunheboto', 'Akuluto', 'Aghunato', 'Suruhuto', 'Tokiye'],
    'Tuensang': ['Tuensang', 'Longkhim', 'Noklak', 'Sangsangyu', 'Shamator'],
  },

  // ─── Punjab ──────────────────────────────────────────────────────────────
  'Punjab': {
    'Amritsar': ['Amritsar', 'Ajnala', 'Atari', 'Baba Bakala', 'Majitha'],
    'Ludhiana': ['Ludhiana', 'Dehlon', 'Khanna', 'Payal', 'Raikot'],
    'Patiala': ['Patiala', 'Ghanaur', 'Nabha', 'Patran', 'Rajpura'],
    'Jalandhar': ['Jalandhar', 'Adampur', 'Kartarpur', 'Nakodar', 'Phillaur'],
    'Gurdaspur': ['Gurdaspur', 'Batala', 'Dhariwal', 'Fatehgarh Churian', 'Kalanaur'],
    'Bathinda': ['Bathinda', 'Goniana', 'Phul', 'Rampura', 'Sangat'],
    'SAS Nagar': ['Mohali', 'Boothgarh', 'Derabassi', 'Kharar', 'Lalru'],
  },

  // ─── Rajasthan ───────────────────────────────────────────────────────────
  'Rajasthan': {
    'Jaipur': ['Jaipur', 'Amber', 'Bassi', 'Jamwa Ramgarh', 'Sanganer'],
    'Jodhpur': ['Jodhpur', 'Bhopalgarh', 'Luni', 'Osian', 'Shergarh'],
    'Udaipur': ['Udaipur', 'Girwa', 'Kherwara', 'Salumber', 'Vallabhnagar'],
    'Kota': ['Kota', 'Itawa', 'Ladpura', 'Ramganj Mandi', 'Sangod'],
    'Ajmer': ['Ajmer', 'Arain', 'Bhinai', 'Kishangarh', 'Masuda'],
    'Bikaner': ['Bikaner', 'Chhatargarh', 'Dungargarh', 'Kolayat', 'Nokha'],
    'Alwar': ['Alwar', 'Behror', 'Kotkasim', 'Rajgarh', 'Tijara'],
  },

  // ─── Sikkim ──────────────────────────────────────────────────────────────
  'Sikkim': {
    'East Sikkim': ['Gangtok', 'Aritar', 'Gnathang', 'Namcheybong', 'Regu'],
    'West Sikkim': ['Gyalshing', 'Daramdin', 'Dentam', 'Kaluk', 'Tashiding'],
    'North Sikkim': ['Mangan', 'Chungthang', 'Dzongu', 'Lachen', 'Lachung'],
    'South Sikkim': ['Namchi', 'Jorethang', 'Melli', 'Ravangla', 'Temi'],
    'Pakyong': ['Pakyong', 'Machong', 'Makha', 'Rongli', 'Rhenock'],
    'Soreng': ['Soreng', 'Chakung', 'Rinchenpong', 'Sombaria', 'Yuksom'],
  },

  // ─── Tamil Nadu ──────────────────────────────────────────────────────────
  'Tamil Nadu': {
    'Chennai': ['Chennai', 'Ambattur', 'Avadi', 'Perambur', 'Tambaram'],
    'Coimbatore': ['Coimbatore', 'Annur', 'Kinathukadavu', 'Mettupalayam', 'Pollachi'],
    'Madurai': ['Madurai', 'Melur', 'Peraiyur', 'Thirumangalam', 'Usilampatti'],
    'Salem': ['Salem', 'Attur', 'Edappadi', 'Gangavalli', 'Mettur'],
    'Tiruchirappalli': ['Tiruchirappalli', 'Lalgudi', 'Manachanallur', 'Musiri', 'Thuraiyur'],
    'Tirunelveli': ['Tirunelveli', 'Ambasamudram', 'Cheranmahadevi', 'Nanguneri', 'Palayamkottai'],
    'Vellore': ['Vellore', 'Arakonam', 'Gudiyatham', 'Katpadi', 'Walajah'],
  },

  // ─── Telangana ───────────────────────────────────────────────────────────
  'Telangana': {
    'Hyderabad': ['Hyderabad', 'Amberpet', 'Charminar', 'Khairatabad', 'Secunderabad'],
    'Rangareddy': ['Rangareddy', 'Chevella', 'Ibrahimpatnam', 'Maheshwaram', 'Medchal'],
    'Warangal Urban': ['Warangal', 'Geesugonda', 'Hanamkonda', 'Kazipet', 'Narsampet'],
    'Karimnagar': ['Karimnagar', 'Choppadandi', 'Jammikunta', 'Manakondur', 'Sultanabad'],
    'Nizamabad': ['Nizamabad', 'Armoor', 'Balkonda', 'Bodhan', 'Kamareddy'],
    'Khammam': ['Khammam', 'Bhadrachalam', 'Kothagudem', 'Madhira', 'Wyra'],
    'Nalgonda': ['Nalgonda', 'Bhongir', 'Devarakonda', 'Miryalaguda', 'Suryapet'],
  },

  // ─── Tripura ─────────────────────────────────────────────────────────────
  'Tripura': {
    'West Tripura': ['Agartala', 'Jirania', 'Khayerpur', 'Majlishpur', 'Mohanpur'],
    'Sepahijala': ['Bishalgarh', 'Boxanagar', 'Charilam', 'Melaghar', 'Sonamura'],
    'Dhalai': ['Ambassa', 'Gandacherra', 'Kamalpur', 'Manu', 'Rajnagar'],
    'Gomati': ['Udaipur', 'Amarpur', 'Karbook', 'Matabari', 'Ompi'],
    'North Tripura': ['Dharmanagar', 'Kanchanpur', 'Kumarghat', 'Panisagar', 'Pencharthal'],
    'Unakoti': ['Kailashahar', 'Chandipur', 'Gournagar', 'Jubarajnagar', 'Pabiacherra'],
  },

  // ─── Uttar Pradesh ───────────────────────────────────────────────────────
  'Uttar Pradesh': {
    'Lucknow': ['Lucknow', 'Bakshi Ka Talab', 'Chinhat', 'Malihabad', 'Mohanlalganj'],
    'Varanasi': ['Varanasi', 'Arajiline', 'Chiraigaon', 'Harhua', 'Pindra'],
    'Agra': ['Agra', 'Bah', 'Fatehabad', 'Kheragarh', 'Samsabad'],
    'Kanpur Nagar': ['Kanpur', 'Bilhaur', 'Ghatampur', 'Kalyanpur', 'Sachendi'],
    'Prayagraj': ['Prayagraj', 'Bara', 'Chaka', 'Handia', 'Koraon'],
    'Gorakhpur': ['Gorakhpur', 'Bansgaon', 'Campierganj', 'Gola', 'Sahjanwa'],
    'Meerut': ['Meerut', 'Hapur', 'Kharkhauda', 'Machhara', 'Sardhana'],
  },

  // ─── Uttarakhand ─────────────────────────────────────────────────────────
  'Uttarakhand': {
    'Dehradun': ['Dehradun', 'Chakrata', 'Doiwala', 'Raipur', 'Rishikesh'],
    'Haridwar': ['Haridwar', 'Bhagwanpur', 'Laksar', 'Roorkee', 'Rurki Kasba'],
    'Nainital': ['Nainital', 'Betalghat', 'Dhikuli', 'Haldwani', 'Kotabag'],
    'Udham Singh Nagar': ['Rudrapur', 'Bajpur', 'Gadarpur', 'Jaspur', 'Kichha'],
    'Almora': ['Almora', 'Bhikiyasain', 'Dwarahat', 'Ranikhet', 'Salt'],
    'Pauri Garhwal': ['Pauri', 'Dugadda', 'Kotdwar', 'Lansdowne', 'Thalisain'],
    'Chamoli': ['Gopeshwar', 'Joshimath', 'Karnaprayag', 'Pokhari', 'Tharali'],
  },

  // ─── Andaman & Nicobar Islands (UT) ─────────────────────────────────────
  'Andaman & Nicobar Islands': {
    'North & Middle Andaman': ['Diglipur', 'Ferrargunj', 'Mayabunder', 'Rangat', 'Aerial Bay'],
    'South Andaman': ['Port Blair', 'Bambooflat', 'Ferrargunj', 'Humfreygunj', 'Prothrapur'],
    'Nicobar': ['Car Nicobar', 'Campbell Bay', 'Kamorta', 'Nancowry', 'Teressa'],
  },

  // ─── Chandigarh (UT) ─────────────────────────────────────────────────────
  'Chandigarh': {
    'Chandigarh': ['Sector 1-17', 'Sector 18-35', 'Sector 36-56', 'Industrial Area', 'Mani Majra'],
  },

  // ─── Dadra & Nagar Haveli (UT) ───────────────────────────────────────────
  'Dadra & Nagar Haveli': {
    'Dadra & Nagar Haveli': ['Silvassa', 'Amli', 'Khanvel', 'Naroli', 'Sayli'],
  },

  // ─── Daman & Diu (UT) ────────────────────────────────────────────────────
  'Daman & Diu': {
    'Daman': ['Daman', 'Bhimpore', 'Dabhel', 'Kachigam', 'Moti Daman'],
    'Diu': ['Diu', 'Bucharwada', 'Ghoghla', 'Nagoa', 'Vanakbara'],
  },

  // ─── Delhi (UT) ──────────────────────────────────────────────────────────
  'Delhi': {
    'Central Delhi': ['Connaught Place', 'Daryaganj', 'Karol Bagh', 'Paharganj', 'Rajendra Nagar'],
    'East Delhi': ['Geeta Colony', 'Laxmi Nagar', 'Patparganj', 'Preet Vihar', 'Shahdara'],
    'North Delhi': ['Burari', 'Civil Lines', 'Kohat Enclave', 'Mukherjee Nagar', 'Narela'],
    'North East Delhi': ['Ghonda', 'Mustafabad', 'Nand Nagri', 'Seemapuri', 'Seelampur'],
    'South Delhi': ['Defence Colony', 'Hauz Khas', 'Kalkaji', 'Lajpat Nagar', 'Mehrauli'],
    'West Delhi': ['Janakpuri', 'Moti Nagar', 'Palam', 'Punjabi Bagh', 'Uttam Nagar'],
    'South West Delhi': ['Bijwasan', 'Dwarka', 'Kapashera', 'Najafgarh', 'Sagarpur'],
  },

  // ─── Ladakh (UT) ─────────────────────────────────────────────────────────
  'Ladakh': {
    'Leh': ['Leh', 'Chuchul', 'Nubra', 'Nyoma', 'Saspol'],
    'Kargil': ['Kargil', 'Drass', 'Sankoo', 'Shakar Chiktan', 'Zanskar'],
  },

  // ─── Lakshadweep (UT) ────────────────────────────────────────────────────
  'Lakshadweep': {
    'Lakshadweep': ['Kavaratti', 'Agatti', 'Amini', 'Andrott', 'Minicoy'],
  },

  // ─── Puducherry (UT) ─────────────────────────────────────────────────────
  'Puducherry': {
    'Puducherry': ['Puducherry', 'Ariyankuppam', 'Bahour', 'Mannadipet', 'Villianur'],
    'Karaikal': ['Karaikal', 'Kottucherry', 'Nedungadu', 'Neravy', 'Thirunallar'],
    'Mahe': ['Mahe', 'Chalakara', 'Pandakkal', 'Payyambalam', 'Thillai Nagar'],
    'Yanam': ['Yanam', 'Boddu Vanka', 'Colaga', 'Gorinta', 'Mettakaveti'],
  },
};

/**
 * Get districts for a given state
 * @param {string} state
 * @returns {string[]}
 */
export function getDistricts(state) {
  if (!state || !LOCATION_HIERARCHY[state]) return [];
  return Object.keys(LOCATION_HIERARCHY[state]);
}

/**
 * Get local areas for a given state + district
 * @param {string} state
 * @param {string} district
 * @returns {string[]}
 */
export function getLocalAreas(state, district) {
  if (!state || !district) return [];
  const stateData = LOCATION_HIERARCHY[state];
  if (!stateData || !stateData[district]) return [];
  return stateData[district];
}

export const ALL_STATES = Object.keys(LOCATION_HIERARCHY);
