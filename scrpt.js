// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Function to display elements
function displayElements(elements) {
    const elementsSection = document.getElementById('elements');
    elementsSection.innerHTML = '';
    elements.forEach(element => {
        const elementDiv = document.createElement('div');
        elementDiv.classList.add('element');
        elementDiv.innerText = `${element.emoji} ${element.text}`;
        elementDiv.addEventListener('click', () => {
            displayGuide(element);
        });
        elementsSection.appendChild(elementDiv);
    });
}

// Function to display guide for selected element
function displayGuide(element) {
    const guideSection = document.getElementById('guide');
    guideSection.innerHTML = ''; // Clear previous guide
    const guideSteps = getGuideSteps(element);
    guideSteps.forEach(step => {
        const stepDiv = document.createElement('div');
        stepDiv.innerText = `${step.emoji} ${step.text}`;
        guideSection.appendChild(stepDiv);
    });
}

// Function to get guide steps for selected element
function getGuideSteps(element) {
    // Logic to retrieve guide steps from JSON data
    // You need to implement this based on your JSON structure
    // For now, let's assume guide steps are hardcoded
    return [
        { text: 'Step 1: Do this', emoji: '👍' },
        { text: 'Step 2: Do that', emoji: '✌️' },
        { text: 'Step 3: You got it!', emoji: '🎉' }
    ];
}

// Function to handle JSON file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const json = JSON.parse(e.target.result);
        // Process JSON data here (e.g., update elements, recipes)
        displayElements(json.elements);
    };
    reader.readAsText(file);
}

// Event listeners
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
document.getElementById('jsonFileInput').addEventListener('change', handleFileUpload);
