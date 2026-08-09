// Canonical category taxonomy — kept in sync with AdminCMSPage.jsx's CATEGORIES
// select options so a book uploaded in admin always matches a category browsable here.
// AI/Space/Agriculture/Finance/Culture/Adventure/Animals/Environment were added
// for the homepage's "Book Categories" showcase (docs/ZEROUP_READS_CONCEPT.md's
// target content domains go well beyond storybooks) — appended rather than
// replacing the original list so no existing book's `category` value becomes
// unrecognized by the Library filter or Admin dropdown.
export const BOOK_CATEGORIES = [
  'Storybooks', 'Science', 'Technology', 'AI', 'Health', 'Space', 'Agriculture', 'Finance',
  'History', 'Culture', 'Adventure', 'Animals', 'Environment', 'Mathematics', 'Arts', 'Language & Culture',
];

// Canonical book-language taxonomy — kept in sync with AdminCMSPage.jsx's
// LANGUAGES select options so a book uploaded in admin always uses a language
// from the same list. Distinct from any site-UI-locale selector (e.g.
// LibraryHeader's display-language dropdown) — this is about what language a
// book's *content* is written in, not what language the site chrome renders in.
// Kanuri/Tiv/Efik added for the homepage's "Popular Languages" chips — they're
// part of docs/ZEROUP_READS_CONCEPT.md §4.4's Nigerian-language rollout, added
// here (not as a one-off list in the homepage component) so a chip can never
// point at a language no book taxonomy actually recognizes.
export const BOOK_LANGUAGES = [
  'English', 'Swahili', 'Yoruba', 'Zulu', 'French', 'Hausa', 'Igbo', 'Pidgin', 'Kanuri', 'Tiv', 'Efik',
];

