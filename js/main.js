// Global variables
let currentDepartment = null;
let currentSubject = null;
let currentChapter = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeLeft = 480; // 8 minutes in seconds
let quizStarted = false;
let isAdminLoggedIn = false;

// PWA Install Variables
let deferredPrompt;
let installPrompt;
let installBtn;
let closeInstallBtn;
let installHelp;
let closeInstallHelp;

// Bengali option labels
const optionLabels = ['ক', 'খ', 'গ', 'ঘ'];

// 🔒 SECURE: Admin credentials - CHANGE THESE IN PRODUCTION
const ADMIN_CREDENTIALS = {
    username: "SSCMaster2024",
    password: "Admin@Secure#123!"
};

// DOM Elements
const screens = {
    home: document.getElementById('home-screen'),
    department: document.getElementById('department-selection'),
    subject: document.getElementById('subject-selection'),
    chapter: document.getElementById('chapter-selection'),
    quiz: document.getElementById('quiz-screen'),
    results: document.getElementById('results-screen'),
    admin: document.getElementById('admin-panel')
};

// Navigation buttons
document.getElementById('back-to-departments').addEventListener('click', () => showScreen('department'));
document.getElementById('back-to-subjects').addEventListener('click', () => showScreen('subject'));
document.getElementById('back-to-chapters').addEventListener('click', () => showScreen('chapter'));
document.getElementById('back-to-chapters-from-results').addEventListener('click', () => showScreen('chapter'));

// Home navigation
document.getElementById('homeBtn').addEventListener('click', () => showScreen('home'));
document.getElementById('home-from-results').addEventListener('click', () => showScreen('home'));
document.getElementById('home-from-admin').addEventListener('click', () => showScreen('home'));

// Quick actions
document.getElementById('startQuizBtn').addEventListener('click', () => showScreen('department'));
document.getElementById('viewProgressBtn').addEventListener('click', () => {
    alert('প্রোগ্রেস ট্র্যাকিং শীঘ্রই আসছে...');
});

// Admin DOM Elements
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminModal = document.getElementById('adminModal');
const adminLoginForm = document.getElementById('adminLoginForm');
const closeAdminModal = document.getElementById('closeAdminModal');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

// Admin Event Listeners
adminLoginBtn.addEventListener('click', showAdminLogin);
closeAdminModal.addEventListener('click', hideAdminLogin);
adminLoginForm.addEventListener('submit', handleAdminLogin);
adminLogoutBtn.addEventListener('click', handleAdminLogout);

// Department selection
document.querySelectorAll('.department-card').forEach(card => {
    card.addEventListener('click', () => {
        const departmentId = card.getAttribute('data-department');
        selectDepartment(departmentId);
    });
});

// Admin Card Event Listeners
document.querySelectorAll('.admin-card').forEach(card => {
    card.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        handleAdminAction(action);
    });
});

// ==================== ENHANCED PWA INSTALL LOGIC ====================

// Initialize PWA Install System
function initPWAInstall() {
    installPrompt = document.getElementById('installPrompt');
    installBtn = document.getElementById('installBtn');
    closeInstallBtn = document.getElementById('closeInstallBtn');
    installHelp = document.getElementById('installHelp');
    closeInstallHelp = document.getElementById('closeInstallHelp');

    // Show install prompt when app can be installed
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        console.log('PWA: App can be installed - BeforeInstallPrompt event fired');
        
        // Show install prompt after 3 seconds
        setTimeout(() => {
            if (!isAppInstalled()) {
                showInstallPrompt();
            }
        }, 3000);
    });

    // Install button click
    if (installBtn) {
        installBtn.addEventListener('click', handleInstallClick);
    }

    // Close install prompt
    if (closeInstallBtn) {
        closeInstallBtn.addEventListener('click', hideInstallPrompt);
    }

    // Close install help
    if (closeInstallHelp) {
        closeInstallHelp.addEventListener('click', hideInstallHelp);
    }

    // Check if app is already installed
    checkIfAppInstalled();

    // Add install help button to footer
    addInstallHelpButton();
}

