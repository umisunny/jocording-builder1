document.addEventListener('DOMContentLoaded', () => {
    const recommendBtn = document.getElementById('recommendBtn');
    const menuDisplay = document.querySelector('.menu-display');

    const foodMenus = [
        "김치찌개", "된장찌개", "제육볶음", "비빔밥", "불고기",
        "순두부찌개", "삼겹살", "갈비찜", "닭갈비", "파스타",
        "피자", "햄버거", "초밥", "돈까스", "쌀국수",
        "카레", "짜장면", "짬뽕", "탕수육", "떡볶이"
    ];

    function getRandomMenu() {
        const randomIndex = Math.floor(Math.random() * foodMenus.length);
        return foodMenus[randomIndex];
    }

    recommendBtn.addEventListener('click', () => {
        const recommendedMenu = getRandomMenu();
        menuDisplay.innerHTML = `<p>${recommendedMenu}</p>`;
    });

    // Initial display
    menuDisplay.innerHTML = `<p>버튼을 눌러 메뉴를 추천받으세요!</p>`;
});
