//Bookmarks helper functions - stored in localstorage for now
export function getBookmarks() {
  const saved = localStorage.getItem('zeroup_bookmarks');
  return saved ? JSON.parse(saved) : [];
}

export function toggleBookmark(bookId) {
  const current = getBookmarks();
  const exists = current.includes(bookId);
  const updated = exists
    ? current.filter((id) => id !== bookId)
    : [...current, bookId];
  localStorage.setItem('zeroup_bookmarks', JSON.stringify(updated));
  return updated;
}
export function isBookmarked(bookId) {
  return getBookmarks().includes(bookId);
}

export const MOCK_BOOKS = [
  {
    id: '1', title: 'Anansi the Spider', author: 'Kwame Mensah',
    language: 'English', level: 'Beginner',
    totalPages: 12, currentPage: 5,
    content: [
      "Anansi was a clever spider who loved stories. He lived in a great forest where all the animals gathered to share tales.",
      "One day, Anansi decided he wanted to own all the stories in the world. He climbed up to where the Sky God lived.",
      "\"Sky God,\" said Anansi, \"I want to buy your stories.\" The Sky God laughed. \"Many kings have tried. What can a small spider offer?\"",
      "\"Name your price,\" said Anansi boldly. The Sky God thought for a moment. \"Bring me Onini the Python, Osebo the Leopard, and the Mmoboro Hornets.\"",
      "Anansi smiled and set off. He was small, but he was clever — and cleverness was the greatest power of all.",
    ],
  },
  {
    id: '2', title: 'Simba na Ndoto Yake', author: 'Fatuma Njoroge',
    language: 'Swahili', level: 'Beginner',
    totalPages: 10,
    content: [
      "Simba alikuwa simba mdogo aliyeishi kwenye savanna kubwa. Alikuwa na ndoto moja kubwa — kutaka kuruka juu ya mawingu.",
      "Kila siku, Simba alitazama angani na kusema, \"Siku moja, nitafika huko juu.\"",
      "Mama yake alimwambia, \"Simba, simama imara. Nguvu yako ipo ardhini, si angani.\"",
      "Lakini Simba hakusikia. Alikimbia, akaruka, akapanda mlima mrefu zaidi kwenye savanna.",
      "Alipofika juu ya mlima, aliona wingu moja karibu sana. Akagusa kwa mkono wake. Baridi. Laini. Halisi.",
    ],
  },
  {
    id: '3', title: 'Adébáyọ̀ àti Àárọ̀ Tuntun', author: 'Bisi Adeyemi',
    language: 'Yoruba', level: 'Intermediate',
    totalPages: 14,
    content: [
      "Adébáyọ̀ jí ni àárọ̀ kutukutu. Ojú ọ̀run ṣì ń mọ́lẹ̀, ṣùgbọ́n ọkàn rẹ̀ ti jí.",
      "\"Ọjọ́ tuntun, àǹfààní tuntun,\" ni ìyá rẹ̀ sọ. Adébáyọ̀ rẹ̀rìn-ín.",
      "Ó wọ aṣọ rẹ̀, jẹ oúnjẹ àárọ̀ rẹ̀, ó sì gba àpò ìwé rẹ̀. Ọjọ́ ìwé ni lónìí.",
      "Ní ọ̀nà, ó pàdé Tunde ọrẹ rẹ̀. \"Ṣé o ti ṣe iṣẹ́ inú ìwé?\" ni Tunde béèrè.",
      "Adébáyọ̀ rẹ̀rìn-ín tí ó sì sọ pé, \"Mo ṣe rẹ̀. Jẹ ká lọ.\" Wọn sáré lọ sí ilé ẹ̀kọ́ papọ̀.",
    ],
  },
  {
    id: '4', title: 'UNomvula noMvula', author: 'Thandi Dlamini',
    language: 'Zulu', level: 'Beginner',
    totalPages: 8,
    content: [
      "UNomvula wathanda imvula. Igama lakhe lalitsho lokho — umuntu womvula.",
      "Ngelanga elilodwa, izulu laba mnyama. Izintaba zagcwala amafu amnyama njengemvu.",
      "\"Izeza!\" wamemeza uNomvula. Wagijima waya ngaphandle. Izitsha zakhe zamdinga.",
      "Imvula yawa. Yawa njengemvula enkulu nenethezekile. UNomvula wavula izandla zakhe.",
      "Umama wakhe wamemeza ekungeneni. UNomvula wasebenza, wamemeza ukushaya komuntu. Wabuya phakathi, engene ngelisisi.",
    ],
  },
  {
    id: '5', title: 'Kouamé et le Baobab Magique', author: 'Aya Koné',
    language: 'French', level: 'Intermediate',
    totalPages: 16,
    content: [
      "Kouamé avait sept ans et il habitait près du plus grand baobab du village.",
      "Les anciens disaient que l'arbre était magique. Kouamé ne savait pas si c'était vrai.",
      "Un matin, il entendit quelque chose. Une voix douce, comme le vent dans les feuilles.",
      "\"Qui es-tu?\" chuchota Kouamé. \"Je suis aussi vieux que la terre,\" répondit la voix.",
      "Kouamé s'assit au pied du baobab et écouta. L'arbre lui raconta toutes les histoires du monde.",
    ],
  },
  {
    id: '6', title: 'The River Sings', author: 'Aisha Mwangi',
    language: 'English', level: 'Advanced',
    totalPages: 24,
    content: [
      "The river had a name before the village did. Before the first hut was built, before the first fire was lit, the river sang.",
      "Amara heard it every morning when she went to collect water. The other girls chattered and laughed, but Amara listened.",
      "\"What does it say?\" her grandmother asked one evening, watching Amara's face.",
      "\"It says something is coming,\" Amara replied quietly. \"Something large and slow and very old.\"",
      "Her grandmother nodded. She had heard the river say the same thing, seventy years before.",
    ],
  },
];

export const MOCK_USER = {
  id: '1',
  name: 'Amina Osei',
  email: 'amina@example.com',
  role: 'reader',
  booksCompleted: 7,
  dayStreak: 12,
  pagesRead: 284,
  readingGoal: 4,
  preferredLanguage: 'English',
  inProgress: [MOCK_BOOKS[0], MOCK_BOOKS[1]],
  completed: [MOCK_BOOKS[2], MOCK_BOOKS[4]],
  bookmarks: [MOCK_BOOKS[3], MOCK_BOOKS[5]],
};

export const MOCK_STATS = {
  totalUsers: 5247,
  totalBooks: 138,
  booksReadThisWeek: 412,
  completionsThisWeek: 89,
  topBooks: MOCK_BOOKS.slice(0, 5),
  byLanguage: [
    { language: 'English', reads: 1842 },
    { language: 'Swahili', reads: 973 },
    { language: 'Yoruba',  reads: 654 },
    { language: 'Zulu',    reads: 489 },
    { language: 'French',  reads: 391 },
  ],
  byLevel: [
    { level: 'Beginner',     value: 52 },
    { level: 'Intermediate', value: 31 },
    { level: 'Advanced',     value: 17 },
  ],
};