// Handle install button click
async function handleInstallClick() {
    if (!deferredPrompt) {
        // If install prompt not available, show manual instructions
        showInstallHelp();
        return;
    }
    
    try {
        console.log('PWA: Showing install prompt to user');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('PWA: User choice:', outcome);
        
        if (outcome === 'accepted') {
            console.log('PWA: User installed the app');
            hideInstallPrompt();
            showInstallSuccess();
        } else {
            console.log('PWA: User dismissed the install prompt');
            // Show manual instructions if user declines
            setTimeout(() => {
                showInstallHelp();
            }, 1000);
        }
        
        deferredPrompt = null;
    } catch (error) {
        console.error('PWA: Install error', error);
        showInstallHelp();
    }
}

// Show install prompt with better animation
function showInstallPrompt() {
    if (installPrompt && !isAppInstalled()) {
        installPrompt.style.display = 'block';
        installPrompt.classList.add('show');
        console.log('PWA: Showing install prompt');
        
        // Auto hide after 30 seconds
        setTimeout(() => {
            if (installPrompt.style.display === 'block') {
                hideInstallPrompt();
            }
        }, 30000);
    }
}

// Hide install prompt with animation
function hideInstallPrompt() {
    if (installPrompt) {
        installPrompt.classList.remove('show');
        installPrompt.classList.add('hide');
        setTimeout(() => {
            installPrompt.style.display = 'none';
            installPrompt.classList.remove('hide');
        }, 300);
    }
}

// Show install help instructions with better content
function showInstallHelp() {
    if (installHelp) {
        installHelp.style.display = 'flex';
        installHelp.classList.add('show');
        hideInstallPrompt();
        
        // Update instructions based on device
        updateInstallInstructions();
    }
}

// Update install instructions based on device
function updateInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    const androidStep = document.querySelector('.step:nth-child(1)');
    const iosStep = document.querySelector('.step:nth-child(2)');
    
    if (isAndroid && androidStep) {
        androidStep.innerHTML = `
            <strong>Android-এ ইন্সটল করুন:</strong><br>
            1. Chrome browser-এ ⋮ তিন ডট মেনু ট্যাপ করুন<br>
            2. "Home screen-এ যোগ করুন" সিলেক্ট করুন<br>
            3️. "যোগ করুন" বাটন ট্যাপ করুন<br>
            4. এখন Home screen থেকে অ্যাপ এক্সেস করুন
        `;
        androidStep.style.display = 'block';
        if (iosStep) iosStep.style.display = 'none';
    } else if (isIOS && iosStep) {
        iosStep.innerHTML = `
            <strong>iPhone-এ ইন্সটল করুন:</strong><br>
            1. Safari-তে ⎙ Share বাটন ট্যাপ করুন<br>
            2. নিচে স্ক্রল করে "Home Screen-এ যোগ করুন" ট্যাপ করুন<br>
            3️. "যোগ করুন" বাটন ট্যাপ করুন<br>
            4. এখন Home screen থেকে অ্যাপ এক্সেস করুন
        `;
        iosStep.style.display = 'block';
        if (androidStep) androidStep.style.display = 'none';
    } else {
        // Show both for other devices
        if (androidStep) androidStep.style.display = 'block';
        if (iosStep) iosStep.style.display = 'block';
    }
}

// Hide install help
function hideInstallHelp() {
    if (installHelp) {
        installHelp.style.display = 'none';
        installHelp.classList.remove('show');
    }
}

// Show install success message
function showInstallSuccess() {
    // Create a custom success message
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        color: white;
        padding: 25px;
        border-radius: 15px;
        text-align: center;
        z-index: 10002;
        box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        animation: scaleIn 0.4s ease;
        border: 2px solid #2ecc71;
        max-width: 300px;
        width: 90%;
    `;
    successMessage.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 15px;">🎉</div>
        <h3 style="margin: 0 0 12px 0; font-size: 1.3rem; font-weight: bold;">সফলভাবে ইন্সটল হয়েছে!</h3>
        <p style="margin: 0; font-size: 0.95rem; line-height: 1.4;">অ্যাপটি আপনার Home Screen-এ যোগ করা হয়েছে। এখন থেকে দ্রুত এক্সেস করতে পারবেন!</p>
    `;
    
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.style.animation = 'scaleIn 0.3s ease reverse forwards';
        setTimeout(() => {
            successMessage.remove();
        }, 300);
    }, 3000);
}

