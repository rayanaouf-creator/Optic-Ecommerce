export interface Wilaya {
  code: string;
  name: string;
  arabicName: string;
  communes: string[];
}

export const ALGERIA_WILAYAS: Wilaya[] = [
  {
    code: '01',
    name: 'Adrar',
    arabicName: 'أدرار',
    communes: ['Adrar', 'Reggane', 'Timokten', 'Fenoughil', 'Zaouiet Kounta', 'Aoulef', 'Tsabit', 'Tamest', 'Bouda', 'Tittaf']
  },
  {
    code: '02',
    name: 'Chlef',
    arabicName: 'الشلف',
    communes: ['Chlef', 'Abou El Hassan', 'Ain Merane', 'Beni Haoua', 'Boukadir', 'Chettia', 'El Karimia', 'El Marsa', 'Oued Fodda', 'Ouled Fares', 'Ténès', 'Taougrit', 'Sendjas', 'Zeboudja']
  },
  {
    code: '03',
    name: 'Laghouat',
    arabicName: 'الأغواط',
    communes: ['Laghouat', 'Aflou', 'Ain Madhi', 'Brida', 'El Ghicha', 'Gueltat Sidi Saad', 'Hassi Delaa', 'Hassi R\'Mel', 'Ksar El Hirane', 'Oued Morra', 'Sidi Makhlouf']
  },
  {
    code: '04',
    name: 'Oum El Bouaghi',
    arabicName: 'أم البواقي',
    communes: ['Oum El Bouaghi', 'Ain Beida', 'Ain Fakroun', 'Ain Kercha', 'Ain M\'lila', 'Ain Zitoun', 'Berriche', 'Dhalaa', 'Fkirina', 'Ksar Sbahi', 'Meskiana', 'Sigus']
  },
  {
    code: '05',
    name: 'Batna',
    arabicName: 'باتنة',
    communes: ['Batna', 'Ain Touta', 'Arris', 'Barika', 'Chemora', 'Djerma', 'El Madher', 'Fesdis', 'Merouana', 'N\'Gaous', 'Ras El Aioun', 'Tazoult', 'Timgad']
  },
  {
    code: '06',
    name: 'Béjaïa',
    arabicName: 'بجاية',
    communes: ['Béjaïa', 'Akbou', 'Amizour', 'Aokas', 'Barbacha', 'Chemini', 'Darguina', 'El Kseur', 'Ighil Ali', 'Kherrata', 'Ouzellaguen', 'Seddouk', 'Sidi Aïch', 'Souk El Ténine', 'Tazmalt', 'Tichy', 'Timezrit']
  },
  {
    code: '07',
    name: 'Biskra',
    arabicName: 'بسكرة',
    communes: ['Biskra', 'Chetma', 'El Hadjab', 'El Kantara', 'El Outaya', 'Foughala', 'M\'Chouneche', 'Oumache', 'Ourlal', 'Sidi Okba', 'Tolga', 'Zeribet El Oued']
  },
  {
    code: '08',
    name: 'Béchar',
    arabicName: 'بشار',
    communes: ['Béchar', 'Abadla', 'Erg Ferradj', 'Kenadsa', 'Lahmar', 'Mechraa Houari Boumedienne', 'Mougheul', 'Taghit', 'Tabelbala']
  },
  {
    code: '09',
    name: 'Blida',
    arabicName: 'البليدة',
    communes: ['Blida', 'Boufarik', 'Bougara', 'Bouinan', 'Chebli', 'Chiffa', 'Chréa', 'El Affroun', 'Guerrouaou', 'Meftah', 'Mouzaia', 'Oued Alleug', 'Ouled Yaich', 'Soumaa']
  },
  {
    code: '10',
    name: 'Bouira',
    arabicName: 'البويرة',
    communes: ['Bouira', 'Ain Bessem', 'Bechloul', 'Bir Ghbalou', 'Bordj Okhriss', 'Dechmia', 'Dirah', 'El Hachimia', 'Haizer', 'Kadiria', 'Lakhdaria', 'M\'Chedallah', 'Sour El Ghozlane', 'Taghzout']
  },
  {
    code: '11',
    name: 'Tamanrasset',
    arabicName: 'تمنراست',
    communes: ['Tamanrasset', 'Abalessa', 'Idles', 'Tazrouk']
  },
  {
    code: '12',
    name: 'Tébessa',
    arabicName: 'تبسة',
    communes: ['Tébessa', 'Bir El Ater', 'Cheria', 'El Aouinet', 'El Kouif', 'El Ma Labiodh', 'Hammamet', 'Morsott', 'Negrine', 'Ouenza', 'Ogla Melha']
  },
  {
    code: '13',
    name: 'Tlemcen',
    arabicName: 'تلمسان',
    communes: ['Tlemcen', 'Ain Youcef', 'Bab El Assa', 'Beni Boussaid', 'Beni Saf', 'Chetouane', 'Ghazaouet', 'Hennaya', 'Maghnia', 'Mansourah', 'Nedroma', 'Ouled Mimoun', 'Remchi', 'Sabra', 'Sebdou', 'Sidi Djillali']
  },
  {
    code: '14',
    name: 'Tiaret',
    arabicName: 'تيارت',
    communes: ['Tiaret', 'Ain Deheb', 'Dahmouni', 'Frenda', 'Hamadia', 'Ksar Chellala', 'Mahdia', 'Mechraa Safa', 'Medrissa', 'Oued Lilli', 'Rahouia', 'Sougueur']
  },
  {
    code: '15',
    name: 'Tizi Ouzou',
    arabicName: 'تيزي وزو',
    communes: ['Tizi Ouzou', 'Azazga', 'Azeffoun', 'Beni Douala', 'Boghni', 'Draa Ben Khedda', 'Draa El Mizan', 'Larbaa Nath Irathen', 'Makouda', 'Mekla', 'Ouadhia', 'Ouaguenoun', 'Tigzirt']
  },
  {
    code: '16',
    name: 'Alger',
    arabicName: 'الجزائر العاصمة',
    communes: [
      'Alger-Centre', 'Bab El Oued', 'Casbah', 'Sidi M\'Hamed', 'El Madania', 'Belouizdad',
      'El Biar', 'Hydra', 'Ben Aknoun', 'El Mouradia', 'Bouzareah', 'Bab Ezzouar', 
      'Bordj El Kiffan', 'Dar El Beïda', 'Kouba', 'Hussein Dey', 'Bir Mourad Raïs', 
      'Birkhadem', 'Dely Ibrahim', 'Cheraga', 'Ain Benian', 'Staoueli', 'Zeralda', 
      'Rouiba', 'Reghaia', 'Birtouta', 'Baraki', 'El Harrach', 'Oued Smar', 'Mohammedia', 
      'Draria', 'Saoula', 'Khraicia', 'Bachdjerrah', 'Bordj El Bahri', 'El Achour', 'Ouled Fayet'
    ]
  },
  {
    code: '17',
    name: 'Djelfa',
    arabicName: 'الجلفة',
    communes: ['Djelfa', 'Ain El Ibel', 'Ain Oussera', 'Birine', 'Charef', 'Dar Chioukh', 'El Idrissia', 'Faidh El Botma', 'Had Sahary', 'Hassi Bahbah', 'Messaad', 'Sidi Ladjel']
  },
  {
    code: '18',
    name: 'Jijel',
    arabicName: 'جيجل',
    communes: ['Jijel', 'Chekfa', 'Djimla', 'El Ancer', 'El Aouana', 'El Milia', 'Kaous', 'Settara', 'Sidi Abdelaziz', 'Taher', 'Texenna', 'Ziama Mansouriah']
  },
  {
    code: '19',
    name: 'Sétif',
    arabicName: 'سطيف',
    communes: ['Sétif', 'Ain Arnat', 'Ain Azel', 'Ain El Kebira', 'Ain Oulmene', 'Amoucha', 'Babor', 'Beni Aziz', 'Beni Ouartilane', 'Bouandas', 'Bougaa', 'El Eulma', 'Guellal', 'Hammam Guergour', 'Saleh Bey']
  },
  {
    code: '20',
    name: 'Saïda',
    arabicName: 'سعيدة',
    communes: ['Saïda', 'Ain El Hadjar', 'Doui Thabet', 'El Hassasna', 'Ouled Brahim', 'Sidi Boubekeur', 'Youb']
  },
  {
    code: '21',
    name: 'Skikda',
    arabicName: 'سكيكدة',
    communes: ['Skikda', 'Ain Charchar', 'Azzaba', 'Ben Azzouz', 'Collo', 'El Hadaiek', 'El Harrouch', 'Filfila', 'Ramdane Djamel', 'Sidi Mezghiche', 'Tamalous', 'Zitouna']
  },
  {
    code: '22',
    name: 'Sidi Bel Abbès',
    arabicName: 'سيدي بلعباس',
    communes: ['Sidi Bel Abbès', 'Ain El Berd', 'Ben Badis', 'Marhoum', 'Merine', 'Mostefa Ben Brahim', 'Moulay Slissen', 'Ras El Ma', 'Sfisef', 'Sidi Ali Benyoub', 'Telagh', 'Tenira']
  },
  {
    code: '23',
    name: 'Annaba',
    arabicName: 'عنابة',
    communes: ['Annaba', 'Berrahal', 'Cheurfa', 'El Bouni', 'El Hadjar', 'Oued El Aneb', 'Seraïdi', 'Sidi Amar', 'Tréat']
  },
  {
    code: '24',
    name: 'Guelma',
    arabicName: 'قالمة',
    communes: ['Guelma', 'Ain Hessainia', 'Belkheir', 'Bouchegouf', 'Guelaat Bou Sbaa', 'Hammam Debagh', 'Hammam N\'Bail', 'Heliopolis', 'Khezaras', 'Oued Zenati', 'Roknia']
  },
  {
    code: '25',
    name: 'Constantine',
    arabicName: 'قسنطينة',
    communes: ['Constantine', 'Ain Abid', 'Ain Smara', 'Ben Badis', 'Didouche Mourad', 'El Khroub', 'Hamma Bouziane', 'Ibn Ziad', 'Ouled Rahmoune', 'Zighoud Youcef']
  },
  {
    code: '26',
    name: 'Médéa',
    arabicName: 'المدية',
    communes: ['Médéa', 'Ain Boucif', 'Aziz', 'Beni Slimane', 'Berrouaghia', 'Chahbounia', 'Chellalat El Adhoura', 'El Omaria', 'Guelb El Kebir', 'Ksar El Boukhari', 'Ouamri', 'Ouzera', 'Seghouane', 'Si Mahdjoub', 'Tablat']
  },
  {
    code: '27',
    name: 'Mostaganem',
    arabicName: 'مستغانم',
    communes: ['Mostaganem', 'Abdelmalek Ramdane', 'Ain Nouissy', 'Ain Tedeles', 'Bouguirat', 'Chaabai', 'Hassi Mameche', 'Kheir Eddine', 'Mesra', 'Sidi Ali', 'Sidi Lakhdar', 'Stidia']
  },
  {
    code: '28',
    name: 'M\'Sila',
    arabicName: 'المسيلة',
    communes: ['M\'Sila', 'Ain El Hadjel', 'Ain El Melh', 'Ben Srour', 'Bou Saada', 'Chellal', 'Djebel Messaad', 'Hammam Dhalaa', 'Khoubana', 'Medjedel', 'Ouled Derradj', 'Ouled Sidi Brahim', 'Sidi Aissa']
  },
  {
    code: '29',
    name: 'Mascara',
    arabicName: 'معسكر',
    communes: ['Mascara', 'Ain Fares', 'Bouhanifia', 'El Bordj', 'Ghriss', 'Hachem', 'Mohammadia', 'Oggaz', 'Ouled Teghia', 'Sig', 'Tighennif', 'Tizi', 'Zahana']
  },
  {
    code: '30',
    name: 'Ouargla',
    arabicName: 'ورقلة',
    communes: ['Ouargla', 'Ain Beida', 'El Borma', 'El Hadjira', 'Hassi Ben Abdellah', 'Hassi Messaoud', 'N\'Goussa', 'Rouissat', 'Sidi Khouiled', 'Taibet']
  },
  {
    code: '31',
    name: 'Oran',
    arabicName: 'وهران',
    communes: [
      'Oran', 'Ain El Turk', 'Arzew', 'Bethioua', 'Bir El Djir', 'Bousfer', 'El Ancor', 
      'El Braya', 'Es Senia', 'Gdyel', 'Hassi Ben Okba', 'Hassi Bounif', 'Hassi Mefsoukh', 
      'Marsat El Hadjadj', 'Mers El Kebir', 'Misserghin', 'Oued Tlelat', 'Sidi Chami', 'Tafraoui'
    ]
  },
  {
    code: '32',
    name: 'El Bayadh',
    arabicName: 'البيض',
    communes: ['El Bayadh', 'Boualem', 'Bougtoub', 'Boussemghoun', 'Brezina', 'Cheguig', 'Chellala', 'El Abiodh Sidi Cheikh', 'Rogassa', 'Sidi Amar']
  },
  {
    code: '33',
    name: 'Illizi',
    arabicName: 'إليزي',
    communes: ['Illizi', 'Bordj Omar Driss', 'Debdeb', 'In Amenas']
  },
  {
    code: '34',
    name: 'Bordj Bou Arréridj',
    arabicName: 'برج بوعريريج',
    communes: ['Bordj Bou Arréridj', 'Ain Taghrout', 'Bir Kasdali', 'Bordj Ghedir', 'Bordj Zemoura', 'Djaafra', 'El Achir', 'El Anseur', 'El Hamadia', 'Khelil', 'Mansoura', 'Medjana', 'Ras El Oued']
  },
  {
    code: '35',
    name: 'Boumerdès',
    arabicName: 'بومرداس',
    communes: ['Boumerdès', 'Baghlia', 'Bordj Menaiel', 'Boudouaou', 'Chabet El Ameur', 'Corso', 'Dellys', 'Isser', 'Khemis El Khechna', 'Larbatache', 'Naciria', 'Ouled Moussa', 'Si Mustapha', 'Thénia', 'Tidjelabine', 'Zemmouri']
  },
  {
    code: '36',
    name: 'El Tarf',
    arabicName: 'الطارف',
    communes: ['El Tarf', 'Ben M\'Hidi', 'Besbes', 'Bouhadjar', 'Bouteldja', 'Chatt', 'Dréan', 'El Kala', 'Lac des Oiseaux', 'Raml Souk', 'Zitouna']
  },
  {
    code: '37',
    name: 'Tindouf',
    arabicName: 'تندوف',
    communes: ['Tindouf', 'Oum El Assel']
  },
  {
    code: '38',
    name: 'Tissemsilt',
    arabicName: 'تيسمسيلت',
    communes: ['Tissemsilt', 'Ammari', 'Bordj Bou Naama', 'Bordj El Emir Abdelkader', 'Khemisti', 'Lardjem', 'Lazharia', 'Theniet El Had']
  },
  {
    code: '39',
    name: 'El Oued',
    arabicName: 'الوادي',
    communes: ['El Oued', 'Bayadha', 'Debila', 'El Ogla', 'Guemar', 'Hassi Khelifa', 'Kouinine', 'Magrane', 'Mih Ouansa', 'Reguiba', 'Robbah', 'Taleb Larbi']
  },
  {
    code: '40',
    name: 'Khenchela',
    arabicName: 'خنشلة',
    communes: ['Khenchela', 'Ain Touila', 'Babar', 'Baghai', 'Bouhmama', 'Chechar', 'El Hamma', 'Kais', 'M\'Sara', 'Ouled Rechache', 'Remila']
  },
  {
    code: '41',
    name: 'Souk Ahras',
    arabicName: 'سوق أهراس',
    communes: ['Souk Ahras', 'Bir Bouhouche', 'Haddada', 'Hanencha', 'M\'Daourouch', 'Mechroha', 'Merahna', 'Ouled Driss', 'Oum El Adhaim', 'Sedrata', 'Taoura', 'Zaarouria']
  },
  {
    code: '42',
    name: 'Tipaza',
    arabicName: 'تيبازة',
    communes: ['Tipaza', 'Ahmar El Ain', 'Ain Tagourait', 'Bou Ismail', 'Cherchell', 'Damous', 'Douaouda', 'Fouka', 'Gouraya', 'Hadjout', 'Khemisti', 'Koléa', 'Menaceur', 'Nador', 'Sidi Amar', 'Sidi Ghiles']
  },
  {
    code: '43',
    name: 'Mila',
    arabicName: 'ميلة',
    communes: ['Mila', 'Ain Beida Harriche', 'Grarem Gouga', 'Ferdjioua', 'Oued Endja', 'Rouached', 'Sidi Merouane', 'Tadjenanet', 'Teleghma', 'Zeghaia']
  },
  {
    code: '44',
    name: 'Aïn Defla',
    arabicName: 'عين الدفلى',
    communes: ['Aïn Defla', 'Ain Lechiekh', 'Bathia', 'Bordj Emir Khaled', 'Djelida', 'Djendel', 'El Amra', 'El Attaf', 'El Khemis', 'Hammam Righa', 'Khemis Miliana', 'Miliana', 'Rouina']
  },
  {
    code: '45',
    name: 'Naâma',
    arabicName: 'النعامة',
    communes: ['Naâma', 'Ain Sefra', 'Asla', 'Djenienne Bourezg', 'El Biodh', 'Mecheria', 'Moghrar', 'Sfissifa', 'Tiout']
  },
  {
    code: '46',
    name: 'Aïn Témouchent',
    arabicName: 'عين تموشنت',
    communes: ['Aïn Témouchent', 'Ain El Arbaa', 'Ain Kihal', 'Beni Saf', 'El Amria', 'El Malah', 'Hammam Bou Hadjar', 'Oulhaca El Gheraba', 'Sidi Ben Adda']
  },
  {
    code: '47',
    name: 'Ghardaïa',
    arabicName: 'غرداية',
    communes: ['Ghardaïa', 'Berriane', 'Bounoura', 'Daya Ben Dahoua', 'El Atteuf', 'Guerrara', 'Mansoura', 'Metlili', 'Sebseb', 'Zelfana']
  },
  {
    code: '48',
    name: 'Relizane',
    arabicName: 'غليزان',
    communes: ['Relizane', 'Ain Tarek', 'Ammi Moussa', 'Djidioua', 'El Hamadna', 'El Matmar', 'Mazouna', 'Mendes', 'Oued Rhiou', 'Ramka', 'Sidi M\'Hamed Ben Ali', 'Yellel', 'Zemmoura']
  },
  {
    code: '49',
    name: 'Timimoun',
    arabicName: 'تيميمون',
    communes: ['Timimoun', 'Aougrout', 'Charouine', 'Deldoul', 'Ksar Kaddour', 'Ouled Said', 'Talmine', 'Tinerkouk']
  },
  {
    code: '50',
    name: 'Bordj Badji Mokhtar',
    arabicName: 'برج باجي مختار',
    communes: ['Bordj Badji Mokhtar', 'Timiaouine']
  },
  {
    code: '51',
    name: 'Ouled Djellal',
    arabicName: 'أولاد جلال',
    communes: ['Ouled Djellal', 'Chaiba', 'Doucen', 'Ras El Miaad', 'Sidi Khaled']
  },
  {
    code: '52',
    name: 'Béni Abbès',
    arabicName: 'بني عباس',
    communes: ['Béni Abbès', 'El Ouata', 'Igli', 'Kerzaz', 'Ksabi', 'Ouled Khoudir', 'Tabelbala', 'Tamtert', 'Timoudi']
  },
  {
    code: '53',
    name: 'In Salah',
    arabicName: 'عين صالح',
    communes: ['In Salah', 'Foggaret Ezzoua', 'In Ghar']
  },
  {
    code: '54',
    name: 'In Guezzam',
    arabicName: 'عين قزام',
    communes: ['In Guezzam', 'Tin Zaouatine']
  },
  {
    code: '55',
    name: 'Touggourt',
    arabicName: 'تقرت',
    communes: ['Touggourt', 'Benaceur', 'Blidet Amor', 'El Alia', 'El Hadjira', 'Megarine', 'Nezla', 'Taibet', 'Tebesbest', 'Temacine', 'Zaouia El Abidia']
  },
  {
    code: '56',
    name: 'Djanet',
    arabicName: 'جانت',
    communes: ['Djanet', 'Bordj El Haouas']
  },
  {
    code: '57',
    name: 'El M\'Ghair',
    arabicName: 'المغير',
    communes: ['El M\'Ghair', 'Djamaa', 'M\'Rara', 'Oum Touyour', 'Sidi Amrane', 'Sidi Khelil', 'Still', 'Tendla']
  },
  {
    code: '58',
    name: 'El Meniaa',
    arabicName: 'المنيعة',
    communes: ['El Meniaa', 'Hassi Gara', 'Hassi Fehal']
  }
];
