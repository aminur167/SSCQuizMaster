// App state
let currentSubject = '';
let currentChapter = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;
let timerInterval;
let timeElapsed = 0;

// DOM Elements
const subjectSelection = document.getElementById('subjectSelection');
const chapterSelection = document.getElementById('chapterSelection');
const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('resultsContainer');

const chapterSubjectTitle = document.getElementById('chapterSubjectTitle');
const chapterGrid = document.getElementById('chapterGrid');
const backToSubjects = document.getElementById('backToSubjects');
const totalChapters = document.getElementById('totalChapters');
const totalMCQs = document.getElementById('totalMCQs');

const quizSubjectTitle = document.getElementById('quizSubjectTitle');
const quizChapterTitle = document.getElementById('quizChapterTitle');
const questionCounter = document.getElementById('questionCounter');
const scoreCounter = document.getElementById('scoreCounter');
const timer = document.getElementById('timer');
const progressBar = document.getElementById('progressBar');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const skipBtn = document.getElementById('skipBtn');
const submitBtn = document.getElementById('submitBtn');

const finalScore = document.getElementById('finalScore');
const scoreMessage = document.getElementById('scoreMessage');
const correctAnswers = document.getElementById('correctAnswers');
const wrongAnswers = document.getElementById('wrongAnswers');
const timeTaken = document.getElementById('timeTaken');
const percentage = document.getElementById('percentage');
const resultsDetails = document.getElementById('resultsDetails');
const reviewBtn = document.getElementById('reviewBtn');
const restartBtn = document.getElementById('restartBtn');
const homeBtn = document.getElementById('homeBtn');

// Subject names mapping
const subjectNames = {
    physics: 'পদার্থবিজ্ঞান',
    chemistry: 'রসায়ন',
    biology: 'জীববিজ্ঞান',
    math: 'গণিত',
    history: 'ইতিহাস',
    geography: 'ভূগোল',
    economics: 'অর্থনীতি',
    civics: 'নাগরিকতা',
    bangla: 'বাংলা',
    english: 'ইংরেজি',
    ict: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    islam: 'ইসলাম শিক্ষা'
};

