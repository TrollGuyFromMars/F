document.addEventListener('DOMContentLoaded', () => {
    const combinationForm = document.getElementById('combinationForm');
    const combinationInput = document.getElementById('combinationInput');
    const combinationList = document.getElementById('combinationList');
    const jsonFileInput = document.getElementById('jsonFileInput');
    const clearStorageButton = document.getElementById('clearStorage');
    const guide = document.getElementById('guide');
    const guideSteps = document.getElementById('guideSteps');
    const closeGuideButton = document.getElementById('closeGuide');
    const targetElementSpan = document.getElementById('targetElement');
    const loading = document.getElementById('loading');
    const searchInput = document.getElementById('searchInput');

    const combinationsKey = 'combinations';
    const elementsKey = 'elements';
    const batchSize = 20;
    let loadedCount = 0;

    // Load combinations from localStorage
    function loadCombinations(initialLoad = false, filter = '') {
        const storedCombinations = JSON.parse(localStorage.getItem(combinationsKey)) || [];
        if (initialLoad) {
            loadedCount = 0;
            combinationList.innerHTML = '';
        }
        const nextBatch = storedCombinations.filter(comb => comb.includes(filter)).slice(loadedCount, loadedCount + batchSize);
        nextBatch.forEach(combination => {
            const li = document.createElement('li');
            const [ingredients, result] = combination.split(' = ');
            const ingredientsLinks = ingredients.split(' + ').map(ingredient => `<a href="#" data-element="${ingredient.trim()}">${ingredient.trim()}</a>`).join(' + ');
            const resultLink = `<a href="#" data-element="${result.trim()}">${result.trim()}</a>`;
            li.innerHTML = `${ingredientsLinks} = ${resultLink}`;
            combinationList.appendChild(li);
        });
        loadedCount += batchSize;
    }

    // Save a new combination to localStorage
    function saveCombination(combination) {
        const storedCombinations = JSON.parse(localStorage.getItem(combinationsKey)) || [];
        storedCombinations.push(combination);
        localStorage.setItem(combinationsKey, JSON.stringify(storedCombinations));
    }

    // Handle form submission
    combinationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const combination = combinationInput.value.trim();
        if (combination) {
            saveCombination(combination);
            loadCombinations(true);
            combinationInput.value = '';
        }
    });

    // Handle JSON file upload
    jsonFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target.result);
                    if (json.elements && json.recipes) {
                        localStorage.setItem(elementsKey, JSON.stringify(json.elements));
                        localStorage.setItem(combinationsKey, JSON.stringify([])); // Clear previous combinations
                        Object.keys(json.recipes).forEach(result => {
                            json.recipes[result].forEach(recipe => {
                                const combination = recipe.map(element => element.text.toLowerCase()).join(' + ') + ' = ' + result.toLowerCase();
                                saveCombination(combination);
                            });
                        });
                        loadCombinations(true);
                    } else {
                        alert('Invalid JSON format');
                    }
                } catch (err) {
                    alert('Error parsing JSON');
                }
            };
            reader.readAsText(file);
        }
    });

    // Handle clear storage
    clearStorageButton.addEventListener('click', () => {
        localStorage.removeItem(combinationsKey);
        localStorage.removeItem(elementsKey);
        loadCombinations(true);
    });

    // Show guide
    combinationList.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const targetElement = e.target.getAttribute('data-element');
            targetElementSpan.textContent = targetElement;
            guideSteps.innerHTML = '';
            const storedCombinations = JSON.parse(localStorage.getItem(combinationsKey)) || [];
            const steps = findSteps(targetElement, storedCombinations);
            steps.forEach(step => { // Display in correct order
                const li = document.createElement('li');
                li.textContent = step;
                guideSteps.appendChild(li);
            });
            guide.classList.remove('hidden');
        }
    });

    // Close guide
    closeGuideButton.addEventListener('click', () => {
        guide.classList.add('hidden');
    });

    // Find steps to create target element using BFS
    function findSteps(target, combinations) {
        const steps = [];
        const combinationMap = new Map(combinations.map(comb => {
            const [ingredients, result] = comb.split(' = ');
            return [result.trim(), ingredients.trim()];
        }));

        const queue = [[target, []]];
        const visited = new Set();

        while (queue.length > 0) {
            const [currentElement, path] = queue.shift();
            if (visited.has(currentElement)) continue;
            visited.add(currentElement);

            const combination = combinationMap.get(currentElement);
            if (combination) {
                const newPath = [...path, combination + ' = ' + currentElement];
                const ingredients = combination.split(' + ');
                ingredients.forEach(ingredient => {
                    queue.push([ingredient.trim(), newPath]);
                });
            } else {
                steps.push(...path);
                break;
            }
        }

        steps.reverse();
        return steps;
    }

    // Initial load
    loadCombinations(true);

    // Set up intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadCombinations();
        }
    }, {
        root: document.querySelector('.container'),
        rootMargin: '0px',
        threshold: 1.0
    });

    // Observe the loading div
    observer.observe(loading);

    // Handle search input
    searchInput.addEventListener('input', (e) => {
        loadCombinations(true, e.target.value.trim().toLowerCase());
    });
});
