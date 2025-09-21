let candidates = [];
let voters = [];
let currentVoterId = '';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1234';

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateStats();
});

function saveData() {
    const votingData = {
        candidates: candidates,
        voters: voters
    };
    try {
        sessionStorage.setItem('votingData', JSON.stringify(votingData));
    } catch (e) {
        console.log('Data saved to memory only (storage not available)');
    }
}

function loadData() {
    try {
        const saved = sessionStorage.getItem('votingData');
        if (saved) {
            const data = JSON.parse(saved);
            candidates = data.candidates || [];
            voters = data.voters || [];
        }
    } catch (e) {
        console.log('No saved data found, starting fresh');
        candidates = [];
        voters = [];
    }
}

function showMainMenu() {
    hideAllSections();
    document.getElementById('mainMenu').style.display = 'block';
    updateStats();
}

function showAdminLogin() {
    hideAllSections();
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminUsername').focus();
}

function showRegisterCandidate() {
    hideAllSections();
    document.getElementById('registerCandidate').style.display = 'block';
    document.getElementById('candidateName').focus();
}

function showRegisterVoter() {
    hideAllSections();
    document.getElementById('registerVoter').style.display = 'block';
    document.getElementById('voterIdReg').focus();
}

function showCastVote() {
    hideAllSections();
    document.getElementById('castVote').style.display = 'block';
    document.getElementById('voterIdVote').focus();
}

function hideAllSections() {
    const sections = ['mainMenu', 'adminLogin', 'registerCandidate', 'registerVoter', 
                     'castVote', 'votingInterface', 'resultsDisplay'];
    sections.forEach(section => {
        document.getElementById(section).style.display = 'none';
    });
}

function showMessage(text, type = 'info') {
    const messageContainer = document.getElementById('messageDisplay');
    const messageText = document.getElementById('messageText');
    
    messageText.textContent = text;
    messageText.className = `message ${type}`;
    
    messageContainer.classList.add('show');
    
    setTimeout(() => {
        messageContainer.classList.remove('show');
    }, 3000);
}

function adminLogin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    if (!username || !password) {
        showMessage('Please enter both username and password', 'error');
        return;
    }
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        showMessage('Login successful!', 'success');
        setTimeout(() => {
            showResults();
        }, 1000);
    } else {
        showMessage('Wrong username or password', 'error');
    }
    
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
}

function showResults() {
    hideAllSections();
    document.getElementById('resultsDisplay').style.display = 'block';
    
    const resultsList = document.getElementById('resultsList');
    
    if (candidates.length === 0) {
        resultsList.innerHTML = '<div class="result-item"><div class="result-name">No candidates registered yet</div></div>';
        return;
    }
    
    const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
    const maxVotes = sortedCandidates[0]?.votes || 0;
    
    resultsList.innerHTML = sortedCandidates.map((candidate, index) => `
        <div class="result-item">
            <div class="result-name">
                ${candidate.name}
                ${candidate.votes === maxVotes && maxVotes > 0 ? '<span class="winner-badge">🏆 Winner</span>' : ''}
            </div>
            <div class="result-votes">${candidate.votes} votes</div>
        </div>
    `).join('');
}

function registerCandidate() {
    const name = document.getElementById('candidateName').value.trim();
    
    if (!name) {
        showMessage('Please enter candidate name', 'error');
        return;
    }
    
    if (candidates.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        showMessage('Candidate already registered', 'error');
        return;
    }
    
    const candidate = {
        name: name,
        votes: 0
    };
    
    candidates.push(candidate);
    saveData();
    updateStats();
    
    showMessage('Candidate registered successfully!', 'success');
    document.getElementById('candidateName').value = '';
    
    setTimeout(() => {
        showMainMenu();
    }, 1500);
}

function registerVoter() {
    const id = document.getElementById('voterIdReg').value.trim();
    
    if (!id) {
        showMessage('Please enter voter ID', 'error');
        return;
    }
    
    if (voters.some(v => v.id === id)) {
        showMessage('Voter already registered', 'error');
        return;
    }
    
    const voter = {
        id: id,
        hasVoted: false
    };
    
    voters.push(voter);
    saveData();
    updateStats();
    
    showMessage('Voter registered successfully!', 'success');
    document.getElementById('voterIdReg').value = '';
    
    setTimeout(() => {
        showMainMenu();
    }, 1500);
}

function verifyVoter() {
    const id = document.getElementById('voterIdVote').value.trim();
    
    if (!id) {
        showMessage('Please enter your voter ID', 'error');
        return;
    }
    
    const voter = voters.find(v => v.id === id);
    
    if (!voter) {
        showMessage('You are not registered to vote', 'error');
        return;
    }
    
    if (voter.hasVoted) {
        showMessage('You have already cast your vote', 'error');
        return;
    }
    
    if (candidates.length === 0) {
        showMessage('No candidates available for voting', 'error');
        return;
    }
    
    currentVoterId = id;
    showVotingInterface();
}

function showVotingInterface() {
    hideAllSections();
    document.getElementById('votingInterface').style.display = 'block';
    
    const candidatesList = document.getElementById('candidatesList');
    candidatesList.innerHTML = candidates.map((candidate, index) => `
        <div class="candidate-item">
            <div class="candidate-name">${candidate.name}</div>
            <button class="vote-candidate-btn" onclick="castVote(${index})">
                Vote for ${candidate.name}
            </button>
        </div>
    `).join('');
}

function castVote(candidateIndex) {
    if (candidateIndex < 0 || candidateIndex >= candidates.length) {
        showMessage('Invalid candidate selection', 'error');
        return;
    }
    
    const voter = voters.find(v => v.id === currentVoterId);
    if (!voter) {
        showMessage('Voter verification failed', 'error');
        return;
    }
    
    if (voter.hasVoted) {
        showMessage('You have already voted', 'error');
        return;
    }
    
    candidates[candidateIndex].votes++;
    voter.hasVoted = true;
    
    saveData();
    updateStats();
    
    showMessage(`Vote cast successfully for ${candidates[candidateIndex].name}!`, 'success');
    
    currentVoterId = '';
    setTimeout(() => {
        showMainMenu();
    }, 2000);
}

function updateStats() {
    const totalCandidates = candidates.length;
    const totalVoters = voters.length;
    const totalVotes = voters.filter(v => v.hasVoted).length;
    
    document.getElementById('totalCandidates').textContent = totalCandidates;
    document.getElementById('totalVoters').textContent = totalVoters;
    document.getElementById('totalVotes').textContent = totalVotes;
}

document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        const parentSection = activeElement.closest('[id]');
        
        if (!parentSection) return;
        
        switch (parentSection.id) {
            case 'adminLogin':
                if (activeElement.id === 'adminUsername') {
                    document.getElementById('adminPassword').focus();
                } else {
                    adminLogin();
                }
                break;
            case 'registerCandidate':
                registerCandidate();
                break;
            case 'registerVoter':
                registerVoter();
                break;
            case 'castVote':
                verifyVoter();
                break;
        }
    }
});

function initDemoData() {
    if (candidates.length === 0 && voters.length === 0) {
        candidates = [
            { name: 'John Smith', votes: 0 },
            { name: 'Sarah Johnson', votes: 0 },
            { name: 'Mike Davis', votes: 0 }
        ];
        
        voters = [
            { id: 'voter001', hasVoted: false },
            { id: 'voter002', hasVoted: false },
            { id: 'voter003', hasVoted: false }
        ];
        
        saveData();
        updateStats();
    }
}