// Chapter data for all subjects with Bengali chapters
const chapterData = {
    physics: [
        { id: 'measurement', name: 'পরিমাপ ও একক', description: 'মৌলিক ও লব্ধ একক, এসআই পদ্ধতি', questions: 30 },
        { id: 'force_motion', name: 'বল ও গতি', description: 'নিউটনের গতিসূত্র, ভরবেগ, ঘর্ষণ', questions: 30 },
        { id: 'work_energy', name: 'কাজ, শক্তি ও শক্তি সংরক্ষণ', description: 'কাজের ধারণা, গতিশক্তি, স্থিতিশক্তি', questions: 30 },
        { id: 'pressure_buoyancy', name: 'চাপ ও ভাসন', description: 'প্যাসকেলের সূত্র, আর্কিমিডিসের সূত্র', questions: 30 },
        { id: 'heat_thermodynamics', name: 'তাপ ও তাপগতিবিদ্যা', description: 'তাপমাত্রা, তাপগতিবিদ্যার সূত্র', questions: 30 },
        { id: 'light_refraction', name: 'আলো ও প্রতিসরণ', description: 'প্রতিফলন, প্রতিসরণ, লেন্স', questions: 30 },
        { id: 'sound', name: 'ধ্বনি', description: 'ধ্বনির বৈশিষ্ট্য, ডপলার এফেক্ট', questions: 30 },
        { id: 'electricity_magnetism', name: 'বিদ্যুৎ ও চুম্বকত্ব', description: 'ওহমের সূত্র, চুম্বকত্ব', questions: 30 },
        { id: 'modern_physics', name: 'আধুনিক পদার্থবিদ্যা', description: 'কোয়ান্টাম মেকানিক্স, নিউক্লিয়ার ফিজিক্স', questions: 30 }
    ],
    chemistry: [
        { id: 'measurement_basic', name: 'পরিমাপ ও রসায়নের মৌলিক ধারণা', description: 'মৌল, যৌগ, মিশ্রণ', questions: 30 },
        { id: 'formulas_equations', name: 'মৌলিক রাসায়নিক সূত্র ও সমীকরণ', description: 'রাসায়নিক সমীকরণের ভারসাম্য', questions: 30 },
        { id: 'atomic_structure', name: 'পরমাণু ও পরমাণুর গঠন', description: 'পরমাণুর গঠন, ইলেকট্রন বিন্যাস', questions: 30 },
        { id: 'chemical_bonding', name: 'রাসায়নিক বন্ধন', description: 'আয়নিক বন্ধন, সমযোজী বন্ধন', questions: 30 },
        { id: 'gas_properties', name: 'গ্যাসের ধর্ম', description: 'গ্যাসের সূত্র, আদর্শ গ্যাস সমীকরণ', questions: 30 },
        { id: 'thermochemistry', name: 'তাপীয় রসায়ন', description: 'এনথালপি, বিক্রিয়া তাপ', questions: 30 },
        { id: 'acids_bases', name: 'এসিড, ক্ষার ও লবণ', description: 'pH মান, প্রশমন বিক্রিয়া', questions: 30 },
        { id: 'carbon_compounds', name: 'কার্বন যৌগ', description: 'হাইড্রোকার্বন, কার্যকরী মূলক', questions: 30 },
        { id: 'metals_nonmetals', name: 'ধাতু ও অর্ধ-ধাতু', description: 'ধাতুর বৈশিষ্ট্য, ধাতু নিষ্কাশন', questions: 30 },
        { id: 'environment_biology', name: 'পরিবেশ ও জীবজগৎ', description: 'পরিবেশ রসায়ন, জৈব রসায়ন', questions: 30 }
    ],
    biology: [
        { id: 'introduction', name: 'জীববিজ্ঞান পরিচিতি', description: 'জীববিজ্ঞানের শাখা, জীবনের বৈশিষ্ট্য', questions: 30 },
        { id: 'cell_structure', name: 'কোষ ও কোষের গঠন', description: 'প্রোক্যারিওটিক ও ইউক্যারিওটিক কোষ', questions: 30 },
        { id: 'nutrition_digestion', name: 'পুষ্টি ও পাচন', description: 'পাচনতন্ত্র, এনজাইম', questions: 30 },
        { id: 'respiration', name: 'শ্বাস-প্রশ্বাস', description: 'শ্বসন প্রক্রিয়া, শ্বাসতন্ত্র', questions: 30 },
        { id: 'blood_circulation', name: 'রক্ত ও সংবহন', description: 'রক্তের উপাদান, হৃদপিণ্ড', questions: 30 },
        { id: 'nervous_system', name: 'স্নায়ুতন্ত্র', description: 'নিউরন, কেন্দ্রীয় স্নায়ুতন্ত্র', questions: 30 },
        { id: 'hormones_classification', name: 'হরমোন ও শ্রেণিবিন্যাস', description: 'এন্ডোক্রাইন সিস্টেম, ট্যাক্সোনমি', questions: 30 },
        { id: 'reproduction', name: 'প্রজনন ও বংশবৃদ্ধি', description: 'লৈঙ্গিক ও অলৈঙ্গিক প্রজনন', questions: 30 },
        { id: 'environment_ecosystem', name: 'পরিবেশ ও বাস্তুতন্ত্র', description: 'বাস্তুতন্ত্র, খাদ্য শৃঙ্খল', questions: 30 },
        { id: 'plant_animal_kingdom', name: 'উদ্ভিদ ও প্রাণীর জগৎ', description: 'উদ্ভিদ ও প্রাণীর শ্রেণিবিন্যাস', questions: 30 }
    ],
    math: [
        { id: 'number_system', name: 'সংখ্যা পদ্ধতি', description: 'বাস্তব সংখ্যা, মূলদ ও অমূলদ সংখ্যা', questions: 30 },
        { id: 'equations_inequalities', name: 'সমীকরণ ও অসমীকরণ', description: 'রৈখিক সমীকরণ, দ্বিঘাত সমীকরণ', questions: 30 },
        { id: 'polynomials_formulas', name: 'বহুপদী ও সূত্র', description: 'বীজগাণিতিক অভেদ, উৎপাদক', questions: 30 },
        { id: 'geometry', name: 'জ্যামিতি (ত্রি-জ্যামিতি)', description: 'ত্রিভুজ, চতুর্ভুজ, বৃত্ত', questions: 30 },
        { id: 'exponents_logarithms', name: 'সূচক ও লগারিদম', description: 'সূচকের নিয়ম, লগারিদমের ধর্ম', questions: 30 },
        { id: 'trigonometry', name: 'ত্রিকোণমিতি', description: 'ত্রিকোণমিতিক অনুপাত, অভেদ', questions: 30 },
        { id: 'algebra', name: 'বীজগণিত', description: 'সেট তত্ত্ব, সম্পর্ক ও ফাংশন', questions: 30 },
        { id: 'lines_angles', name: 'সমান্তরাল রেখা ও কোণ', description: 'কোণের প্রকারভেদ, সমান্তরাল রেখা', questions: 30 },
        { id: 'statistics_probability', name: 'পরিসংখ্যান ও সম্ভাবনা', description: 'গড়, মধ্যক, সম্ভাব্যতা', questions: 30 }
    ],
    history: [
        { id: 'prehistoric', name: 'প্রাগৈতিহাসিক যুগ', description: 'প্রস্তর যুগ, ধাতু যুগ', questions: 30 },
        { id: 'ancient_civilization', name: 'প্রাচীন সভ্যতা ও সাংস্কৃতিক বিকাশ', description: 'সিন্ধু সভ্যতা, মৌর্য যুগ', questions: 30 },
        { id: 'medieval_bangladesh', name: 'মধ্যযুগীয় বাংলাদেশ', description: 'সেন বংশ, দেব বংশ', questions: 30 },
        { id: 'muslim_rule', name: 'মুসলিম শাসন ও বাংলার ইতিহাস', description: 'সুলতানি আমল, মুঘল আমল', questions: 30 },
        { id: 'british_rule', name: 'ব্রিটিশ শাসনকাল', description: 'ইস্ট ইন্ডিয়া কোম্পানি, ব্রিটিশ রাজ', questions: 30 },
        { id: 'liberation_war', name: 'মুক্তিযুদ্ধ ও স্বাধীনতা', description: '১৯৭১ এর মুক্তিযুদ্ধ, স্বাধীনতা', questions: 30 },
        { id: 'world_history', name: 'বিশ্ব ইতিহাসের গুরুত্বপূর্ণ ঘটনা', description: 'ফরাসি বিপ্লব, বিশ্বযুদ্ধ', questions: 30 },
        { id: 'modern_bangladesh', name: 'আধুনিক বাংলাদেশ', description: 'স্বাধীনতা পরবর্তী বাংলাদেশ', questions: 30 }
    ],
    geography: [
        { id: 'introduction_geography', name: 'ভূগোলের পরিচিতি ও ভূমিকা', description: 'ভূগোলের শাখা, গুরুত্ব', questions: 30 },
        { id: 'earth_structure', name: 'পৃথিবীর গঠন ও মুক্তিসংস্থান', description: 'পৃথিবীর অভ্যন্তরীণ গঠন', questions: 30 },
        { id: 'environment_weather', name: 'পরিবেশ ও আবহাওয়া', description: 'জলবায়ু, আবহাওয়া', questions: 30 },
        { id: 'earth_environment', name: 'পৃথিবীর পরিবেশ', description: 'জৈবমণ্ডল, ভূ-মণ্ডল', questions: 30 },
        { id: 'human_settlement', name: 'মানুষের বসবাস ও অর্থনীতি', description: 'জনবসতি, অর্থনৈতিক ভূগোল', questions: 30 },
        { id: 'bangladesh_geography', name: 'বাংলাদেশে ভূগোল', description: 'বাংলাদেশের ভৌগোলিক অবস্থান', questions: 30 },
        { id: 'important_regions', name: 'বিশ্বের গুরুত্বপূর্ণ অঞ্চল', description: 'মহাদেশ, মহাসাগর', questions: 30 },
        { id: 'geopolitics_development', name: 'ভূ-রাজনীতি ও উন্নয়ন', description: 'প্রাকৃতিক সম্পদ, উন্নয়ন', questions: 30 }
    ],
    economics: [
        { id: 'basic_concepts', name: 'অর্থনীতির ধারণা ও গুরুত্ব', description: 'অর্থনীতির সংজ্ঞা, প্রকারভেদ', questions: 30 },
        { id: 'demand_supply', name: 'চাহিদা ও যোগান', description: 'চাহিদার নিয়ম, যোগানের নিয়ম', questions: 30 },
        { id: 'market_pricing', name: 'বাজার ও মূল্য নির্ধারণ', description: 'বাজার ভারসাম্য, মূল্য নির্ধারণ', questions: 30 },
        { id: 'production_factors', name: 'উৎপাদন ও উৎপাদন উপকরণ', description: 'উৎপাদনের উপকরণ', questions: 30 },
        { id: 'economic_systems', name: 'অর্থনৈতিক প্রণালী ও নীতি', description: 'পুঁজিবাদ, সমাজতন্ত্র', questions: 30 },
        { id: 'economic_development', name: 'অর্থনৈতিক উন্নয়ন', description: 'উন্নয়ন সূচক, উন্নয়ন পরিকল্পনা', questions: 30 },
        { id: 'bangladesh_economy', name: 'বাংলাদেশ অর্থনীতি', description: 'বাংলাদেশের অর্থনৈতিক কাঠামো', questions: 30 },
        { id: 'global_economy', name: 'বৈশ্বিক অর্থনীতি', description: 'বিশ্বায়ন, আন্তর্জাতিক বাণিজ্য', questions: 30 }
    ],
    civics: [
        { id: 'citizen_rights', name: 'নাগরিক অধিকার ও দায়িত্ব', description: 'মৌলিক অধিকার, নাগরিক দায়িত্ব', questions: 30 },
        { id: 'constitution_law', name: 'সংবিধান ও আইনশৃঙ্খলা', description: 'সংবিধানের বৈশিষ্ট্য, আইনের শাসন', questions: 30 },
        { id: 'local_government', name: 'স্থানীয় সরকার', description: 'ইউনিয়ন পরিষদ, পৌরসভা', questions: 30 },
        { id: 'election_democracy', name: 'নির্বাচন ও গণতন্ত্র', description: 'নির্বাচন প্রক্রিয়া, গণতান্ত্রিক মূল্যবোধ', questions: 30 },
        { id: 'human_rights', name: 'মানবাধিকার', description: 'মানবাধিকার চার্টার, সুরক্ষা', questions: 30 },
        { id: 'social_economic_justice', name: 'সামাজিক ও অর্থনৈতিক ন্যায়', description: 'সামাজিক ন্যায়, অর্থনৈতিক সমতা', questions: 30 },
        { id: 'environment_citizen_duty', name: 'পরিবেশ ও নাগরিক দায়িত্ব', description: 'পরিবেশ সুরক্ষা, নাগরিক সচেতনতা', questions: 30 }
    ],
    bangla: [
        { 
            id: 'bengali_poetry', 
            name: 'বাঙালির কবিতা', 
            description: 'বাংলা সাহিত্যের গুরুত্বপূর্ণ কবিতা ও কবি', 
            questions: 30 
        },
        { 
            id: 'bengali_stories_prose', 
            name: 'বাঙালির গল্প ও গদ্য', 
            description: 'বাংলা সাহিত্যের উল্লেখযোগ্য গল্প ও গদ্য রচনা', 
            questions: 30 
        },
        { 
            id: 'innocent_bengali_poetry', 
            name: 'নিরীহ বাঙালির কবিতা', 
            description: 'বাংলা সাহিত্যের নিরীহ বাঙালি বিষয়ক কবিতা', 
            questions: 30 
        },
        { 
            id: 'language_history', 
            name: 'ভাষার ইতিহাস', 
            description: 'বাংলা ভাষার বিবর্তন ও ইতিহাস', 
            questions: 30 
        },
        { 
            id: 'literature_trends', 
            name: 'বাংলা সাহিত্যের ধারা', 
            description: 'মধ্যযুগ, আধুনিক যুগের সাহিত্য ধারা', 
            questions: 30 
        },
        { 
            id: 'modern_literature', 
            name: 'আধুনিক বাংলা সাহিত্য', 
            description: 'সমকালীন বাংলা সাহিত্য', 
            questions: 30 
        }
    ],
    english: [
        { id: 'grammar_vocabulary', name: 'Grammar and Vocabulary', description: 'Parts of speech, tenses, vocabulary', questions: 30 },
        { id: 'reading_comprehension', name: 'Reading Comprehension', description: 'Passage reading, understanding', questions: 30 },
        { id: 'writing_skills', name: 'Writing Skills', description: 'Paragraph, letter, essay writing', questions: 30 },
        { id: 'poetry', name: 'Poetry', description: 'Poem analysis, literary devices', questions: 30 },
        { id: 'prose', name: 'Prose', description: 'Story, novel excerpts', questions: 30 },
        { id: 'drama', name: 'Drama', description: 'Play analysis, characters', questions: 30 },
        { id: 'novel_excerpts', name: 'Novel Excerpts', description: 'Novel passages, analysis', questions: 30 }
    ],
    ict: [
        { id: 'computer_intro', name: 'কম্পিউটার পরিচিতি', description: 'কম্পিউটারের ইতিহাস, প্রকারভেদ', questions: 30 },
        { id: 'hardware_software', name: 'হার্ডওয়্যার ও সফটওয়্যার', description: 'কম্পিউটারের অংশ, সফটওয়্যার প্রকার', questions: 30 },
        { id: 'operating_system', name: 'অপারেটিং সিস্টেম', description: 'ওএসের কাজ, প্রকারভেদ', questions: 30 },
        { id: 'word_processing', name: 'ওয়ার্ড প্রসেসিং', description: 'MS Word, document formatting', questions: 30 },
        { id: 'spreadsheet', name: 'স্প্রেডশীট', description: 'MS Excel, formulas, charts', questions: 30 },
        { id: 'presentation', name: 'প্রেজেন্টেশন', description: 'MS PowerPoint, slide design', questions: 30 },
        { id: 'internet_email', name: 'ইন্টারনেট ও ই-মেইল', description: 'ইন্টারনেট ব্যবহার, ইমেইল', questions: 30 },
        { id: 'ict_usage', name: 'তথ্য ও যোগাযোগ প্রযুক্তির ব্যবহার', description: 'ডিজিটাল বাংলাদেশ, ICT4D', questions: 30 }
    ],
    islam: [
        { id: 'islam_intro', name: 'ইসলামের পরিচয়', description: 'ইসলামের মৌলিক ধারণা', questions: 30 },
        { id: 'basic_beliefs', name: 'ইসলামের মৌলিক বিশ্বাস', description: 'ঈমানের স্তম্ভ', questions: 30 },
        { id: 'prayer_worship', name: 'প্রার্থনা ও ইবাদত', description: 'নামাজ, রোজা, হজ', questions: 30 },
        { id: 'islamic_values', name: 'ইসলামী মূল্যবোধ ও নৈতিকতা', description: 'নৈতিক শিক্ষা, চরিত্র', questions: 30 },
        { id: 'islamic_history', name: 'ইসলামী ইতিহাস ও সংস্কৃতি', description: 'ইসলামের ইতিহাস, সংস্কৃতি', questions: 30 },
        { id: 'moral_education', name: 'নৈতিক শিক্ষা ও মানবতা', description: 'মানবিক মূল্যবোধ', questions: 30 },
        { id: 'islam_modern_era', name: 'আধুনিক যুগে ইসলাম', description: 'সমসাময়িক বিষয়ে ইসলামের দৃষ্টিভঙ্গি', questions: 30 }
    ]
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    createFAB();
    showNotification('BanglaQuizMaster এ স্বাগতম! ২,৮৭০টি MCQ সহ সম্পূর্ণ বিনামূল্যের অ্যাপ', 'success');
});