// Canonical reading-level taxonomy — kept in sync with AdminCMSPage.jsx's
// LEVELS select options and LibraryPage's level filter so a book uploaded in
// admin always uses a level the library's filter chips actually recognize.
export const BOOK_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

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
  {
    id: '9', title: 'The Solar System in Hausa', author: 'Ibrahim Sani',
    language: 'Hausa', level: 'Beginner',
    totalPages: 11,
    category: 'Space', ageGroup: 'Children', rating: 4.8, reads: 4200,
    description: "A bright, simple tour of the sun and the eight planets that circle it, told in Hausa.",
    isEducational: true,
    attributes: { theme: 'Space & Astronomy' },
    content: [
      "Rana babbar tauraruwa ce a tsakiyar sararin samaniya. Duniya da sauran taurari suna kewaye da ita.",
      "Duniyarmu ita ce ta uku daga rana. Ita ce kawai duniyar da muka san tana da rai a kanta.",
      "Bayan Duniya akwai Mars, ja-ja kuma mai duwatsu. Sannan akwai Jupita, babba fiye da su duka.",
      "Kowace duniya tana tafiya a hanyarta, ba tare da karo da wata ba. Wannan ake kira kewaya rana.",
      "Idan ka duba sama da dare, za ka iya ganin wasu daga cikin waɗannan taurari suna haske a nesa.",
    ],
  },
  {
    id: '10', title: 'Understanding Money in Yoruba', author: 'Folake Ogunleye',
    language: 'Yoruba', level: 'Beginner',
    totalPages: 10,
    category: 'Finance', ageGroup: 'Children', rating: 4.7, reads: 3650,
    description: "A gentle first lesson on saving, spending and sharing money, told in Yoruba.",
    isEducational: true,
    attributes: { theme: 'Money & Saving' },
    content: [
      "Owó jẹ́ ohun tí a máa ń lò láti ra ohun tí a nílò, bíi oúnjẹ, aṣọ àti ìwé.",
      "Nígbà tí a bá rí owó, a lè yàn láti lo díẹ̀, kí a sì fi díẹ̀ pamọ́ sínú àpótí ìfowópamọ́.",
      "Fífi owó pamọ́ ń ràn wá lọ́wọ́ láti ra ohun tí ó tóbi jù ní ọjọ́ iwájú.",
      "A tún lè fi díẹ̀ nínú owó wa ṣe àwọn ẹlòmíràn tí ó nílò rẹ̀ ju wa lọ.",
      "Ọmọdé tí ó kọ́ bí a ṣe ń fi owó ṣe nǹkan dáradára máa ń dàgbà di àgbàlagbà tí ó gbọ́n nípa owó.",
    ],
  },
  {
    id: '11', title: 'My First Science Book', author: 'Dr. Ngozi Eze',
    language: 'English', level: 'Beginner',
    totalPages: 12,
    category: 'Science', ageGroup: 'Children', rating: 4.9, reads: 3980,
    description: "Simple experiments and big questions about water, air, light and living things.",
    isEducational: true,
    attributes: { theme: 'General Science' },
    content: [
      "Science is just a fancy word for asking questions and looking closely for answers.",
      "Why is the sky blue? Why do plants need sunlight? Why does ice melt in your hand? Scientists ask questions like these every day.",
      "You can be a scientist too. All you need is your eyes, your curiosity, and a notebook to write down what you see.",
      "Try this: put a spoon in a glass of water and look at it from the side. Does it look bent? That's science!",
      "Every big discovery started with someone small enough to say, \"I wonder why...\"",
    ],
  },
  {
    id: '12', title: 'The Human Body in Igbo', author: 'Chidinma Okafor',
    language: 'Igbo', level: 'Beginner',
    totalPages: 13,
    category: 'Health', ageGroup: 'Children', rating: 4.6, reads: 2210,
    description: "A friendly introduction to the heart, lungs, bones and senses, told in Igbo.",
    isEducational: true,
    attributes: { theme: 'Human Body' },
    content: [
      "Ahụ́ mmadụ dị ka ụlọ dị egwu nke nwere ọtụtụ ụmụ akụkụ na-arụ ọrụ ọnụ.",
      "Obi anyị na-arụ ọrụ ehihie na abalị iji zipụ ọbara gaa akụkụ ahụ niile.",
      "Ọgịrịga anyị na-enye anyị ike iguzo ọtọ, gbaa ọsọ, na-egwu egwu.",
      "Anya, ntị, imi na ire bụ ihe anyị ji amata ihe dị n'ụwa gburugburu anyị.",
      "Ile anya n'ahụ́ gị bụ ụzọ mma isi malite ịghọta otú ị dị ndụ.",
    ],
  },
  {
    id: '13', title: 'Animals Around Us', author: 'Grace Achieng',
    language: 'English', level: 'Beginner',
    totalPages: 10,
    category: 'Animals', ageGroup: 'Children', rating: 4.7, reads: 1890,
    description: "Meet the birds, insects and small creatures that share your backyard and street.",
    isEducational: true,
    attributes: { theme: 'Wildlife & Nature' },
    content: [
      "You don't need to travel far to meet an animal. Look under a leaf, up in a tree, or along a wall at dusk.",
      "A weaver bird builds its nest by tying grass into tight knots — no hands, just a clever beak.",
      "Ants that look like they're wandering are usually following an invisible trail of scent left by their sisters.",
      "A gecko's feet are covered in thousands of tiny hairs that let it walk straight up glass.",
      "Every animal you meet is solving the same problem you are: finding food, staying safe, and getting home before dark.",
    ],
  },
  {
    id: '14', title: 'The Clever Tortoise', author: 'Kwame Mensah',
    language: 'English', level: 'Beginner',
    totalPages: 9,
    category: 'Culture', ageGroup: 'Children', rating: 4.8, reads: 2560,
    description: "An old West African folktale about a slow tortoise who out-thinks every animal in the forest.",
    isEducational: false,
    attributes: { theme: 'Folktales & Legends' },
    content: [
      "Long ago, when animals still talked, Tortoise was the slowest runner in the whole forest — and everyone knew it.",
      "One dry season, the animals agreed that whoever reached the top of the mountain first would be crowned the wisest.",
      "Tortoise didn't race. Instead, he asked each fast animal for a small favour along the way, and they laughed and agreed.",
      "By the time Hare and Leopard reached the top, exhausted from running, Tortoise was already there, sipping water.",
      "\"Speed gets you there first,\" said Tortoise. \"Thinking gets you there at all.\"",
    ],
  },
  {
    id: '15', title: 'Growing Food', author: 'Amina Osei',
    language: 'English', level: 'Beginner',
    totalPages: 10,
    category: 'Agriculture', ageGroup: 'Children', rating: 4.6, reads: 1420,
    description: "From a single seed to a full harvest — how the food on your plate actually grows.",
    isEducational: true,
    attributes: { theme: 'Farming & Food' },
    content: [
      "Every meal starts as a seed — a tiny package with everything a plant needs to begin.",
      "A seed needs three things to wake up: water, warmth, and a little patience.",
      "Some plants, like yam and cassava, grow their food underground, hidden from the sun.",
      "Farmers watch the sky as closely as the soil — the right rain at the right time can make or ruin a harvest.",
      "The next time you eat a fruit or vegetable, think of the whole journey it took just to reach your plate.",
    ],
  },
  {
    id: '16', title: 'How Computers Work', author: 'Tunde Bakare',
    language: 'English', level: 'Intermediate',
    totalPages: 14,
    category: 'Technology', ageGroup: 'Young Adult', rating: 4.7, reads: 1980,
    description: "What's really happening inside the box when you tap, click or type.",
    isEducational: true,
    attributes: { theme: 'Computers & AI' },
    content: [
      "A computer doesn't actually understand words or pictures — it only understands two things: on and off.",
      "Every letter you type, every colour on your screen, is really just a very long pattern of 1s and 0s underneath.",
      "The processor is like the computer's brain — it does millions of tiny calculations every single second.",
      "When you save a file, the computer is writing that pattern of on/off switches somewhere it can find again later.",
      "Artificial intelligence is just a computer that has been shown so many examples, it starts recognizing patterns on its own.",
    ],
  },
  // The next three books exist to demonstrate BookDetailPage (src/modules/books/BookDetailPage.jsx)
  // working from data alone — availableLanguages/learningObjectives live in the
  // `attributes` bag (Schema-Driven Design) rather than as new core fields, so
  // every other book above still renders on the same detail page unchanged.
  {
    id: '17', title: 'Queen of Katsina', author: 'Halima Yusuf',
    language: 'English', level: 'Intermediate',
    totalPages: 14,
    category: 'History', ageGroup: 'Young Adult', rating: 4.8, reads: 2100,
    description: "A young queen inherits a troubled throne in the ancient trading city of Katsina, and must learn that real power lies in listening before it lies in command.",
    isEducational: true,
    attributes: {
      theme: 'History & Leadership',
      tagline: 'A throne, a market at dawn, and a queen who chose to listen first.',
      availableLanguages: ['English', 'Hausa', 'Yoruba'],
      funFacts: [
        'A kingdom is a place ruled by a king or queen. It can be big or small.',
        'Katsina was one of the great Hausa trading cities, known for its busy markets over 1,000 years ago.',
        'A council of elders traditionally helped advise a ruler on important decisions.',
        'Caravan routes connected West African kingdoms to traders from across the desert.',
        'A good leader often listens more than they speak — just like Queen Amina.',
      ],
      learningObjectives: [
        { title: 'Leadership', description: 'Learn how good leaders inspire and protect their people.' },
        { title: 'Nigerian History', description: 'Discover the rich history of great African kingdoms.' },
        { title: 'Courage', description: 'Be brave and stand up for what is right.' },
        { title: 'Teamwork', description: 'Understand the power of working together.' },
        { title: 'Wisdom', description: 'Make wise decisions that bring peace and prosperity.' },
      ],
    },
    content: [
      "When the old king of Katsina died, his daughter Amina was not yet ready to rule — but the throne would not wait for her to feel ready.",
      "The elders expected a young queen to sit quietly while men made the decisions. Amina had other plans.",
      "She rode out to the market at dawn, before the councillors were even awake, and listened to what traders and farmers actually needed.",
      "When a dispute broke out between two caravan leaders over a trade route, Amina settled it not with soldiers, but with a question: \"What would keep both your families fed this winter?\"",
      "Katsina prospered under her — not because she commanded the loudest, but because she was the last person in the room still listening.",
    ],
  },
  {
    id: '18', title: 'The Boy Who Invested', author: 'Emeka Chukwu',
    language: 'English', level: 'Beginner',
    totalPages: 10,
    category: 'Finance', ageGroup: 'Children', rating: 4.7, reads: 1870,
    description: "Nine-year-old Chidi turns his weekend market-stall earnings into his first real lesson about saving, patience, and watching small money grow into bigger money.",
    isEducational: true,
    attributes: {
      theme: 'Money & Investing',
      tagline: 'One boy, one roasting pan, and the week he learned to make money grow.',
      availableLanguages: ['English', 'Yoruba', 'Igbo'],
      learningObjectives: [
        { title: 'Saving vs Spending', description: 'Learn the difference between spending, saving, and investing.' },
        { title: 'Patience', description: 'Understand how small, regular savings grow over time.' },
        { title: 'Goal Setting', description: 'Practice setting a simple savings goal and tracking progress toward it.' },
      ],
    },
    content: [
      "Chidi sold roasted corn at his mother's stall every Saturday, and every Saturday he spent every single naira he earned by Sunday night.",
      "His uncle noticed and asked him a strange question: \"What if you only spent half of what you earned, and grew the other half instead?\"",
      "Chidi didn't understand at first. \"Grow money? It's not a seed.\" His uncle smiled. \"It's exactly like a seed, if you're patient.\"",
      "So Chidi began setting aside a little each week, and his uncle showed him how that little bit could be put to work instead of sitting still.",
      "Months later, Chidi looked at what he'd saved and grown — enough to buy his own roasting pan. He hadn't just earned money. He'd learned how to make it work for him.",
    ],
  },
  {
    id: '19', title: 'Young Inventors', author: 'Tobenna Eze',
    language: 'English', level: 'Intermediate',
    totalPages: 15,
    category: 'Technology', ageGroup: 'Student', rating: 4.9, reads: 2450,
    description: "A team of curious kids turns bottle caps, old motors and recycled wire into working machines — and discovers that every invention starts with a problem worth solving.",
    isEducational: true,
    attributes: {
      theme: 'Engineering & Innovation',
      tagline: 'A broken water pump, four friends, and a backyard full of spare parts.',
      availableLanguages: ['English', 'Swahili'],
      learningObjectives: [
        { title: 'Design Thinking', description: 'Learn the basic engineering design cycle: problem, idea, build, test, improve.' },
        { title: 'Resourcefulness', description: 'See how simple, everyday materials can be reused to build working machines.' },
        { title: 'Confidence', description: 'Build confidence that big inventions usually start as small, imperfect prototypes.' },
      ],
    },
    content: [
      "The water pump in Ijeoma's neighbourhood had been broken for weeks, and every trip to fetch water meant walking twice as far.",
      "\"Someone should fix it,\" her brother said. Ijeoma looked at him. \"Why not us?\"",
      "She gathered three friends, a box of spare parts, and an old bicycle wheel, and they got to work in her family's backyard.",
      "Their first attempt didn't work at all. Their second attempt worked for about six seconds before falling apart. Their third attempt pumped water for real.",
      "It wasn't a perfect machine. But it was theirs, it worked, and it taught them that inventors aren't people who never fail — they're people who keep building anyway.",
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