// Check if app is already installed
function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
}

// Check if app is running in standalone mode
function checkIfAppInstalled() {
    if (isAppInstalled()) {
        console.log('PWA: App is running in standalone mode');
        document.body.classList.add('standalone');
        hideInstallPrompt();
    }
}

// Add install help button to footer
function addInstallHelpButton() {
    setTimeout(() => {
        const developerInfo = document.querySelector('.developer-info');
        if (developerInfo && !document.querySelector('.install-help-btn')) {
            const installHelpBtn = document.createElement('button');
            installHelpBtn.className = 'install-help-btn';
            installHelpBtn.innerHTML = '📱 অ্যাপ ইন্সটল করুন';
            installHelpBtn.onclick = showInstallHelp;
            developerInfo.appendChild(installHelpBtn);
        }
    }, 2000);
}

// ==================== ENHANCED CONTACT SYSTEM ====================

// Initialize contact system
function initContactSystem() {
    const contactToggle = document.getElementById('contactToggle');
    const contactDetails = document.getElementById('contactDetails');
    const closeContact = document.getElementById('closeContact');
    let isContactOpen = false;

    // Toggle contact details with enhanced animation
    if (contactToggle && contactDetails) {
        contactToggle.addEventListener('click', function() {
            isContactOpen = !isContactOpen;
            if (isContactOpen) {
                contactDetails.style.display = 'block';
                contactToggle.classList.add('active');
                setTimeout(() => {
                    contactDetails.classList.add('show');
                }, 10);
            } else {
                contactDetails.classList.remove('show');
                contactToggle.classList.remove('active');
                setTimeout(() => {
                    contactDetails.style.display = 'none';
                }, 400);
            }
        });

        // Close contact details
        if (closeContact) {
            closeContact.addEventListener('click', function() {
                contactDetails.classList.remove('show');
                contactToggle.classList.remove('active');
                setTimeout(() => {
                    contactDetails.style.display = 'none';
                    isContactOpen = false;
                }, 400);
            });
        }
    }
}

// Enhanced phone call function
function callPhone(phoneNumber) {
    const userConfirmed = confirm(`আপনি কি ${phoneNumber} নম্বরে কল করতে চান?`);
    if (userConfirmed) {
        window.open(`tel:${phoneNumber}`);
        // Log the action
        console.log(`Call initiated to: ${phoneNumber} at ${new Date().toLocaleString()}`);
    }
}

// Enhanced email function
function sendEmail(emailAddress) {
    const subject = encodeURIComponent('SSCQuizMaster সম্পর্কে যোগাযোগ');
    const body = encodeURIComponent(`প্রিয় আমিনুর ইসলাম,\n\nআমি আপনার SSCQuizMaster ওয়েবসাইটটি দেখেছি এবং খুবই impressed হয়েছি। আমি নিচের বিষয়ে আপনার সাথে যোগাযোগ করতে চাই:\n\n- [আপনার বার্তা এখানে লিখুন]\n\n\nআপনার সাড়ার অপেক্ষায় রইলাম।\n\nশুভেচ্ছান্তে,\n[আপনার নাম]`);
    window.open(`mailto:${emailAddress}?subject=${subject}&body=${body}`);
    
    // Log the action
    console.log(`Email initiated to: ${emailAddress} at ${new Date().toLocaleString()}`);
}

// ==================== APP INITIALIZATION ====================

// Initialize the app
function initApp() {
    showScreen('home');
    
    // Initialize PWA Install System
    initPWAInstall();
    
    // Initialize Contact System
    initContactSystem();
    
    // Load questions from localStorage if available
    if (typeof questionManager !== 'undefined') {
        questionManager.loadFromLocalStorage();
    }
    
    // Check if app is installed
    checkIfAppInstalled();

    // Show welcome message for first time users
    showWelcomeMessage();
}