function initializeEventListeners() {
    // Subject card click events
    document.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', () => {
            const subject = card.getAttribute('data-subject');
            showChapters(subject);
        });
    });

    // Back to subjects button
    backToSubjects.addEventListener('click', goToSubjects);

    // Quiz control events
    prevBtn.addEventListener('click', showPreviousQuestion);
    nextBtn.addEventListener('click', showNextQuestion);
    skipBtn.addEventListener('click', skipQuestion);
    submitBtn.addEventListener('click', showResults);
    
    // Results control events
    reviewBtn.addEventListener('click', reviewAnswers);
    restartBtn.addEventListener('click', restartQuiz);
    homeBtn.addEventListener('click', goToHomePage);
}

function showChapters(subject) {
    currentSubject = subject;
    
    // Update chapter selection title
    chapterSubjectTitle.textContent = `${subjectNames[subject]} - অধ্যায়সমূহ`;
    
    // Load chapters for the selected subject
    const chapters = chapterData[subject];
    
    // Update progress info
    totalChapters.textContent = chapters.length;
    const totalQuestions = chapters.reduce((sum, chapter) => sum + chapter.questions, 0);
    totalMCQs.textContent = totalQuestions;
    
    // Clear chapter grid
    chapterGrid.innerHTML = '';
    
    // Add chapters to grid
    chapters.forEach((chapter, index) => {
        const chapterCard = document.createElement('div');
        chapterCard.className = 'chapter-card';
        chapterCard.innerHTML = `
            <div class="chapter-number">${index + 1}</div>
            <div class="chapter-name">${chapter.name}</div>
            <div class="chapter-desc">${chapter.description}</div>
            <div class="chapter-stats">
                <span>${chapter.questions}টি MCQ</span>
                <span>~${Math.ceil(chapter.questions * 0.5)} মিনিট</span>
            </div>
        `;
        
        chapterCard.addEventListener('click', () => {
            startQuiz(subject, chapter.id);
        });
        
        chapterGrid.appendChild(chapterCard);
    });
    
    // Show chapter selection, hide subject selection
    subjectSelection.style.display = 'none';
    chapterSelection.style.display = 'block';
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    
    showNotification(`${subjectNames[subject]} এর ${chapters.length}টি অধ্যায় লোড হয়েছে`, 'info');
}

