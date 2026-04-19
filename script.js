// API Configuration
const API_BASE_URL = 'http://localhost:8000';
const UPLOAD_ENDPOINT = `${API_BASE_URL}/api/v1/pdf/upload`;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const analyzeBtn = document.getElementById('analyzeBtn');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const loadingSection = document.getElementById('loadingSection');
const dashboard = document.getElementById('dashboard');
const uploadNavBtn = document.getElementById('uploadNavBtn');
const newUploadBtn = document.getElementById('newUploadBtn');
const footerUploadBtn = document.getElementById('footerUploadBtn');
const getStartedBtn = document.getElementById('getStartedBtn');
const loadingTitle = document.getElementById('loadingTitle');
const loadingMessage = document.getElementById('loadingMessage');
const uploadProgress = document.getElementById('uploadProgress');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const analysisProgress = document.getElementById('analysisProgress');

// New Analysis elements
const healthScore = document.getElementById('healthScore');
const healthLabel = document.getElementById('healthLabel');
const scoreCircle = document.getElementById('scoreCircle');
const scoreDescription = document.getElementById('scoreDescription');
const reasonsList = document.getElementById('reasonsList');
const insightsGrid = document.getElementById('insightsGrid');

// Global variables
let currentFile = null;
let isUploading = false;
let uploadProgressInterval = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Bharat FIL Frontend Initialized');
    initializeEventListeners();
    initializeAnimations();
    checkBackendHealth();
});

// Check if backend is running
async function checkBackendHealth() {
    try {
        console.log('🔍 Checking backend health at:', API_BASE_URL);
        const response = await fetch(`${API_BASE_URL}/docs`);
        if (response.ok) {
            console.log('✅ Backend is running');
        } else {
            console.warn('⚠️ Backend might not be running');
        }
    } catch (error) {
        console.warn('⚠️ Cannot connect to backend:', error.message);
        console.warn('   Please make sure the backend is running at:', API_BASE_URL);
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    // Upload button click
    uploadButton.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Click on upload area
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Analyze button click
    analyzeBtn.addEventListener('click', analyzePortfolio);
    
    // Navigation buttons
    uploadNavBtn.addEventListener('click', scrollToUploadSection);
    newUploadBtn.addEventListener('click', resetToUpload);
    footerUploadBtn.addEventListener('click', scrollToUploadSection);
    getStartedBtn.addEventListener('click', scrollToUploadSection);
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Initialize scroll animations
function initializeAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const fadeInOnScroll = function() {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.style.opacity = "1";
                element.style.transform = "translateY(0)";
            }
        });
    };
    
    fadeElements.forEach(element => {
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    });
    
    window.addEventListener('scroll', fadeInOnScroll);
    fadeInOnScroll();
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        currentFile = file;
        if (file.type === 'application/pdf') {
            showFilePreview(file.name);
            hideError();
        } else {
            showError('Please select a valid PDF file');
            currentFile = null;
            fileInput.value = '';
        }
    }
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file) {
        currentFile = file;
        if (file.type === 'application/pdf') {
            showFilePreview(file.name);
            hideError();
        } else {
            showError('Please drop a valid PDF file');
            currentFile = null;
        }
    }
}

// Show file preview
function showFilePreview(name) {
    fileName.textContent = name;
    filePreview.classList.add('active');
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze Portfolio';
}