// Show welcome message
function showWelcomeMessage() {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
        setTimeout(() => {
            if (confirm('🎉 SSCQuizMaster-এ স্বাগতম!\n\nঅ্যাপটি Home Screen-এ যোগ করে দ্রুত এক্সেস পেতে চান?')) {
                showInstallHelp();
            }
            localStorage.setItem('hasSeenWelcome', 'true');
        }, 2000);
    }
}

// Show specific screen
function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the requested screen
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
    }
    
    // Stop timer if moving away from quiz
    if (screenName !== 'quiz' && quizStarted) {
        stopTimer();
        quizStarted = false;
    }
    
    // Update document title based on screen
    updateDocumentTitle(screenName);
}

// Update document title based on current screen
function updateDocumentTitle(screenName) {
    const titles = {
        'home': 'SSCQuizMaster - হোম',
        'department': 'SSCQuizMaster - বিভাগ নির্বাচন',
        'subject': 'SSCQuizMaster - বিষয় নির্বাচন',
        'chapter': 'SSCQuizMaster - অধ্যায় নির্বাচন',
        'quiz': 'SSCQuizMaster - কুইজ',
        'results': 'SSCQuizMaster - ফলাফল',
        'admin': 'SSCQuizMaster - এডমিন প্যানেল'
    };
    
    document.title = titles[screenName] || 'SSCQuizMaster';
}

// Department selection
function selectDepartment(departmentId) {
    currentDepartment = subjectsData.find(dept => dept.id === departmentId);
    if (!currentDepartment) return;
    
    // Update department title
    document.getElementById('department-title').textContent = currentDepartment.name;
    
    // Clear previous subjects
    const subjectList = document.getElementById('subject-list');
    subjectList.innerHTML = '';
    
    // Add subjects to the grid
    currentDepartment.subjects.forEach(subject => {
        const subjectItem = document.createElement('div');
        subjectItem.className = 'subject-item';
        subjectItem.setAttribute('data-subject', subject.id);
        
        subjectItem.innerHTML = `
            <div class="subject-icon">${subject.icon}</div>
            <div class="subject-info">
                <h3>${subject.name}</h3>
                <p>${getSubjectDescription(subject.id)}</p>
            </div>
        `;
        
        subjectItem.addEventListener('click', () => selectSubject(subject));
        subjectList.appendChild(subjectItem);
    });
    
    showScreen('subject');
}

// Get subject description
function getSubjectDescription(subjectId) {
    const descriptions = {
        'physics': 'পদার্থবিজ্ঞানের মৌলিক ধারণা ও প্রয়োগ',
        'chemistry': 'রাসায়নিক বিক্রিয়া ও পদার্থের গঠন',
        'biology': 'জীবনের রহস্য ও প্রাকৃতিক ব্যবস্থা',
        'math': 'সংখ্যা, জ্যামিতি ও বীজগণিতের সমস্যা সমাধান',
        'history': 'ইতিহাসের গুরুত্বপূর্ণ ঘটনা ও সময়রেখা',
        'geography': 'ভূগোল, পরিবেশ ও প্রাকৃতিক সম্পদ',
        'science_human': 'মানব বিজ্ঞান ও প্রযুক্তি',
        'civics': 'নাগরিকত্ব, সরকার ও রাজনীতি',
        'bangla': 'বাংলা ভাষা, সাহিত্য ও সংস্কৃতি',
        'agriculture': 'কৃষি বিজ্ঞান ও প্রযুক্তি',
        'ict': 'তথ্য প্রযুক্তি ও কম্পিউটার বিজ্ঞান',
        'islam': 'ইসলামী শিক্ষা ও নৈতিক মূল্যবোধ'
    };
    
    return descriptions[subjectId] || 'বিষয় সম্পর্কিত কুইজ';
}

