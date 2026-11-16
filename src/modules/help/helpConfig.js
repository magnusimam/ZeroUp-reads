// Help Center content. Grounded in the app's actual features (not generic
// filler) so a reader can self-serve answers instead of every question
// becoming a support ticket. Icons are mapped to these ids in the components,
// keeping this file plain data.

// Contact details shown on the page — one place to change them.
export const SUPPORT_EMAIL = 'support@zeroupreads.org';
export const SUPPORT_HOURS = { days: 'Monday – Friday', time: '8:00 AM – 6:00 PM (WAT)' };

// How many FAQs show before "View all FAQ" is pressed.
export const FAQ_PREVIEW_COUNT = 7;

export const HELP_TOPICS = [
  { id: 'getting-started', title: 'Getting Started', desc: 'Create an account, set up your profile, and start reading.', color: '#1466E6', bg: 'linear-gradient(135deg, #EEF5FF 0%, #F7FBFF 100%)' },
  { id: 'reading', title: 'Finding & Reading Books', desc: 'How to search, filter, read online or offline.', color: '#1466E6', bg: 'linear-gradient(135deg, #ECF8F3 0%, #F6FCF9 100%)' },
  { id: 'languages', title: 'Languages & Translation', desc: 'Switch languages, translations and language settings.', color: '#05A75B', bg: 'linear-gradient(135deg, #FFF8EA 0%, #FFFCF5 100%)' },
  { id: 'audio', title: 'Audio & Accessibility', desc: 'Listen as you read, accessibility features and support.', color: '#7C4DDB', bg: 'linear-gradient(135deg, #F4F0FF 0%, #FAF8FF 100%)' },
  { id: 'offline', title: 'Download & Offline Reading', desc: 'Save books for offline access on any device.', color: '#05A75B', bg: 'linear-gradient(135deg, #EAF7F3 0%, #F5FBF9 100%)' },
  { id: 'parents', title: 'For Parents & Teachers', desc: 'Tools, tips and resources to support young readers.', color: '#F25C3B', bg: 'linear-gradient(135deg, #FFF3EA 0%, #FFFAF5 100%)' },
  { id: 'account', title: 'Account & Settings', desc: 'Manage your account, privacy and preferences.', color: '#1466E6', bg: 'linear-gradient(135deg, #EDF5FC 0%, #F7FBFE 100%)' },
  { id: 'safety', title: 'Safety & Community', desc: 'A safe and positive space for every child.', color: '#05A75B', bg: 'linear-gradient(135deg, #ECF8F5 0%, #F6FCFA 100%)' },
];

// Chips under the hero search box — clicking one runs that search.
export const POPULAR_SEARCHES = ['Download books', 'Reading levels', 'Change language', 'Create an account', 'Offline reading'];

// The first FAQ_PREVIEW_COUNT entries are the ones the design shows up front.
export const FAQ_ITEMS = [
  {
    topic: 'getting-started',
    q: 'How do I create a ZeroUp Reads account?',
    a: 'Tap "Get Started" at the top of any page, fill in your name, email and a password (or continue with Google), and you\'re in. A short welcome tour then asks your languages, age group and interests so we can recommend the right books.',
  },
  {
    topic: 'languages',
    q: 'How can I find books in my language?',
    a: 'Open the Library and use the Language filter, or pick a language from Explore → Languages. A book\'s detail page lists every language it\'s currently available in. You can also translate the whole site from the 🌐 button in the top bar.',
  },
  {
    topic: 'offline',
    q: 'Can I read books offline?',
    a: 'Yes — tap "Save Offline" on a book\'s detail page (or the download icon on a book card) to keep it on your device, then open it anytime from "My Downloads", even with no connection. Your reading progress syncs automatically once you\'re back online.',
  },
  {
    topic: 'parents',
    q: 'What age group are the books for?',
    a: 'Books are tagged by reading level: Beginner (ages 3–6), Growing Reader (ages 6–9), Explorer (ages 9–12) and Advanced (ages 12+). The Library\'s filters let you narrow to just the right level for your child.',
  },
  {
    topic: 'getting-started',
    q: 'Is ZeroUp Reads free to use?',
    a: 'Yes — reading our books on the web and app is free. Our mission is that every child can read in their own language, so the core library will always stay free.',
  },
  {
    topic: 'audio',
    q: 'Can I listen to the stories instead of reading?',
    a: 'Audio narration ("Read with AI") is coming soon — you\'ll see it on a book\'s page as soon as it\'s ready. In the meantime you can increase the reading font size in Settings to make books easier to read.',
  },
  {
    topic: 'reading',
    q: 'How can I suggest a book or topic?',
    a: 'Use "Suggest a Book" further down this page. Tell us the title or topic and why it matters to you — our team reviews every suggestion.',
  },
  {
    topic: 'languages',
    q: 'How do I request a book in another language?',
    a: 'Open any book\'s detail page and tap "Translate" — that sends a request to our translation team. Once a translator picks it up and it\'s reviewed and approved, the new language appears on the book automatically.',
  },
  {
    topic: 'reading',
    q: 'What reading levels does ZeroUp Reads use?',
    a: 'Every book is tagged Beginner, Growing Reader, Explorer or Advanced. During the welcome tour (or anytime in Settings) you can set your reading level, and the Library\'s filters let you narrow to just your level.',
  },
  {
    topic: 'parents',
    q: 'How do I become an author or translator?',
    a: 'Reach out through Contact Support with a short note about what you\'d like to contribute. An administrator can grant Author, Translator, Editor or Publisher access from there.',
  },
  {
    topic: 'account',
    q: 'I forgot my password — how do I get back in?',
    a: 'Use "Forgot password?" on the Sign In page. We\'ll send a reset link to your email — it stays valid for 30 minutes.',
  },
  {
    topic: 'reading',
    q: 'How is my reading progress saved?',
    a: 'Progress saves automatically as you read and shows up on your Dashboard and Profile — reading streaks, books completed and pages read all update in real time.',
  },
  {
    topic: 'account',
    q: 'How do I change my account details?',
    a: 'Go to Settings from your profile menu to update your preferred language and reading font size, or Edit Profile on your Profile page. For anything else, use Contact Support.',
  },
  {
    topic: 'safety',
    q: 'Is ZeroUp Reads safe for children?',
    a: 'Every book goes through our publishing review (draft → review → approval) before it appears in the Library, and there are no ads or open chat. If you ever see something that doesn\'t look right, use Report a Problem and we\'ll look at it quickly.',
  },
];