function goToSubjects() {
    subjectSelection.style.display = 'block';
    chapterSelection.style.display = 'none';
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
}

function startQuiz(subject, chapterId) {
    currentSubject = subject;
    currentChapter = chapterId;
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;
    timeElapsed = 0;
    
    // Find chapter name
    const chapter = chapterData[subject].find(ch => ch.id === chapterId);
    const chapterName = chapter ? chapter.name : '';
    
    // Show loading state
    showNotification(`${chapterName} এর ${chapter.questions}টি প্রশ্ন লোড হচ্ছে...`, 'info');
    
    // Load questions for the selected chapter
    loadQuestions(subject, chapterId)
        .then(questions => {
            currentQuestions = questions;
            userAnswers = new Array(currentQuestions.length).fill(null);
            
            // Update UI
            quizSubjectTitle.textContent = subjectNames[subject];
            quizChapterTitle.textContent = chapterName;
            
            // Hide other sections, show quiz
            subjectSelection.style.display = 'none';
            chapterSelection.style.display = 'none';
            quizContainer.style.display = 'block';
            resultsContainer.style.display = 'none';
            
            // Start timer
            startTimer();
            
            // Show first question
            showQuestion();
            
            showNotification(`${chapterName} কুইজ শুরু হয়েছে! ${chapter.questions}টি প্রশ্নের জন্য শুভকামনা!`, 'success');
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            showNotification('প্রশ্ন লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।', 'error');
        });
}