// Subject selection
function selectSubject(subject) {
    currentSubject = subject;
    
    // Update subject title
    document.getElementById('subject-title').textContent = subject.name;
    
    // Clear previous chapters
    const chapterList = document.getElementById('chapter-list');
    chapterList.innerHTML = '';
    
    // Handle subjects with sections (like Bangla)
    if (subject.sections) {
        subject.sections.forEach(section => {
            // Add section header
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'section-header';
            sectionHeader.style.gridColumn = '1 / -1';
            sectionHeader.style.padding = '15px';
            sectionHeader.style.background = '#f8f9fa';
            sectionHeader.style.borderRadius = '8px';
            sectionHeader.style.marginBottom = '10px';
            sectionHeader.innerHTML = `<h3 style="margin:0; color:#2c3e50;">${section.icon} ${section.name}</h3>`;
            chapterList.appendChild(sectionHeader);
            
            // Add chapters for this section
            section.chapters.forEach(chapter => {
                addChapterToGrid(chapter, chapterList);
            });
        });
    } else {
        // Regular subjects with direct chapters
        subject.chapters.forEach(chapter => {
            addChapterToGrid(chapter, chapterList);
        });
    }
    
    showScreen('chapter');
}

// Add chapter to grid
function addChapterToGrid(chapter, chapterList) {
    const chapterItem = document.createElement('div');
    chapterItem.className = 'chapter-item';
    chapterItem.setAttribute('data-chapter', chapter.id);
    
    chapterItem.innerHTML = `
        <div class="chapter-icon">${chapter.icon}</div>
        <div class="chapter-info">
            <h3>${chapter.name}</h3>
            <p>২০টি MCQ প্রশ্ন</p>
        </div>
    `;
    
    chapterItem.addEventListener('click', () => startQuiz(chapter));
    chapterList.appendChild(chapterItem);
}

// Start quiz for a chapter
function startQuiz(chapter) {
    currentChapter = chapter;
    
    // Update quiz title
    document.getElementById('quiz-title').textContent = `${currentSubject.name} - ${chapter.name}`;
    
    // Load questions based on department and subject
    loadQuestions();
    
    // Initialize quiz state
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);
    timeLeft = 480; // 8 minutes
    quizStarted = true;
    
    // Update timer display
    updateTimerDisplay();
    
    // Start timer
    startTimer();
    
    // Show first question
    showQuestion(currentQuestionIndex);
    
    // Initialize navigation dots
    initQuestionNavigation();
    
    showScreen('quiz');
}

// Load questions based on current department and subject
function loadQuestions() {
    const subjectId = currentSubject.id;
    const chapterId = currentChapter.id;
    
    // First check if we have custom questions from localStorage
    if (typeof questionManager !== 'undefined') {
        const customQuestions = questionManager.getQuestions(subjectId, chapterId);
        if (customQuestions && customQuestions.length > 0) {
            currentQuestions = customQuestions;
            return;
        }
    }
    
    // If no custom questions, load from default files
    let questions = [];
    
    if (currentDepartment.id === 'science') {
        switch(subjectId) {
            case 'physics':
                questions = physicsQuestions[chapterId] || [];
                break;
            case 'chemistry':
                questions = chemistryQuestions[chapterId] || [];
                break;
            case 'biology':
                questions = biologyQuestions[chapterId] || [];
                break;
            case 'math':
                questions = mathQuestions[chapterId] || [];
                break;
        }
    } else if (currentDepartment.id === 'arts') {
        switch(subjectId) {
            case 'history':
                questions = historyQuestions[chapterId] || [];
                break;
            case 'geography':
                questions = geographyQuestions[chapterId] || [];
                break;
            case 'science_human':
                questions = scienceHumanQuestions[chapterId] || [];
                break;
            case 'civics':
                questions = civicsQuestions[chapterId] || [];
                break;
        }
    } else if (currentDepartment.id === 'general') {
        switch(subjectId) {
            case 'bangla':
                if (currentChapter.id.includes('story_')) {
                    questions = banglaQuestions.stories[chapterId] || [];
                } else {
                    questions = banglaQuestions.poetry[chapterId] || [];
                }
                break;
            case 'agriculture':
                questions = agricultureQuestions[chapterId] || [];
                break;
            case 'ict':
                questions = ictQuestions[chapterId] || [];
                break;
            case 'islam':
                questions = islamQuestions[chapterId] || [];
                break;
        }
    }
    
    currentQuestions = questions;
    
    // If no questions found, show a message
    if (currentQuestions.length === 0) {
        currentQuestions = [{
            id: 1,
            question: 'এই চ্যাপ্টারের জন্য প্রশ্ন এখনও যোগ করা হয়নি।',
            options: ['প্রশ্ন যোগ করা হয়নি', 'এডমিন থেকে যোগ করুন', 'পরবর্তী আপডেটে', 'কোনোটিই না'],
            correctAnswer: 1
        }];
    }
}

