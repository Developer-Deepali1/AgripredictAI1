/**
 * India location hierarchy: State → District → Local Areas (Blocks/Taluks)
 *
 * Currently covers: Bihar, Odisha, West Bengal.
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
