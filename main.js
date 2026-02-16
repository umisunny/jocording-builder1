document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('cityInput');
    const checkWeatherBtn = document.getElementById('checkWeatherBtn');
    const dogSizeSelect = document.getElementById('dogSize'); // New element
    const temperatureSpan = document.getElementById('temperature');
    const weatherConditionSpan = document.getElementById('weatherCondition');
    const walkRecommendationSpan = document.getElementById('walkRecommendation');
    const reasonParagraph = document.getElementById('reason');
    const recommendationDiv = document.querySelector('.recommendation');

    const cityCoordinates = {
        "Seoul": { latitude: 37.5665, longitude: 126.9780 },
        "Busan": { latitude: 35.1796, longitude: 129.0756 },
        "Incheon": { latitude: 37.4563, longitude: 126.7052 },
        "Daegu": { latitude: 35.8714, longitude: 128.6014 },
        "Gwangju": { latitude: 35.1595, longitude: 126.8526 },
        "Daejeon": { latitude: 36.3504, longitude: 127.3845 },
        "Ulsan": { latitude: 35.5384, longitude: 129.3114 },
        "Suwon": { latitude: 37.2636, longitude: 127.0286 },
        "Goyang": { latitude: 37.6581, longitude: 126.8317 },
        "Yongin": { latitude: 37.2289, longitude: 127.1852 },
        "Changwon": { latitude: 35.2280, longitude: 128.6816 },
        "Cheongju": { latitude: 36.6424, longitude: 127.4891 },
        "Cheonan": { latitude: 36.8140, longitude: 127.1190 },
        "Jeonju": { latitude: 35.8214, longitude: 127.1080 },
        "Pohang": { latitude: 36.0315, longitude: 129.3512 },
        "Gumi": { latitude: 36.1287, longitude: 128.3323 }
    };

    async function fetchWeatherData(city) {
        const coords = cityCoordinates[city];
        if (!coords) {
            alert("지원하지 않는 도시입니다. 목록에 있는 도시를 선택하거나 입력해주세요.");
            return null;
        }

        // Requesting humidity along with temperature and weather code
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh&precipitation_unit=mm&hourly=relativehumidity_2m&timezone=Asia%2FSeoul`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Open-Meteo returns hourly data, so we need to find the current hour's humidity
            const currentHourIndex = data.hourly.time.findIndex(time =>
                new Date(time).getHours() === new Date(data.current_weather.time).getHours()
            );
            const humidity = data.hourly.relativehumidity_2m[currentHourIndex];

            return {
                temperature: data.current_weather.temperature,
                weathercode: data.current_weather.weathercode,
                humidity: humidity
            };

        } catch (error) {
            console.error("날씨 데이터를 가져오는 중 오류 발생:", error);
            alert("날씨 데이터를 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
            return null;
        }
    }

    function getWalkRecommendation(temperature, weatherCode, humidity, dogSize) {
        let recommendation = "확인 불가";
        let reason = "날씨 정보를 불러오는 데 문제가 발생했습니다.";
        let className = "";

        // WMO Weather codes mapping
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

        if (temperature === null || humidity === null) {
            recommendation = "정보 없음";
            reason = "날씨 정보를 불러올 수 없습니다.";
            className = "bad";
        } else {
            // Apply rules based on dog size
            if (dogSize === 'small') {
                if (temperature >= 10 && temperature <= 24) {
                    recommendation = "산책 적정";
                    reason = "쾌적한 날씨입니다! 즐거운 산책 되세요.";
                    className = "good";
                } else if ((temperature >= 5 && temperature <= 9) || (temperature >= 25 && temperature <= 28)) {
                    recommendation = "주의 필요";
                    reason = ((temperature >= 5 && temperature <= 9) ? "날씨가 쌀쌀합니다. 짧게 산책하고 옷을 입혀주세요." : "날씨가 덥습니다. 해가 뜨겁지 않은 시간대에 짧게 산책하세요.");
                    className = "caution";
                } else if (temperature < 5) {
                    recommendation = "산책 비추천";
                    reason = "영하 1도 이하 또는 5℃ 이하: 저체온 위험이 있습니다 (특히 털 얇은 견종).";
                    className = "bad";
                } else if (temperature > 28) {
                    recommendation = "산책 비추천";
                    reason = "28℃ 이상: 체구가 작아 열 배출이 느려 열사병 위험이 높습니다.";
                    className = "bad";
                }
            } else if (dogSize === 'medium') {
                if (temperature >= 5 && temperature <= 25) {
                    recommendation = "산책 적정";
                    reason = "쾌적한 날씨입니다! 즐거운 산책 되세요.";
                    className = "good";
                } else if ((temperature >= 0 && temperature <= 4) || (temperature >= 26 && temperature <= 29)) {
                    recommendation = "주의 필요";
                    reason = ((temperature >= 0 && temperature <= 4) ? "날씨가 쌀쌀합니다. 짧게 산책하고 옷을 입혀주세요." : "날씨가 덥습니다. 해가 뜨겁지 않은 시간대에 짧게 산책하세요.");
                    className = "caution";
                } else if (temperature < 0) {
                    recommendation = "산책 비추천";
                    reason = "0℃ 이하: 추운 날씨로 산책이 적합하지 않습니다.";
                    className = "bad";
                } else if (temperature > 29) {
                    recommendation = "산책 비추천";
                    reason = "29℃ 이상: 더운 날씨로 열사병 위험이 높습니다.";
                    className = "bad";
                }
            } else if (dogSize === 'large') {
                if (temperature >= 0 && temperature <= 23) {
                    recommendation = "산책 적정";
                    reason = "쾌적한 날씨입니다! 즐거운 산책 되세요.";
                    className = "good";
                } else if ((temperature >= -5 && temperature <= -1) || (temperature >= 24 && temperature <= 27)) {
                    recommendation = "주의 필요";
                    reason = ((temperature >= -5 && temperature <= -1) ? "날씨가 매우 춥습니다. 짧게 산책하고 옷을 입혀주세요." : "날씨가 덥습니다. 해가 뜨겁지 않은 시간대에 짧게 산책하세요.");
                    className = "caution";
                } else if (temperature < -5) {
                    recommendation = "산책 비추천";
                    reason = "-5℃ 이하: 매우 추운 날씨로 산책이 적합하지 않습니다.";
                    className = "bad";
                } else if (temperature > 27) {
                    recommendation = "산책 비추천";
                    reason = "28℃ 이상: 더운 날씨로 열사병 위험이 높습니다. 체구가 커서 열 배출이 느립니다.";
                    className = "bad";
                }
            }

            // General weather condition rules (override temperature if severe)
            if (weatherCode >= 51 && weatherCode <= 65) { // Rain
                recommendation = "산책 비추천";
                reason = "비가 오고 있습니다. 실내 활동을 권장합니다.";
                className = "bad";
            } else if (weatherCode >= 71 && weatherCode <= 77) { // Snow
                recommendation = "산책 비추천";
                reason = "눈이 오고 있습니다. 길이 미끄럽고 발이 시릴 수 있습니다.";
                className = "bad";
            } else if (weatherCode >= 80 && weatherCode <= 86) { // Showers
                recommendation = "주의 필요";
                reason = "소나기가 예상됩니다. 짧게 산책하고 비에 대비하세요.";
                className = "caution";
            } else if (weatherCode >= 95 && weatherCode <= 99) { // Thunderstorm
                recommendation = "산책 비추천";
                reason = "천둥번개가 칩니다. 매우 위험하니 산책을 삼가주세요.";
                className = "bad";
            }

            // Humidity considerations (if temperature is high)
            if (temperature >= 26 && humidity >= 80) { // Example: 26C + 80% humidity feels like 30C+
                recommendation = "산책 비추천";
                reason = "높은 습도와 기온으로 체감 온도가 매우 높습니다. 열사병 위험이 크니 산책을 삼가주세요.";
                className = "bad";
            }
        }

        walkRecommendationSpan.textContent = recommendation;
        reasonParagraph.textContent = reason;
        recommendationDiv.className = `recommendation ${className}`;
    }

    async function updateWeatherAndRecommendation() {
        const city = cityInput.value.trim();
        const dogSize = dogSizeSelect.value;

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
            getWalkRecommendation(weather.temperature, weather.weathercode, weather.humidity, dogSize);
        } else {
            walkRecommendationSpan.textContent = '확인 불가';
            reasonParagraph.textContent = '날씨 정보를 가져올 수 없습니다.';
            recommendationDiv.className = 'recommendation bad';
        }
    }

    checkWeatherBtn.addEventListener('click', updateWeatherAndRecommendation);
    dogSizeSelect.addEventListener('change', updateWeatherAndRecommendation); // Update on dog size change

    // Initial load for Seoul
    updateWeatherAndRecommendation();
});