// Show question at specific index
function showQuestion(index) {
    if (index < 0 || index >= currentQuestions.length) return;
    
    currentQuestionIndex = index;
    const question = currentQuestions[index];
    
    // Update question text
    document.getElementById('question-text').textContent = `${index + 1}. ${question.question}`;
    
    // Update progress
    document.getElementById('quiz-progress').textContent = `প্রশ্ন ${index + 1}/${currentQuestions.length}`;
    
    // Update options with Bengali labels
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, optionIndex) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        if (userAnswers[index] === optionIndex) {
            optionElement.classList.add('selected');
        }
        
        optionElement.innerHTML = `
            <div class="option-label">${optionLabels[optionIndex]}</div>
            <div class="option-text">${option}</div>
        `;
        
        optionElement.addEventListener('click', () => selectOption(optionIndex));
        optionsContainer.appendChild(optionElement);
    });
    
    // Update navigation
    updateQuestionNavigation();
    
    // Update control buttons
    document.getElementById('prev-btn').disabled = index === 0;
    document.getElementById('next-btn').disabled = index === currentQuestions.length - 1;
}

// Select an option
function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Update UI to show selected option
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
        if (index === optionIndex) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    // Update navigation dot
    updateQuestionNavigation();
}

// Initialize question navigation dots
function initQuestionNavigation() {
    const navContainer = document.querySelector('.question-navigation');
    navContainer.innerHTML = '';
    
    for (let i = 0; i < currentQuestions.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'nav-dot';
        dot.textContent = i + 1;
        dot.setAttribute('data-index', i);
        
        dot.addEventListener('click', () => {
            showQuestion(i);
        });
        
        navContainer.appendChild(dot);
    }
    
    updateQuestionNavigation();
}

// Update question navigation
function updateQuestionNavigation() {
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('current', 'answered');
        
        if (index === currentQuestionIndex) {
            dot.classList.add('current');
        }
        
        if (userAnswers[index] !== null) {
            dot.classList.add('answered');
        }
    });
}

// Navigation controls
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    }
});

document.getElementById('skip-btn').addEventListener('click', () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    }
});

// Submit quiz
document.getElementById('submit-quiz').addEventListener('click', () => {
    if (confirm('আপনি কি নিশ্চিত যে আপনি কুইজটি সাবমিট করতে চান?')) {
        submitQuiz();
    }
});

// Submit quiz and show results
function submitQuiz() {
    stopTimer();
    calculateResults();
    showScreen('results');
}