// Analyze portfolio
async function analyzePortfolio() {
    console.log('🚀 Starting portfolio analysis...');
    
    if (!currentFile) {
        showError('Please upload a PDF file first');
        return;
    }
    
    if (currentFile.size > MAX_FILE_SIZE_BYTES) {
        showError(`File size should be less than ${MAX_FILE_SIZE_MB}MB`);
        return;
    }
    
    if (isUploading) {
        showError('Upload already in progress');
        return;
    }
    
    // Disable analyze button
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    isUploading = true;
    
    // Show upload progress
    uploadProgress.classList.add('active');
    updateUploadProgress(0, 'Preparing upload...');
    
    try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', currentFile);
        
        // Simulate upload progress
        simulateUploadProgress();
        
        // Make API call
        console.log(`📤 Uploading to: ${UPLOAD_ENDPOINT}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout
        
        const response = await fetch(UPLOAD_ENDPOINT, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`📥 Response status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Upload failed:', response.status, errorText);
            throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Upload successful! Response:', result);
        
        // Hide upload progress, show loading
        uploadProgress.classList.remove('active');
        showLoading('Analyzing PDF', 'Generating portfolio insights...');
        updateAnalysisProgress(50);
        
        // Process the result
        if (result.stocks && result.health_score !== undefined) {
            processAnalysisResult(result);
        } else {
            throw new Error('Invalid response format from server');
        }
        
    } catch (error) {
        console.error('❌ Error analyzing portfolio:', error);
        handleUploadError(error);
    }
}

// Process the analysis result
function processAnalysisResult(result) {
    console.log('🔍 Processing analysis result:', result);
    
    // Generate dynamic insights based on actual data
    const analysisData = {
        healthScore: result.health_score,
        healthLabel: result.health_label,
        reasons: result.reasons || generateReasonsFromScore(result.health_score, result.stocks),
        stocks: result.stocks,
        insights: generateDynamicInsights(result.stocks, result.health_score)
    };
    
    console.log('📊 Analysis data ready:', analysisData);
    updateAnalysisProgress(100);
    
    // Small delay to show completion
    setTimeout(() => {
        handleAnalysisComplete(analysisData);
    }, 500);
}

// Generate dynamic insights based on actual portfolio data
function generateDynamicInsights(stocks, healthScore) {
    const insights = [];
    
    if (!stocks || stocks.length === 0) return insights;
    
    // Calculate sector distribution
    const sectorDistribution = {};
    stocks.forEach(stock => {
        const sector = stock.sector;
        const percent = parseFloat(stock.portfolio_percent);
        sectorDistribution[sector] = (sectorDistribution[sector] || 0) + percent;
    });
    
    // 1. Top holdings insight
    const sortedStocks = [...stocks].sort((a, b) => 
        parseFloat(b.portfolio_percent) - parseFloat(a.portfolio_percent)
    );
    
    if (sortedStocks.length > 0) {
        const topStock = sortedStocks[0];
        const topPercent = parseFloat(topStock.portfolio_percent);
        
        let topStockSentiment = 'positive';
        let topStockSummary = '';
        
        if (topPercent > 20) {
            topStockSummary = `${topStock.name} portfolio ka ${topStock.portfolio_percent} hissa hai, jo ki high concentration dikhata hai. Diversification improve kar sakte hain.`;
            topStockSentiment = 'negative';
        } else if (topPercent > 10) {
            topStockSummary = `${topStock.name} portfolio ka ${topStock.portfolio_percent} share hai. ${topStock.sector} sector me significant exposure hai.`;
            topStockSentiment = 'neutral';
        } else {
            topStockSummary = `${topStock.name} portfolio ka ${topStock.portfolio_percent} share hai. Balanced exposure hai.`;
            topStockSentiment = 'positive';
        }
        
        insights.push({
            company: "Top Holding Analysis",
            summary: topStockSummary,
            sector: "Portfolio",
            sentiment: topStockSentiment,
            date: "Current"
        });
    }
    
    // 2. Sector concentration insight
    Object.entries(sectorDistribution).forEach(([sector, percentage]) => {
        if (percentage > 30) {
            insights.push({
                company: `${sector} Sector Concentration`,
                summary: `${sector} sector me ${percentage.toFixed(1)}% concentration hai. Sector-specific risk manage karna chahiye.`,
                sector: sector,
                sentiment: 'negative',
                date: "Current"
            });
        } else if (percentage > 20) {
            insights.push({
                company: `${sector} Sector Exposure`,
                summary: `${sector} sector me ${percentage.toFixed(1)}% exposure hai. Balanced hai.`,
                sector: sector,
                sentiment: 'neutral',
                date: "Current"
            });
        }
    });
    
    // 3. Portfolio diversification insight
    const uniqueSectors = Object.keys(sectorDistribution).length;
    const totalStocks = stocks.length;
    
    let diversificationSummary = '';
    let diversificationSentiment = 'neutral';
    
    if (uniqueSectors >= 5 && totalStocks >= 8) {
        diversificationSummary = `Portfolio ${totalStocks} stocks aur ${uniqueSectors} sectors me well diversified hai. Excellent risk management.`;
        diversificationSentiment = 'positive';
    } else if (uniqueSectors >= 3 && totalStocks >= 5) {
        diversificationSummary = `Portfolio ${totalStocks} stocks aur ${uniqueSectors} sectors me moderately diversified hai.`;
        diversificationSentiment = 'neutral';
    } else {
        diversificationSummary = `Portfolio me diversification improve kar sakte hain. Currently ${totalStocks} stocks aur ${uniqueSectors} sectors hain.`;
        diversificationSentiment = 'negative';
    }
    
    insights.push({
        company: "Diversification Analysis",
        summary: diversificationSummary,
        sector: "Portfolio",
        sentiment: diversificationSentiment,
        date: "Current"
    });
    
    // 4. Health score insight
    let healthInsight = '';
    let healthSentiment = 'positive';
    
    if (healthScore >= 90) {
        healthInsight = "Portfolio health score excellent hai (100/100). Risk well managed hai aur diversification perfect hai.";
    } else if (healthScore >= 70) {
        healthInsight = `Portfolio health score ${healthScore}/100 hai. Good diversification with manageable risk.`;
        healthSentiment = healthScore >= 80 ? 'positive' : 'neutral';
    } else if (healthScore >= 50) {
        healthInsight = `Portfolio health score ${healthScore}/100 hai. Moderate diversification, improvement ki scope hai.`;
        healthSentiment = 'neutral';
    } else {
        healthInsight = `Portfolio health score ${healthScore}/100 hai. Diversification improve karna chahiye.`;
        healthSentiment = 'negative';
    }
    
    insights.push({
        company: "Portfolio Health",
        summary: healthInsight,
        sector: "Portfolio",
        sentiment: healthSentiment,
        date: "Current"
    });
    
    return insights;
}