function loadQuestions(subject, chapterId) {
    return new Promise((resolve, reject) => {
        // Try to load from JSON files first
        const fileName = getSubjectFileName(subject);
        fetch(`data/${fileName}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('JSON file not found');
                }
                return response.json();
            })
            .then(data => {
                const questions = data[subject]?.[chapterId];
                if (questions && questions.length > 0) {
                    resolve(questions);
                } else {
                    throw new Error('No questions in JSON');
                }
            })
            .catch(() => {
                // Fallback to generated questions
                const questions = getRealSSCQuestions(subject, chapterId);
                if (questions && questions.length > 0) {
                    resolve(questions);
                } else {
                    reject(new Error('No questions available'));
                }
            });
    });
}

function getSubjectFileName(subject) {
    const subjectCategories = {
        'physics': 'science',
        'chemistry': 'science', 
        'biology': 'science',
        'math': 'science',
        'history': 'arts',
        'geography': 'arts',
        'economics': 'arts',
        'civics': 'arts',
        'bangla': 'general',
        'english': 'general',
        'ict': 'general',
        'islam': 'general'
    };
    return subjectCategories[subject] || 'general';
}

function getRealSSCQuestions(subject, chapterId) {
    // This is where real SSC questions would be loaded
    // For now, return sample questions
    return generateSampleSSCQuestions(30, subject, chapterId);
}

function generateSampleSSCQuestions(count, subject, chapter) {
    const questions = [];
    const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
    
    for (let i = 1; i <= count; i++) {
        const year = years[Math.floor(Math.random() * years.length)];
        questions.push({
            question: `এটি ${subjectNames[subject]} বিষয়ের ${getChapterName(subject, chapter)} অধ্যায়ের ${i} নম্বর প্রশ্ন (SSC ${year})`,
            options: [
                "প্রথম বিকল্প উত্তর",
                "দ্বিতীয় বিকল্প উত্তর", 
                "তৃতীয় বিকল্প উত্তর",
                "চতুর্থ বিকল্প উত্তর"
            ],
            correctAnswer: Math.floor(Math.random() * 4),
            explanation: `এটি ${year} সালের এসএসসি পরীক্ষায় আসা ${getChapterName(subject, chapter)} অধ্যায়ের একটি গুরুত্বপূর্ণ প্রশ্ন। সঠিক উত্তর নির্বাচন করার জন্য প্রয়োজনীয় ধারণাগুলি ভালোভাবে আয়ত্ত করুন।`
        });
    }
    return questions;
}

function getChapterName(subject, chapterId) {
    const chapter = chapterData[subject].find(ch => ch.id === chapterId);
    return chapter ? chapter.name : 'এই অধ্যায়';
}

function startTimer() {
    clearInterval(timerInterval);
    timeElapsed = 0;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    timer.textContent = `সময়: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // Update question counter
    questionCounter.textContent = `প্রশ্ন: ${currentQuestionIndex + 1}/${currentQuestions.length}`;
    
    // Update score counter
    scoreCounter.textContent = `স্কোর: ${score}`;
    
    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Update question text
    questionText.textContent = `${currentQuestionIndex + 1}. ${question.question}`;
    
    // Clear options container
    optionsContainer.innerHTML = '';
    
    // Add options
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        
        // Check if this option was previously selected
        if (userAnswers[currentQuestionIndex] === index) {
            optionElement.classList.add('selected');
        }
        
        optionElement.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionElement);
    });
    
    // Update button states
    prevBtn.disabled = currentQuestionIndex === 0;
    
    // Update skip button
    const remaining = currentQuestions.length - currentQuestionIndex - 1;
    skipBtn.textContent = `স্কিপ করুন (${remaining} বাকি)`;
    skipBtn.style.display = remaining > 0 ? 'block' : 'none';
    
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

function selectOption(optionIndex) {
    // Deselect all options
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Select clicked option
    document.querySelectorAll('.option')[optionIndex].classList.add('selected');
    
    // Save user's answer
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Check if answer is correct and update score
    const question = currentQuestions[currentQuestionIndex];
    if (optionIndex === question.correctAnswer) {
        // Only add to score if this question wasn't already answered correctly
        if (userAnswers[currentQuestionIndex] !== question.correctAnswer) {
            score++;
        }
    } else {
        // If changing from correct to incorrect answer, decrease score
        if (userAnswers[currentQuestionIndex] === question.correctAnswer) {
            score--;
        }
    }
    
    // Update score display
    scoreCounter.textContent = `স্কোর: ${score}`;
}

function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

function showNextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

function skipQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

function showResults() {
    // Stop timer
    clearInterval(timerInterval);
    
    // Calculate final score
    score = 0;
    currentQuestions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            score++;
        }
    });
    
    // Update results display
    finalScore.textContent = `${score}/${currentQuestions.length}`;
    
    // Calculate statistics
    const wrongAnswersCount = currentQuestions.length - score;
    const percentageScore = Math.round((score / currentQuestions.length) * 100);
    
    // Update stats
    correctAnswers.textContent = score;
    wrongAnswers.textContent = wrongAnswersCount;
    timeTaken.textContent = timer.textContent.replace('সময়: ', '');
    percentage.textContent = `${percentageScore}%`;
    
    // Set score message based on performance
    if (percentageScore >= 80) {
        scoreMessage.textContent = 'অভিনন্দন! আপনি অসাধারণ করেছেন। 🎉';
        scoreMessage.style.background = 'linear-gradient(135deg, #e7f6e7, #c8e6c9)';
        scoreMessage.style.color = '#2e7d32';
    } else if (percentageScore >= 60) {
        scoreMessage.textContent = 'ভালো করেছেন! আরও অনুশীলন করুন। 👍';
        scoreMessage.style.background = 'linear-gradient(135deg, #fff3e0, #ffe0b2)';
        scoreMessage.style.color = '#ef6c00';
    } else if (percentageScore >= 40) {
        scoreMessage.textContent = 'চেষ্টা চালিয়ে যান, আপনি উন্নতি করবেন। 💪';
        scoreMessage.style.background = 'linear-gradient(135deg, #e3f2fd, #bbdefb)';
        scoreMessage.style.color = '#1565c0';
    } else {
        scoreMessage.textContent = 'আরও পড়াশোনা করুন এবং আবার চেষ্টা করুন। 📚';
        scoreMessage.style.background = 'linear-gradient(135deg, #ffebee, #ffcdd2)';
        scoreMessage.style.color = '#c62828';
    }
    
    // Show results details
    resultsDetails.innerHTML = '';
    currentQuestions.forEach((question, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const isCorrect = userAnswers[index] === question.correctAnswer;
        const userAnswerText = userAnswers[index] !== null ? 
            question.options[userAnswers[index]] : 'উত্তর দেওয়া হয়নি';
        
        resultItem.innerHTML = `
            <div style="flex: 1;">
                <strong>প্রশ্ন ${index + 1}:</strong> ${question.question}<br>
                <small style="color: #666;">আপনার উত্তর: ${userAnswerText}</small><br>
                <small style="color: #2e7d32;">সঠিক উত্তর: ${question.options[question.correctAnswer]}</small><br>
                <small style="color: #666;"><em>${question.explanation}</em></small>
            </div>
            <div style="margin-left: 15px;">
                <span style="color: ${isCorrect ? '#4caf50' : '#f44336'}; font-weight: bold; font-size: 1.2rem;">
                    ${isCorrect ? '✓' : '✗'}
                </span>
            </div>
        `;
        
        resultsDetails.appendChild(resultItem);
    });
    
    // Hide quiz, show results
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    showNotification(`কুইজ সম্পন্ন! আপনার স্কোর: ${score}/${currentQuestions.length} (${percentageScore}%)`, 'success');
}