// Timer functions
function startTimer() {
    stopTimer(); // Clear any existing timer
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            submitQuiz();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('quiz-timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Change color when time is running out
    if (timeLeft <= 60) {
        document.getElementById('quiz-timer').style.color = '#e74c3c';
    }
}

// Calculate results
function calculateResults() {
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    
    // Calculate scores
    userAnswers.forEach((answer, index) => {
        if (answer === null) {
            unansweredCount++;
        } else if (answer === currentQuestions[index].correctAnswer) {
            correctCount++;
        } else {
            wrongCount++;
        }
    });
    
    const totalScore = correctCount * 1; // 1 mark per correct answer
    
    // Update results display
    document.getElementById('total-score').textContent = totalScore;
    document.getElementById('correct-answers').textContent = correctCount;
    document.getElementById('wrong-answers').textContent = wrongCount;
    
    // Calculate rank (simple implementation)
    const rank = calculateRank(totalScore);
    document.getElementById('user-rank').textContent = rank;
    
    // Show detailed results
    showDetailedResults();
}

// Calculate rank based on score
function calculateRank(score) {
    const maxScore = currentQuestions.length;
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'A-';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
}

// Show detailed results for each question
function showDetailedResults() {
    const resultsContainer = document.getElementById('question-results');
    resultsContainer.innerHTML = '';
    
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        const resultElement = document.createElement('div');
        resultElement.className = `question-result ${isCorrect ? 'correct' : 'incorrect'}`;
        
        // Format user's answer display
        let userAnswerText = 'উত্তর দেওয়া হয়নি';
        if (userAnswer !== null) {
            userAnswerText = `${optionLabels[userAnswer]}. ${question.options[userAnswer]}`;
        }
        
        // Format correct answer display
        const correctAnswerText = `${optionLabels[question.correctAnswer]}. ${question.options[question.correctAnswer]}`;
        
        resultElement.innerHTML = `
            <div class="question-result-header">
                <div class="question-number">প্রশ্ন ${index + 1}</div>
                <div class="result-status ${isCorrect ? 'correct' : 'incorrect'}">
                    ${isCorrect ? 'সঠিক' : 'ভুল'}
                </div>
            </div>
            <div class="question-text">${question.question}</div>
            <div class="answer-comparison">
                <div class="your-answer">
                    <strong>আপনার উত্তর:</strong> ${userAnswerText}
                </div>
                <div class="correct-answer">
                    <strong>সঠিক উত্তর:</strong> ${correctAnswerText}
                </div>
            </div>
        `;
        
        resultsContainer.appendChild(resultElement);
    });
}

// ==================== ADMIN FUNCTIONS ====================

// Show admin login modal
function showAdminLogin() {
    adminModal.style.display = 'block';
}

// Hide admin login modal
function hideAdminLogin() {
    adminModal.style.display = 'none';
    // Clear form and hide any error messages
    document.getElementById('adminLoginForm').reset();
}

// 🔒 SECURE: Handle admin login with generic error messages
function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Simple encryption for comparison (not for production)
    const encryptedUsername = btoa(username);
    const encryptedPassword = btoa(password);
    
    const storedUsername = btoa(ADMIN_CREDENTIALS.username);
    const storedPassword = btoa(ADMIN_CREDENTIALS.password);
    
    if (encryptedUsername === storedUsername && encryptedPassword === storedPassword) {
        isAdminLoggedIn = true;
        adminModal.style.display = 'none';
        showScreen('admin-panel');
        
        // Clear form
        document.getElementById('adminLoginForm').reset();
        
        // Log admin access
        console.log('Admin login successful at: ' + new Date().toLocaleString());
    } else {
        // 🔒 Generic error message - no hints
        alert('ইনভ্যালিড ক্রেডেনশিয়াল। আবার চেষ্টা করুন।');
        
        // Log failed attempt
        console.log('Failed admin login attempt at: ' + new Date().toLocaleString());
    }
}

// Handle admin logout
function handleAdminLogout() {
    isAdminLoggedIn = false;
    showScreen('home');
    
    // Clear any admin data from memory
    currentDepartment = null;
    currentSubject = null;
    currentChapter = null;
    
    console.log('Admin logout at: ' + new Date().toLocaleString());
}

// Handle admin actions
function handleAdminAction(action) {
    if (!isAdminLoggedIn) {
        showAdminLogin();
        return;
    }
    
    switch(action) {
        case 'add-question':
            showAddQuestionForm();
            break;
        case 'edit-question':
            alert('শীঘ্রই আসছে...');
            break;
        case 'view-stats':
            showStatistics();
            break;
        case 'backup-data':
            backupData();
            break;
    }
}

// Show add question form
function showAddQuestionForm() {
    const formContainer = document.getElementById('addQuestionForm');
    formContainer.style.display = 'block';
    
    // Populate subject dropdown
    const subjectSelect = document.getElementById('questionSubject');
    subjectSelect.innerHTML = '<option value="">বিষয় নির্বাচন করুন</option>';
    
    subjectsData.forEach(dept => {
        dept.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            subjectSelect.appendChild(option);
        });
    });
    
    // Add event listener for subject change
    subjectSelect.addEventListener('change', function() {
        populateChapters(this.value);
    });
    
    // Add form submit handler
    document.getElementById('questionForm').onsubmit = handleAddQuestion;
    document.getElementById('cancelAddQuestion').onclick = hideAddQuestionForm;
}