// Generate reasons based on score
function generateReasonsFromScore(score, stocks) {
    const reasons = [];
    
    if (score >= 90) {
        reasons.push("Portfolio excellent diversified hai across multiple sectors");
        reasons.push("Risk management perfect hai, concentration limits within range");
        reasons.push("All major sectors me balanced exposure hai");
    } else if (score >= 70) {
        reasons.push("Portfolio well diversified hai");
        reasons.push("Risk manageable hai with current allocation");
        reasons.push("Major sectors me exposure balanced hai");
    } else if (score >= 50) {
        reasons.push("Portfolio moderately diversified hai");
        reasons.push("Some concentration risks exist");
        reasons.push("Diversification improve kar sakte hain");
    } else {
        reasons.push("Portfolio me high concentration hai");
        reasons.push("Risk management improve karna chahiye");
        reasons.push("More diversification required");
    }
    
    return reasons;
}

// Handle analysis completion
function handleAnalysisComplete(data) {
    console.log('✅ Analysis complete!', data);
    hideLoading();
    updateDashboard(data);
    showDashboard();
    
    // Scroll to dashboard
    setTimeout(() => {
        dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    
    // Show success notification
    showSuccessNotification();
}

// Update dashboard with data
function updateDashboard(data) {
    console.log('🎨 Updating dashboard with:', data);
    
    // Update health score
    const healthScoreValue = data.healthScore || 0;
    const healthLabelValue = data.healthLabel || "Unknown";
    
    healthScore.textContent = healthScoreValue;
    healthLabel.textContent = healthLabelValue;
    
    // Set score label class
    healthLabel.className = 'score-label';
    if (healthScoreValue >= 80) {
        healthLabel.classList.add('healthy');
    } else if (healthScoreValue >= 60) {
        healthLabel.classList.add('moderate');
    } else {
        healthLabel.classList.add('risky');
    }
    
    // Update score circle with gradient
    const scoreColor = getScoreColor(healthScoreValue);
    scoreCircle.style.background = `conic-gradient(${scoreColor} ${healthScoreValue * 3.6}deg, var(--gray-light) 0deg)`;
    
    // Update score description
    scoreDescription.textContent = getScoreDescription(healthScoreValue);
    
    // Update portfolio summary stats
    updatePortfolioSummary(data.stocks);
    
    // Update risk reasons
    updateRiskReasons(data.reasons, healthScoreValue, data.stocks);
    
    // Update stock holdings table
    updateStockHoldingsTable(data.stocks);
    
    // Update insights
    updateInsightsGrid(data.insights);
    
    // Reset button states
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze Portfolio';
    isUploading = false;
}

// Update portfolio summary statistics
function updatePortfolioSummary(stocks) {
    if (!stocks || stocks.length === 0) return;
    
    const totalStocks = stocks.length;
    
    // Calculate unique sectors
    const sectors = new Set();
    stocks.forEach(stock => {
        if (stock.sector) sectors.add(stock.sector);
    });
    const totalSectors = sectors.size;
    
    // Calculate average holding percentage
    let totalPercent = 0;
    stocks.forEach(stock => {
        const percent = parseFloat(stock.portfolio_percent) || 0;
        totalPercent += percent;
    });
    const avgHolding = (totalPercent / totalStocks).toFixed(1);
    
    // Update DOM elements
    document.getElementById('totalStocks').textContent = totalStocks;
    document.getElementById('totalSectors').textContent = totalSectors;
    document.getElementById('avgHolding').textContent = `${avgHolding}%`;
    
    // Update score breakdown (dynamically calculate based on actual data)
    updateScoreBreakdown(stocks);
}

// Update score breakdown
function updateScoreBreakdown(stocks) {
    if (!stocks || stocks.length === 0) return;
    
    // Calculate diversification score (based on number of sectors and stocks)
    const sectors = new Set();
    stocks.forEach(stock => {
        if (stock.sector) sectors.add(stock.sector);
    });
    
    let diversificationScore = 0;
    if (stocks.length >= 8 && sectors.size >= 5) {
        diversificationScore = 95;
    } else if (stocks.length >= 5 && sectors.size >= 3) {
        diversificationScore = 75;
    } else {
        diversificationScore = 50;
    }
    
    // Calculate risk management score (based on concentration)
    let riskScore = 0;
    let maxConcentration = 0;
    stocks.forEach(stock => {
        const percent = parseFloat(stock.portfolio_percent) || 0;
        if (percent > maxConcentration) maxConcentration = percent;
    });
    
    if (maxConcentration <= 15) riskScore = 90;
    else if (maxConcentration <= 25) riskScore = 70;
    else riskScore = 50;
    
    // Calculate sector balance score
    let sectorBalanceScore = 0;
    const sectorPercentages = {};
    stocks.forEach(stock => {
        const sector = stock.sector || 'Unknown';
        const percent = parseFloat(stock.portfolio_percent) || 0;
        sectorPercentages[sector] = (sectorPercentages[sector] || 0) + percent;
    });
    
    let maxSectorPercent = 0;
    Object.values(sectorPercentages).forEach(percent => {
        if (percent > maxSectorPercent) maxSectorPercent = percent;
    });
    
    if (maxSectorPercent <= 30) sectorBalanceScore = 85;
    else if (maxSectorPercent <= 40) sectorBalanceScore = 65;
    else sectorBalanceScore = 45;
    
    // Update DOM
    document.querySelectorAll('.breakdown-fill')[0].style.width = `${diversificationScore}%`;
    document.querySelectorAll('.breakdown-value')[0].textContent = `${diversificationScore}%`;
    
    document.querySelectorAll('.breakdown-fill')[1].style.width = `${riskScore}%`;
    document.querySelectorAll('.breakdown-value')[1].textContent = `${riskScore}%`;
    
    document.querySelectorAll('.breakdown-fill')[2].style.width = `${sectorBalanceScore}%`;
    document.querySelectorAll('.breakdown-value')[2].textContent = `${sectorBalanceScore}%`;
}

// Update risk reasons
function updateRiskReasons(reasons, score, stocks) {
    reasonsList.innerHTML = '';
    
    const reasonsToShow = reasons && reasons.length > 0 
        ? reasons 
        : generateReasonsFromScore(score, stocks);
    
    reasonsToShow.forEach((reason, index) => {
        const reasonItem = document.createElement('div');
        reasonItem.className = 'reason-item';
        reasonItem.innerHTML = `
            <div class="reason-number">${index + 1}</div>
            <div class="reason-text">${reason}</div>
        `;
        reasonsList.appendChild(reasonItem);
    });
}

// Update stock holdings table
function updateStockHoldingsTable(stocks) {
    const holdingsTable = document.getElementById('holdingsTable');
    if (!holdingsTable) return;
    
    holdingsTable.innerHTML = '';
    
    if (!stocks || stocks.length === 0) {
        holdingsTable.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: var(--gray);">
                    <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    No stock data available
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort stocks by percentage (highest first)
    const sortedStocks = [...stocks].sort((a, b) => {
        const percentA = parseFloat(a.portfolio_percent) || 0;
        const percentB = parseFloat(b.portfolio_percent) || 0;
        return percentB - percentA;
    });
    
    sortedStocks.forEach((stock, index) => {
        const name = stock.name || 'Unknown';
        const sector = stock.sector || 'Unknown';
        const percent = stock.portfolio_percent || '0%';
        const percentValue = parseFloat(percent) || 0;
        
        // Determine status based on percentage
        let status = 'healthy';
        let statusText = 'Balanced';
        
        if (percentValue > 20) {
            status = 'risky';
            statusText = 'High';
        } else if (percentValue > 10) {
            status = 'moderate';
            statusText = 'Moderate';
        }
        
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.1}s`;
        row.innerHTML = `
            <td class="stock-name">
                <strong>${name}</strong>
            </td>
            <td>
                <span class="sector">${sector}</span>
            </td>
            <td class="percentage">
                ${percent}
            </td>
            <td>
                <span class="status ${status}">${statusText}</span>
            </td>
        `;
        holdingsTable.appendChild(row);
    });
}

// Update insights grid
function updateInsightsGrid(insights) {
    insightsGrid.innerHTML = '';
    
    if (!insights || insights.length === 0) {
        insightsGrid.innerHTML = `
            <div class="no-insights" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gray);">
                <i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                No insights available
            </div>
        `;
        return;
    }
    
    insights.forEach((insight, index) => {
        const insightCard = document.createElement('div');
        insightCard.className = 'insight-card';
        insightCard.style.animationDelay = `${index * 0.1}s`;
        
        const companyName = insight.company || 'Unknown';
        const summary = insight.summary || 'No insight available';
        const sector = insight.sector || 'General';
        const sentiment = (insight.sentiment || 'neutral').toLowerCase();
        const date = insight.date || 'Recently';
        
        insightCard.innerHTML = `
            <div class="insight-header">
                <h4 class="company-name">${companyName}</h4>
                <span class="sector-tag">${sector}</span>
            </div>
            <div class="insight-content">
                <p>${summary}</p>
            </div>
            <div class="insight-footer">
                <div class="sentiment ${sentiment}">
                    <i class="fas fa-${getSentimentIcon(sentiment)}"></i>
                    ${capitalizeFirstLetter(sentiment)} Outlook
                </div>
                <div class="news-date">${date}</div>
            </div>
        `;
        insightsGrid.appendChild(insightCard);
    });
}

// Handle upload errors
function handleUploadError(error) {
    hideLoading();
    uploadProgress.classList.remove('active');
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze Portfolio';
    isUploading = false;
    
    if (uploadProgressInterval) {
        clearInterval(uploadProgressInterval);
        uploadProgressInterval = null;
    }
    
    let errorMsg = error.message || 'Failed to upload PDF. Please try again.';
    
    // User-friendly error messages
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMsg = 'Cannot connect to server. Please check if backend is running at ' + API_BASE_URL;
    } else if (error.message.includes('500')) {
        errorMsg = 'Server error. Please try again later.';
    } else if (error.message.includes('404')) {
        errorMsg = 'API endpoint not found. Please check backend configuration.';
    }
    
    showError(errorMsg);
}

// Simulate upload progress
function simulateUploadProgress() {
    if (uploadProgressInterval) {
        clearInterval(uploadProgressInterval);
    }
    
    let progress = 0;
    uploadProgressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 95) {
            clearInterval(uploadProgressInterval);
            updateUploadProgress(95, 'Processing...');
        } else {
            updateUploadProgress(progress, 'Uploading...');
        }
    }, 200);
}

// Update upload progress
function updateUploadProgress(percent, message) {
    progressBar.style.width = `${percent}%`;
    progressText.textContent = message;
}

// Update analysis progress
function updateAnalysisProgress(percent) {
    analysisProgress.style.width = `${percent}%`;
}

// Helper functions
function getScoreColor(score) {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
}

function getScoreDescription(score) {
    if (score >= 90) return 'Excellent portfolio diversification and risk management';
    if (score >= 80) return 'Very good diversification with balanced exposure';
    if (score >= 60) return 'Good diversification, some areas for improvement';
    if (score >= 40) return 'Moderate diversification needs attention';
    return 'Needs better diversification and risk management';
}

function getSentimentIcon(sentiment) {
    switch(sentiment) {
        case 'positive': return 'arrow-up';
        case 'negative': return 'arrow-down';
        default: return 'minus';
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show loading state
function showLoading(title = 'Analyzing Portfolio', message = 'This may take a few moments...') {
    loadingTitle.textContent = title;
    loadingMessage.textContent = message;
    loadingSection.classList.add('active');
    updateAnalysisProgress(10);
}

// Hide loading state
function hideLoading() {
    loadingSection.classList.remove('active');
    updateAnalysisProgress(0);
}

// Show dashboard
function showDashboard() {
    dashboard.classList.add('active');
}

// Hide dashboard
function hideDashboard() {
    dashboard.classList.remove('active');
}

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('active');
    
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error message
function hideError() {
    errorMessage.classList.remove('active');
}

// Reset to upload state
function resetToUpload() {
    console.log('🔄 Resetting to upload state');
    
    hideDashboard();
    filePreview.classList.remove('active');
    fileInput.value = '';
    currentFile = null;
    isUploading = false;
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze Portfolio';
    
    // Clear intervals
    if (uploadProgressInterval) {
        clearInterval(uploadProgressInterval);
        uploadProgressInterval = null;
    }
    
    hideError();
    
    // Scroll to upload section
    setTimeout(() => {
        const uploadSection = document.getElementById('demo');
        uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// Scroll to upload section
function scrollToUploadSection() {
    const uploadSection = document.getElementById('demo');
    uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Cleanup function
function cleanup() {
    if (uploadProgressInterval) {
        clearInterval(uploadProgressInterval);
    }
}

// Add cleanup on page unload
window.addEventListener('beforeunload', cleanup);
window.addEventListener('pagehide', cleanup);

// Button animation
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', function() {
        if (!this.disabled) {
            this.style.transform = "scale(0.95)";
            setTimeout(() => {
                this.style.transform = "";
            }, 200);
        }
    });
});

// Success notification
const successNotification = document.createElement('div');
successNotification.id = 'successNotification';
successNotification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: var(--success);
    color: white;
    padding: 16px 24px;
    border-radius: var(--border-radius);
    box-shadow: var(--hover-shadow);
    display: none;
    align-items: center;
    gap: 12px;
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
`;
successNotification.innerHTML = `
    <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
    <div>
        <strong>Analysis Complete!</strong>
        <p style="margin-top: 4px; font-size: 0.9rem; opacity: 0.9;">Portfolio insights ready</p>
    </div>
`;
document.body.appendChild(successNotification);

// Show success notification
function showSuccessNotification() {
    successNotification.style.display = 'flex';
    setTimeout(() => {
        successNotification.style.display = 'none';
    }, 3000);
}

console.log('🚀 Bharat FIL Frontend Ready!');