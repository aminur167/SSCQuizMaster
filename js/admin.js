// Question Management System
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
    
    // Add new question
    addQuestion(subject, chapter, questionData) {
        if (!this.questions[subject]) {
            this.questions[subject] = {};
        }
        
        if (!this.questions[subject][chapter]) {
            this.questions[subject][chapter] = [];
        }
        
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
                ...newData
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
            version: '1.0',
            questions: this.questions
        };
    }
    
    // Import data from backup
    importData(data) {
        if (data.questions) {
            this.questions = data.questions;
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }
    
    // Get statistics
    getStatistics() {
        let totalQuestions = 0;
        let subjectsCount = 0;
        let chaptersCount = 0;
        
        for (const subject in this.questions) {
            if (Object.keys(this.questions[subject]).length > 0) {
                subjectsCount++;
            }
            for (const chapter in this.questions[subject]) {
                chaptersCount++;
                totalQuestions += this.questions[subject][chapter].length;
            }
        }
        
        return {
            totalQuestions,
            subjectsCount,
            chaptersCount,
            lastUpdated: new Date().toLocaleString('bn-BD')
        };
    }
    
    // Save to localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('ssc_quizmaster_questions', JSON.stringify(this.questions));
            console.log('Questions saved to localStorage');
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
                this.questions = { ...this.initializeQuestionStructure(), ...parsed };
                console.log('Questions loaded from localStorage');
                
                // Log statistics
                const stats = this.getStatistics();
                console.log('Question Statistics:', stats);
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
    
    // Clear all data (dangerous - use with caution)
    clearAllData() {
        if (confirm('আপনি কি নিশ্চিত যে আপনি সব প্রশ্ন ডিলিট করতে চান? এই কাজটি undo করা যাবে না!')) {
            this.questions = this.initializeQuestionStructure();
            this.saveToLocalStorage();
            alert('সব প্রশ্ন ডিলিট করা হয়েছে!');
            return true;
        }
        return false;
    }
}

// Initialize Question Manager
const questionManager = new QuestionManager();

// Make it globally available for other scripts
window.questionManager = questionManager;

// Admin Utility Functions
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
    }
};

console.log('Admin system initialized successfully!');