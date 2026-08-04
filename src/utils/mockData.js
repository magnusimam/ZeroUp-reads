// Canonical category taxonomy — kept in sync with AdminCMSPage.jsx's CATEGORIES
// select options so a book uploaded in admin always matches a category browsable here.
export const BOOK_CATEGORIES = [
  'Storybooks', 'Science', 'Technology', 'History', 'Mathematics', 'Health', 'Arts', 'Language & Culture',
];

// Canonical book-language taxonomy — kept in sync with AdminCMSPage.jsx's
// LANGUAGES select options so a book uploaded in admin always uses a language
// from the same list. Distinct from any site-UI-locale selector (e.g.
// LibraryHeader's display-language dropdown) — this is about what language a
// book's *content* is written in, not what language the site chrome renders in.
export const BOOK_LANGUAGES = [
  'English', 'Swahili', 'Yoruba', 'Zulu', 'French', 'Hausa', 'Igbo', 'Pidgin',
];

// `attributes` is an extensible metadata bag (Schema-Driven Design) for future
// fields — audio narration, certification — that shouldn't force a core-shape
// change or a migration of every existing book when they're added.
export const MOCK_BOOKS = [
  {
    id: '1', title: 'Anansi the Spider', author: 'Kwame Mensah',
    language: 'English', level: 'Beginner',
    totalPages: 12, currentPage: 5,
    category: 'Storybooks', ageGroup: 'Children', rating: 4.8, reads: 3120,
    description: "A clever spider sets out to buy every story in the world from the Sky God himself.",
    isEducational: false,
    attributes: { theme: 'Folktales & Legends' },
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
    category: 'Storybooks', ageGroup: 'Children', rating: 4.6, reads: 2430,
    description: "A young lion climbs the tallest mountain on the savanna, chasing a dream to touch the clouds.",
    isEducational: false,
    attributes: { theme: 'Adventure' },
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
    category: 'Language & Culture', ageGroup: 'Young Adult', rating: 4.4, reads: 1580,
    description: "A gentle morning-in-the-life story following Adébáyọ̀ and his best friend on the walk to school.",
    isEducational: true,
    attributes: {},
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
    category: 'Science', ageGroup: 'Children', rating: 4.5, reads: 1960,
    description: "A curious girl named after the rain learns how storm clouds gather and why the rain falls.",
    isEducational: true,
    attributes: {},
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
    category: 'Language & Culture', ageGroup: 'Young Adult', rating: 4.9, reads: 2710,
    description: "Beneath the village's oldest baobab, a boy discovers the tree remembers every story ever told.",
    isEducational: false,
    attributes: { theme: 'Fantasy' },
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
    category: 'History', ageGroup: 'Student', rating: 4.7, reads: 1340,
    description: "A meditation on memory and oral history, told through three generations of women by the same river.",
    isEducational: true,
    attributes: {},
    content: [
      "The river had a name before the village did. Before the first hut was built, before the first fire was lit, the river sang.",
      "Amara heard it every morning when she went to collect water. The other girls chattered and laughed, but Amara listened.",
      "\"What does it say?\" her grandmother asked one evening, watching Amara's face.",
      "\"It says something is coming,\" Amara replied quietly. \"Something large and slow and very old.\"",
      "Her grandmother nodded. She had heard the river say the same thing, seventy years before.",
    ],
  },
  {
    id: '7', title: 'Zola and the Star Map', author: 'Kagiso Molefe',
    language: 'English', level: 'Advanced',
    totalPages: 20,
    category: 'Science', ageGroup: 'Student', rating: 4.9, reads: 2050,
    description: "Using nothing but her grandfather's hand-drawn star charts, Zola learns to navigate by the night sky.",
    isEducational: true,
    attributes: {},
    content: [
      "Zola's grandfather kept a leather notebook filled with stars — not photographs, but careful ink drawings of the sky.",
      "\"The sky doesn't lie,\" he told her. \"Learn to read it, and you will never truly be lost.\"",
      "She began with the brightest points first: the ones that stayed in the same place all year, patient as old friends.",
      "Slowly, the scattered dots became shapes, and the shapes became a map — one older than any road.",
      "The night the power went out across the whole village, Zola was the only one who wasn't afraid of the dark.",
    ],
  },
  {
    id: '8', title: "The Chameleon's Colours", author: 'Grace Achieng',
    language: 'Swahili', level: 'Beginner',
    totalPages: 9,
    category: 'Storybooks', ageGroup: 'Children', rating: 4.6, reads: 2890,
    description: "A picture-book journey through the rainforest with a chameleon who can't decide what colour to be.",
    isEducational: false,
    attributes: { theme: 'Nature & Environment' },
    content: [
      "Deep in the rainforest lived a chameleon who could never quite settle on a colour.",
      "On Monday he was leaf-green, on Tuesday bark-brown, and by Wednesday a startled, splashy orange.",
      "The other animals teased him: \"Pick a colour and keep it!\" But the chameleon just smiled his slow smile.",
      "One day a hungry hawk circled low, and the chameleon turned the exact grey of the stone he sat on.",
      "\"Maybe,\" said the chameleon afterward, \"not choosing is exactly what saved me.\"",
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
  // Whole-catalogue aggregates the Library page header displays (this prototype's
  // MOCK_BOOKS array is a small sample of the "real" 1,240-title catalogue below).
  libraryReads: 12400,
  libraryTitles: 1240,
};

// Parent & Teacher Picks — each references a book by id rather than duplicating
// its title/cover, so the testimonial thumbnail always matches MOCK_BOOKS.
export const MOCK_TESTIMONIALS = [
  {
    id: 't1', name: 'Mrs. Gable', role: 'Primary Educator',
    quote: "My class asks for Anansi by name now — that never happened with a worksheet.",
    bookId: '1',
  },
  {
    id: 't2', name: 'Mr. Osei', role: 'Parent of two',
    quote: "The Baobab story got my daughter asking questions about her own grandmother's stories.",
    bookId: '5',
  },
  {
    id: 't3', name: 'Ms. Adeyemi', role: 'Literacy Coach',
    quote: "Zola's Star Map is the first 'science' book my reluctant readers finish in one sitting.",
    bookId: '7',
  },
];