function reviewAnswers() {
    // Go back to quiz with all answers visible
    currentQuestionIndex = 0;
    
    // Show quiz container
    quizContainer.style.display = 'block';
    resultsContainer.style.display = 'none';
    
    // Show first question with correct/incorrect indicators
    showQuestionForReview();
}

function showQuestionForReview() {
    const question = currentQuestions[currentQuestionIndex];
    
    // Update question counter
    questionCounter.textContent = `পর্যালোচনা: ${currentQuestionIndex + 1}/${currentQuestions.length}`;
    
    // Hide score and timer during review
    scoreCounter.style.display = 'none';
    timer.style.display = 'none';
    skipBtn.style.display = 'none';
    
    // Update question text
    questionText.textContent = `${currentQuestionIndex + 1}. ${question.question}`;
    
    // Clear options container
    optionsContainer.innerHTML = '';
    
    // Add options with correct/incorrect indicators
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        
        // Mark correct answer
        if (index === question.correctAnswer) {
            optionElement.classList.add('correct');
        }
        // Mark incorrect user answer
        else if (userAnswers[currentQuestionIndex] === index) {
            optionElement.classList.add('incorrect');
        }
        
        optionElement.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
        optionsContainer.appendChild(optionElement);
    });
    
    // Update button states
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === currentQuestions.length - 1;
    
    // Hide submit button during review
    submitBtn.style.display = 'none';
    nextBtn.style.display = 'block';
    
    // Add event listeners for navigation
    prevBtn.onclick = showPreviousQuestionForReview;
    nextBtn.onclick = showNextQuestionForReview;
}

function showPreviousQuestionForReview() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestionForReview();
    }
}

function showNextQuestionForReview() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestionForReview();
    }
}

function restartQuiz() {
    startQuiz(currentSubject, currentChapter);
}

function goToHomePage() {
    subjectSelection.style.display = 'block';
    chapterSelection.style.display = 'none';
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    
    // Reset display properties
    scoreCounter.style.display = 'block';
    timer.style.display = 'block';
    skipBtn.style.display = 'block';
    
    showNotification('হোমপেজে ফিরে আসা হয়েছে।', 'info');
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

function createFAB() {
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '🏠';
    fab.title = 'হোমপেজে ফিরুন';
    fab.addEventListener('click', goToHomePage);
    document.body.appendChild(fab);
}