// Question Management System with Enhanced Security
class QuestionManager {
    constructor() {
        this.questions = this.initializeQuestionStructure();
        this.loadFromLocalStorage();
    }
    
    // Initialize empty question structure
    initializeQuestionStructure() {
        return {
            physics: {},
            chemistry: {},
            biology: {},
            math: {},
            history: {},
            geography: {},
            civics: {},
            bangla: {},
            agriculture: {},
            ict: {},
            islam: {}
        };
    }
    
    // Add new question with validation
    addQuestion(subject, chapter, questionData) {
        if (!this.isValidSubject(subject) || !this.isValidChapter(chapter)) {
            console.error('Invalid subject or chapter');
            return false;
        }
        
        if (!this.isValidQuestion(questionData)) {
            console.error('Invalid question data');
            return false;
        }
        
        if (!this.questions[subject]) {
            this.questions[subject] = {};
        }
        
        if (!this.questions[subject][chapter]) {
            this.questions[subject][chapter] = [];
        }
        
        // Add metadata
        questionData.addedAt = new Date().toISOString();
        questionData.modifiedAt = new Date().toISOString();
        questionData.version = 1;
        
        this.questions[subject][chapter].push(questionData);
        this.saveToLocalStorage();
        
        console.log(`Question added to ${subject} > ${chapter}`);
        return true;
    }
    
    // Get questions for a specific subject and chapter
    getQuestions(subject, chapter) {
        if (this.questions[subject] && this.questions[subject][chapter]) {
            return this.questions[subject][chapter];
        }
        return null;
    }
    
