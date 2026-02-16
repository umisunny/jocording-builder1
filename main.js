document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const numberDisplay = document.querySelector('.number-display');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Theme toggle logic
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-mode');
    }

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light-mode');
        } else {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        }
    });

    // Lotto number generation logic
    function generateLottoNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 45) + 1);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function displayNumbers(numbers) {
        numberDisplay.innerHTML = ''; // Clear previous numbers
        numbers.forEach(num => {
            const circle = document.createElement('div');
            circle.classList.add('number-circle');
            circle.textContent = num;
            numberDisplay.appendChild(circle);
        });
    }

    function resetNumbers() {
        numberDisplay.innerHTML = ''; // Clear numbers
    }

    generateBtn.addEventListener('click', () => {
        const lottoNumbers = generateLottoNumbers();
        displayNumbers(lottoNumbers);
    });

    resetBtn.addEventListener('click', resetNumbers);

    // Initial state: maybe generate numbers on load or keep it empty
    // displayNumbers(generateLottoNumbers());
});
