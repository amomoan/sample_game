document.addEventListener('DOMContentLoaded', () => {
    const playCatImage = document.getElementById('play-cat-image');
    const playMessage = document.getElementById('play-message');
    const btnStopPlay = document.getElementById('btn-stop-play');
    const playEnergyCostDisplay = document.getElementById('play-energy-cost');
    const playMoodGainDisplay = document.getElementById('play-mood-gain');

    // localStorageからねこの状態をロード
    let cat = { energy: 100, mood: 100 }; // デフォルト値
    let player = { money: 0 };

    function loadGameData() {
        const data = localStorage.getItem('catGameData');
        if (data) {
            const parsedData = JSON.parse(data);
            cat = parsedData.cat;
            player = parsedData.player;
        }
    }
    loadGameData(); // 画面ロード時にゲームデータをロード

    let interactionCount = 0; // インタラクション回数をカウント
    const maxInteractions = 10; // 最大インタラクション回数
    const energyPerInteraction = 3; // 1回あたりの体力消費
    const moodPerInteraction = 5; // 1回あたりの機嫌上昇

    // 初期表示
    updatePlayStats();

    function updatePlayStats() {
        playEnergyCostDisplay.textContent = energyPerInteraction * interactionCount;
        playMoodGainDisplay.textContent = moodPerInteraction * interactionCount;
    }

    // メッセージ表示関数（遊ぶ画面用）
    let messageTimeout;
    function showPlayMessage(message, duration = 1000) {
        playMessage.textContent = message;
        playMessage.classList.add('show');
        clearTimeout(messageTimeout);
        messageTimeout = setTimeout(() => {
            playMessage.classList.remove('show');
        }, duration);
    }

    // ねこを撫でる/クリックするインタラクション
    playCatImage.addEventListener('click', () => {
        if (interactionCount >= maxInteractions) {
            showPlayMessage("もう十分遊んだにゃん！");
            return;
        }

        if (cat.energy <= energyPerInteraction) {
            showPlayMessage("ねこは疲れているにゃん...");
            return;
        }

        interactionCount++;
        cat.energy = Math.max(0, cat.energy - energyPerInteraction);
        cat.mood = Math.min(100, cat.mood + moodPerInteraction);

        // リアクションアニメーション
        playCatImage.classList.add('react');
        setTimeout(() => {
            playCatImage.classList.remove('react');
        }, 100); // 100ms後にアニメーションをリセット

        // 画像の切り替え（例: 5回に1回、ご機嫌なねこに）
        if (interactionCount % 3 === 0) {
             playCatImage.src = 'images/cat_happy.png'; // ご機嫌なねこの画像
             showPlayMessage("ゴロゴロ...うれしいにゃん！");
        } else {
             playCatImage.src = 'images/cat_normal.png'; // 通常のねこの画像
             showPlayMessage("にゃーん♪");
        }
        updatePlayStats();
    });

    // 遊びをやめるボタン
    btnStopPlay.addEventListener('click', () => {
        // ねこの状態を保存してホーム画面に戻る
        localStorage.setItem('catGameData', JSON.stringify({ cat: cat, player: player }));
        window.location.href = 'index.html'; // ホーム画面に戻る
    });

    // ドラッグで撫でる機能（簡易版）
    let isDragging = false;
    playCatImage.addEventListener('mousedown', () => {
        isDragging = true;
    });

    playCatImage.addEventListener('mouseup', () => {
        isDragging = false;
    });

    playCatImage.addEventListener('mousemove', (e) => {
        if (isDragging) {
            // ドラッグ中は常にリアクションをトリガー
            // ただし、連続しすぎないようにインターバルを設けるか、
            // クリックとの重複を避けるロジックが必要
            // ここでは簡易的に、クリックと同じ効果をトリガー
            // e.preventDefault(); // ドラッグによる画像の移動などを防ぐ
            // playCatImage.click(); // クリックイベントを発生させることも可能だが、無限ループに注意
            // より高度なドラッグ認識は、前のmousemoveイベントからの距離で判断するなど
        }
    });

    // Mobile touch events for interaction
    playCatImage.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        isDragging = true;
        // Simulate a click event for touch
        playCatImage.click();
    });

    playCatImage.addEventListener('touchend', () => {
        isDragging = false;
    });

    playCatImage.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault(); // Prevent scrolling while touching the cat
            // No direct click for touchmove to avoid over-triggering
        }
    });
});