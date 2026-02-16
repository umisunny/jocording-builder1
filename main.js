document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('cityInput');
    const checkWeatherBtn = document.getElementById('checkWeatherBtn');
    const temperatureSpan = document.getElementById('temperature');
    const weatherConditionSpan = document.getElementById('weatherCondition');
    const walkRecommendationSpan = document.getElementById('walkRecommendation');
    const reasonParagraph = document.getElementById('reason');
    const recommendationDiv = document.querySelector('.recommendation');

    // Simple mapping for Korean cities to their approximate lat/lon
    const cityCoordinates = {
        "Seoul": { latitude: 37.5665, longitude: 126.9780 },
        "Busan": { latitude: 35.1796, longitude: 129.0756 },
        "Incheon": { latitude: 37.4563, longitude: 126.7052 },
        "Daegu": { latitude: 35.8714, longitude: 128.6014 },
        "Gwangju": { latitude: 35.1595, longitude: 126.8526 },
        "Daejeon": { latitude: 36.3504, longitude: 127.3845 },
        "Ulsan": { latitude: 35.5384, longitude: 129.3114 },
        // Add more cities as needed
    };

    async function fetchWeatherData(city) {
        const coords = cityCoordinates[city];
        if (!coords) {
            alert("지원하지 않는 도시입니다. Seoul, Busan 등으로 다시 시도해주세요.");
            return null;
        }

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true&temperature_unit=celsius&timezone=Asia%2FSeoul`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.current_weather;
        } catch (error) {
            console.error("날씨 데이터를 가져오는 중 오류 발생:", error);
            alert("날씨 데이터를 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
            return null;
        }
    }

    function getWalkRecommendation(temperature, weatherCode) {
        let recommendation = "확인 불가";
        let reason = "날씨 정보를 불러오는 데 문제가 발생했습니다.";
        let className = ""; // For styling

        // Basic weather condition mapping (Open-Meteo WMO codes)
        // This is a simplified mapping, you might want to expand it.
        const weatherDescriptions = {
            0: "맑음", 1: "대체로 맑음", 2: "부분적으로 흐림", 3: "흐림",
            45: "안개", 48: "서리 안개",
            51: "이슬비", 53: "보통 비", 55: "강한 비",
            61: "약한 비", 63: "보통 비", 65: "강한 비",
            66: "약한 비", 67: "강한 비 (비 또는 눈)",
            71: "약한 눈", 73: "보통 눈", 75: "강한 눈",
            77: "눈송이",
            80: "약한 소나기", 81: "보통 소나기", 82: "강한 소나기",
            85: "약한 눈 소나기", 86: "강한 눈 소나기",
            95: "약한 천둥번개", 96: "천둥번개", 99: "강한 천둥번개"
        };
        const condition = weatherDescriptions[weatherCode] || "알 수 없음";
        weatherConditionSpan.textContent = condition;

        if (temperature === null) {
            recommendation = "정보 없음";
            reason = "날씨 정보를 불러올 수 없습니다.";
            className = "bad";
        } else if (temperature <= -1) {
            recommendation = "산책 어려움";
            reason = "영하 1도 이하의 날씨에는 소형견 산책이 위험할 수 있습니다.";
            className = "bad";
        } else if (temperature > -1 && temperature < 5) {
            recommendation = "주의 필요";
            reason = "날씨가 쌀쌀합니다. 짧게 산책하고 옷을 입혀주세요.";
            className = "caution";
        } else if (temperature >= 5 && temperature < 25) {
            recommendation = "산책하기 좋음";
            reason = "쾌적한 날씨입니다! 즐거운 산책 되세요.";
            className = "good";
        } else if (temperature >= 25 && temperature < 30) {
            recommendation = "주의 필요";
            reason = "날씨가 덥습니다. 해가 뜨겁지 않은 시간대에 짧게 산책하세요.";
            className = "caution";
        } else if (temperature >= 30) {
            recommendation = "산책 어려움";
            reason = "매우 더운 날씨입니다. 일사병에 주의하고 산책을 자제해주세요.";
            className = "bad";
        }

        // Add weather condition specific rules
        if (weatherCode >= 51 && weatherCode <= 65) { // Rain
            recommendation = "산책 어려움";
            reason = "비가 오고 있습니다. 실내 활동을 권장합니다.";
            className = "bad";
        } else if (weatherCode >= 71 && weatherCode <= 77) { // Snow
            recommendation = "산책 어려움";
            reason = "눈이 오고 있습니다. 길이 미끄럽고 발이 시릴 수 있습니다.";
            className = "bad";
        } else if (weatherCode >= 80 && weatherCode <= 86) { // Showers
            recommendation = "주의 필요";
            reason = "소나기가 예상됩니다. 짧게 산책하고 비에 대비하세요.";
            className = "caution";
        } else if (weatherCode >= 95 && weatherCode <= 99) { // Thunderstorm
            recommendation = "산책 어려움";
            reason = "천둥번개가 칩니다. 매우 위험하니 산책을 삼가주세요.";
            className = "bad";
        }


        walkRecommendationSpan.textContent = recommendation;
        reasonParagraph.textContent = reason;
        recommendationDiv.className = `recommendation ${className}`;
    }

    async function updateWeatherAndRecommendation() {
        const city = cityInput.value.trim();
        if (!city) {
            alert("도시 이름을 입력해주세요.");
            return;
        }

        temperatureSpan.textContent = '--';
        weatherConditionSpan.textContent = '--';
        walkRecommendationSpan.textContent = '확인 중...';
        reasonParagraph.textContent = '';
        recommendationDiv.className = 'recommendation'; // Reset class

        const weather = await fetchWeatherData(city);
        if (weather) {
            temperatureSpan.textContent = weather.temperature;
            getWalkRecommendation(weather.temperature, weather.weathercode);
        } else {
            walkRecommendationSpan.textContent = '확인 불가';
            reasonParagraph.textContent = '날씨 정보를 가져올 수 없습니다.';
            recommendationDiv.className = 'recommendation bad';
        }
    }

    checkWeatherBtn.addEventListener('click', updateWeatherAndRecommendation);

    // Initial load for Seoul
    updateWeatherAndRecommendation();
});