// Hide add question form
function hideAddQuestionForm() {
    document.getElementById('addQuestionForm').style.display = 'none';
    document.getElementById('questionForm').reset();
}

// Populate chapters based on selected subject
function populateChapters(subjectId) {
    const chapterSelect = document.getElementById('questionChapter');
    chapterSelect.innerHTML = '<option value="">অধ্যায় নির্বাচন করুন</option>';
    
    if (!subjectId) return;
    
    // Find the subject
    let chapters = [];
    subjectsData.forEach(dept => {
        dept.subjects.forEach(subject => {
            if (subject.id === subjectId) {
                if (subject.sections) {
                    subject.sections.forEach(section => {
                        chapters = chapters.concat(section.chapters);
                    });
                } else {
                    chapters = subject.chapters;
                }
            }
        });
    });
    
    // Add chapters to dropdown
    chapters.forEach(chapter => {
        const option = document.createElement('option');
        option.value = chapter.id;
        option.textContent = chapter.name;
        chapterSelect.appendChild(option);
    });
}

// Handle adding new question
function handleAddQuestion(e) {
    e.preventDefault();
    
    if (!isAdminLoggedIn) {
        alert('অনুগ্রহ করে আবার লগইন করুন।');
        showAdminLogin();
        return;
    }
    
    const subject = document.getElementById('questionSubject').value;
    const chapter = document.getElementById('questionChapter').value;
    const questionText = document.getElementById('questionText').value;
    const option1 = document.getElementById('option1').value;
    const option2 = document.getElementById('option2').value;
    const option3 = document.getElementById('option3').value;
    const option4 = document.getElementById('option4').value;
    const correctAnswer = parseInt(document.getElementById('correctAnswer').value);
    
    // Validate inputs
    if (!subject || !chapter || !questionText || !option1 || !option2 || !option3 || !option4) {
        alert('সমস্ত ফিল্ড পূরণ করুন।');
        return;
    }
    
    const newQuestion = {
        id: Date.now(), // Unique ID
        question: questionText,
        options: [option1, option2, option3, option4],
        correctAnswer: correctAnswer,
        created: new Date().toISOString(),
        createdBy: 'admin'
    };
    
    // Add question using question manager
    if (typeof questionManager !== 'undefined') {
        const success = questionManager.addQuestion(subject, chapter, newQuestion);
        if (success) {
            alert('প্রশ্ন সফলভাবে যোগ করা হয়েছে!');
            hideAddQuestionForm();
            
            // Log question addition
            console.log(`New question added to ${subject} > ${chapter} at: ${new Date().toLocaleString()}`);
        } else {
            alert('প্রশ্ন যোগ করতে সমস্যা হয়েছে।');
        }
    } else {
        alert('ত্রুটি: প্রশ্ন ম্যানেজার লোড হয়নি!');
    }
}

// Show statistics
function showStatistics() {
    if (typeof questionManager !== 'undefined') {
        const stats = questionManager.getStatistics();
        alert(`স্ট্যাটিস্টিক্স:\n\nমোট প্রশ্ন: ${stats.totalQuestions}\nবিষয়: ${stats.subjectsCount}\nঅধ্যায়: ${stats.chaptersCount}\nসর্বশেষ আপডেট: ${stats.lastUpdated}`);
    } else {
        alert('ত্রুটি: প্রশ্ন ম্যানেজার লোড হয়নি!');
    }
}

// Backup data function
function backupData() {
    if (typeof questionManager !== 'undefined') {
        const data = questionManager.exportData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ssc_quizmaster_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        alert('ডাটা ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!');
        
        // Log backup
        console.log(`Data backup created at: ${new Date().toLocaleString()}`);
    } else {
        alert('ত্রুটি: প্রশ্ন ম্যানেজার লোড হয়নি!');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);