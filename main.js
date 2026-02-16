document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const numberDisplay = document.querySelector('.number-display');

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