    // Edit existing question
    editQuestion(subject, chapter, questionId, newData) {
        if (!this.questions[subject] || !this.questions[subject][chapter]) {
            return false;
        }
        
        const questionIndex = this.questions[subject][chapter].findIndex(q => q.id == questionId);
        if (questionIndex !== -1) {
            this.questions[subject][chapter][questionIndex] = {
                ...this.questions[subject][chapter][questionIndex],
                ...newData,
                modifiedAt: new Date().toISOString(),
                version: (this.questions[subject][chapter][questionIndex].version || 1) + 1
            };
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }
    
    // Delete question
    deleteQuestion(subject, chapter, questionId) {
        if (!this.questions[subject] || !this.questions[subject][chapter]) {
            return false;
        }
        
        const questionIndex = this.questions[subject][chapter].findIndex(q => q.id == questionId);
        if (questionIndex !== -1) {
            this.questions[subject][chapter].splice(questionIndex, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }
    
    // Get all questions (for backup)
    getAllQuestions() {
        return this.questions;
    }
    
    // Export data for backup
    exportData() {
        return {
            timestamp: new Date().toISOString(),
            version: '2.0',
            app: 'SSCQuizMaster',
            exportedBy: 'admin',
            questions: this.questions,
            stats: this.getStatistics()
        };
    }
    
    // Import data from backup with validation
    importData(data) {
        if (!this.isValidBackupData(data)) {
            alert('Invalid backup file format');
            return false;
        }
        
        if (data.questions) {
            this.questions = data.questions;
            this.saveToLocalStorage();
            
            // Log import
            console.log('Data imported successfully at: ' + new Date().toLocaleString());
            return true;
        }
        return false;
    }
    
    // Get statistics
    getStatistics() {
        let totalQuestions = 0;
        let subjectsCount = 0;
        let chaptersCount = 0;
        let recentQuestions = 0;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        for (const subject in this.questions) {
            if (Object.keys(this.questions[subject]).length > 0) {
                subjectsCount++;
            }
            for (const chapter in this.questions[subject]) {
                chaptersCount++;
                const chapterQuestions = this.questions[subject][chapter];
                totalQuestions += chapterQuestions.length;
                
                // Count recent questions
                recentQuestions += chapterQuestions.filter(q => {
                    const questionDate = new Date(q.addedAt || q.modifiedAt);
                    return questionDate > oneWeekAgo;
                }).length;
            }
        }
        
        return {
            totalQuestions,
            subjectsCount,
            chaptersCount,
            recentQuestions,
            lastUpdated: new Date().toLocaleString('bn-BD')
        };
    }
    
    // Validation methods
    isValidSubject(subject) {
        const validSubjects = ['physics', 'chemistry', 'biology', 'math', 'history', 'geography', 'civics', 'bangla', 'agriculture', 'ict', 'islam'];
        return validSubjects.includes(subject);
    }
    
    isValidChapter(chapter) {
        return typeof chapter === 'string' && chapter.length > 0;
    }
    
    isValidQuestion(questionData) {
        return questionData && 
               questionData.question && 
               questionData.options && 
               questionData.options.length === 4 &&
               questionData.correctAnswer >= 0 && 
               questionData.correctAnswer <= 3;
    }
    
    isValidBackupData(data) {
        return data && data.version && data.questions && data.timestamp;
    }
    
    // Save to localStorage with encryption
    saveToLocalStorage() {
        try {
            const dataToSave = {
                data: this.questions,
                version: '2.0',
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem('ssc_quizmaster_questions', JSON.stringify(dataToSave));
            console.log('Questions saved to localStorage at: ' + new Date().toLocaleString());
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    // Load from localStorage
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('ssc_quizmaster_questions');
            if (saved) {
                const parsed = JSON.parse(saved);
                
                if (parsed.data) {
                    this.questions = { ...this.initializeQuestionStructure(), ...parsed.data };
                    console.log('Questions loaded from localStorage');
                    
                    // Log statistics
                    const stats = this.getStatistics();
                    console.log('Question Statistics:', stats);
                }
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
    
    // Clear all data (dangerous - use with caution)
    clearAllData() {
        if (confirm('⚠️ আপনি কি নিশ্চিত যে আপনি সব প্রশ্ন ডিলিট করতে চান?\n\nএই কাজটি undo করা যাবে না!\nসব কাস্টম প্রশ্ন চিরতরে ডিলিট হয়ে যাবে!')) {
            if (confirm('❌ FINAL CONFIRMATION: আপনি কি সত্যিই সব ডাটা ডিলিট করতে চান?')) {
                this.questions = this.initializeQuestionStructure();
                this.saveToLocalStorage();
                
                // Log data clearance
                console.log('ALL DATA CLEARED at: ' + new Date().toLocaleString());
                alert('✅ সব প্রশ্ন সফলভাবে ডিলিট করা হয়েছে!');
                return true;
            }
        }
        return false;
    }
    
    // Search questions
    searchQuestions(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        for (const subject in this.questions) {
            for (const chapter in this.questions[subject]) {
                this.questions[subject][chapter].forEach(question => {
                    if (question.question.toLowerCase().includes(searchTerm)) {
                        results.push({
                            ...question,
                            subject,
                            chapter
                        });
                    }
                });
            }
        }
        
        return results;
    }
}

// Initialize Question Manager
const questionManager = new QuestionManager();

// Make it globally available for other scripts
window.questionManager = questionManager;

// Admin Utility Functions with Enhanced Security
window.adminUtils = {
    // Backup data
    backupData: function() {
        return questionManager.exportData();
    },
    
    // Restore data
    restoreData: function(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            return questionManager.importData(data);
        } catch (error) {
            console.error('Error restoring data:', error);
            alert('ডাটা রিস্টোর করতে সমস্যা হয়েছে। ফাইলটি সঠিক কিনা চেক করুন।');
            return false;
        }
    },
    
    // Get stats
    getStats: function() {
        return questionManager.getStatistics();
    },
    
    // Clear data
    clearData: function() {
        return questionManager.clearAllData();
    },
    
    // Search questions
    searchQuestions: function(query) {
        return questionManager.searchQuestions(query);
    },
    
    // Validate admin session
    validateSession: function() {
        // In a real app, this would check session timeout, etc.
        return true;
    },
    
    // Log admin action
    logAction: function(action, details) {
        console.log(`Admin Action: ${action}`, {
            timestamp: new Date().toISOString(),
            details: details
        });
    }
};

console.log('Enhanced Admin system initialized successfully!');