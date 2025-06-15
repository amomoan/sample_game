document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const catImage = document.getElementById('cat-image');
    const statEnergy = document.getElementById('stat-energy');
    const statFullness = document.getElementById('stat-fullness');
    const statMood = document.getElementById('stat-mood');
    const statCleanliness = document.getElementById('stat-cleanliness');
    const catMessage = document.getElementById('cat-message');
    const playerMoney = document.getElementById('player-money');

    const btnPlay = document.getElementById('btn-play');
    const btnFeed = document.getElementById('btn-feed');
    const btnScold = document.getElementById('btn-scold');
    const btnCleanPoop = document.getElementById('btn-clean-poop');
    const btnSleep = document.getElementById('btn-sleep');
    const btnShop = document.getElementById('btn-shop');
    const btnWork = document.getElementById('btn-work');

    const poopArea = document.getElementById('poop-area');
    const poopImage = document.getElementById('poop-image');

    const shopModal = document.getElementById('shop-modal');
    const shopItemsContainer = document.getElementById('shop-items');
    const workModal = document.getElementById('work-modal');
    const btnStartWork = document.getElementById('btn-start-work');
    const workTimerDisplay = document.getElementById('work-timer');

    // ゲームの状態 (localStorageからロード、なければ初期値)
    let cat = loadGameData() || {
        energy: 80, // 初期値を少し下げて、体力回復の重要性を示す
        fullness: 80,
        mood: 80,
        cleanliness: 80,
        poopExists: false,
        isSleeping: false
    };

    let player = {
        money: 1000,
        // inventory: {} // 将来的にインベントリを追加するならここ
    };

    const items = {
        food_basic: { name: "基本の餌", price: 50, effect: { fullness: 30, mood: 5 } },
        toy_ball: { name: "ボール", price: 100, effect: { mood: 20, energy: -10 } } // 遊ぶで体力消費を表現
    };

    // ゲームの初期化
    function initializeGame() {
        updateUI();
        setInterval(gameTick, 3000); // 3秒ごとにゲームの状態を更新
        setInterval(poopCheck, 10000); // 10秒ごとにうんちの生成チェック
        saveGameData(); // 初回ロード時もセーブ
    }

    // UIの更新
    function updateUI() {
        statEnergy.textContent = cat.energy;
        statFullness.textContent = cat.fullness;
        statMood.textContent = cat.mood;
        statCleanliness.textContent = cat.cleanliness;
        playerMoney.textContent = player.money;

        // ねこの画像とメッセージの更新
        if (cat.isSleeping) {
            catImage.src = 'images/cat_sleepy.png';
            catMessage.textContent = 'すやすや眠っているにゃん...';
            disableAllActionButtons();
            btnSleep.textContent = '起きる';
        } else {
            if (cat.mood < 30) {
                catImage.src = 'images/cat_sad.png';
                catMessage.textContent = 'ねこは悲しそうです...';
            } else if (cat.fullness < 30) {
                catImage.src = 'images/cat_hungry.png';
                catMessage.textContent = 'お腹が空いたにゃー！';
            } else if (cat.energy < 30 && !cat.isSleeping) { // 寝ていないのに疲れている場合
                catImage.src = 'images/cat_sleepy.png';
                catMessage.textContent = '眠いにゃん...';
            } else if (cat.cleanliness < 30 && cat.poopExists) {
                catImage.src = 'images/cat_dirty.png';
                catMessage.textContent = 'うんちが臭いにゃん！';
            } else {
                catImage.src = 'images/cat_normal.png';
                catMessage.textContent = 'にゃーん。';
            }
            enableAllActionButtons();
            btnSleep.textContent = '寝る';
        }

        // うんちの表示/非表示
        poopArea.style.display = cat.poopExists ? 'block' : 'none';
        saveGameData(); // 状態が変わるたびにセーブ
    }

    // 全てのアクションボタンを無効化
    function disableAllActionButtons() {
        btnPlay.disabled = true;
        btnFeed.disabled = true;
        btnScold.disabled = true;
        btnCleanPoop.disabled = true;
        btnShop.disabled = true;
        btnWork.disabled = true;
    }

    // 全てのアクションボタンを有効化
    function enableAllActionButtons() {
        btnPlay.disabled = false;
        btnFeed.disabled = false;
        btnScold.disabled = false;
        btnCleanPoop.disabled = false;
        btnShop.disabled = false;
        btnWork.disabled = false;
    }

    // ゲームのティック（時間経過）
    function gameTick() {
        if (cat.isSleeping) {
            cat.energy = Math.min(100, cat.energy + 10); // 寝ている間は体力回復
            cat.mood = Math.min(100, cat.mood + 5); // 機嫌も少し良くなる
            showMessage("すやすや...", 1000);
        } else {
            cat.fullness = Math.max(0, cat.fullness - 5);
            cat.energy = Math.max(0, cat.energy - 3);
            cat.mood = Math.max(0, cat.mood - 2);
            if (cat.poopExists) {
                cat.cleanliness = Math.max(0, cat.cleanliness - 5);
                cat.mood = Math.max(0, cat.mood - 3);
            }
        }
        updateUI();
    }

    // うんちの生成チェック
    function poopCheck() {
        if (!cat.poopExists && cat.fullness > 50 && Math.random() < 0.4) { // 満腹度が高く、40%の確率で
            cat.poopExists = true;
            showMessage("うんちをしたにゃん！", 3000);
            updateUI();
        }
    }

    // メッセージ表示
    let messageTimeout;
    function showMessage(message, duration = 1500) {
        catMessage.textContent = message;
        clearTimeout(messageTimeout);
        messageTimeout = setTimeout(() => {
            catMessage.textContent = '';
            updateUI();
        }, duration);
    }

    // ゲームデータの保存 (localStorage)
    function saveGameData() {
        localStorage.setItem('catGameData', JSON.stringify({ cat: cat, player: player }));
    }

    // ゲームデータのロード (localStorage)
    function loadGameData() {
        const data = localStorage.getItem('catGameData');
        if (data) {
            const parsedData = JSON.parse(data);
            cat = parsedData.cat;
            player = parsedData.player;
            return cat; // 最初の初期化関数がcatオブジェクトを受け取るため
        }
        return null;
    }

    // --- アクションボタンのイベントリスナー ---

    // アクション：遊ぶ (play.htmlへ遷移)
    btnPlay.addEventListener('click', () => {
        // ねこの現在の状態をlocalStorageに保存して、play.htmlでロードできるようにする
        saveGameData();
        window.location.href = 'play.html';
    });

    // アクション：餌をあげる
    btnFeed.addEventListener('click', () => {
        if (player.money >= items.food_basic.price) {
            player.money -= items.food_basic.price;
            cat.fullness = Math.min(100, cat.fullness + items.food_basic.effect.fullness);
            cat.mood = Math.min(100, cat.mood + items.food_basic.effect.mood);
            showMessage("モグモグ、美味しいにゃん！", 1500);
            updateUI();
        } else {
            showMessage("お金が足りないにゃん...", 1500);
        }
    });

    // アクション：しつける（叱る）
    btnScold.addEventListener('click', () => {
        cat.mood = Math.max(0, cat.mood - 15);
        showMessage("シュン...としょげたにゃん...", 1500);
        updateUI();
    });

    // アクション：糞の処理
    btnCleanPoop.addEventListener('click', () => {
        if (cat.poopExists) {
            cat.poopExists = false;
            cat.cleanliness = Math.min(100, cat.cleanliness + 50);
            cat.mood = Math.min(100, cat.mood + 10);
            showMessage("お部屋が綺麗になったにゃん！", 1500);
            updateUI();
        } else {
            showMessage("うんちはないにゃん。", 1500);
        }
    });

    // アクション：寝る
    btnSleep.addEventListener('click', () => {
        cat.isSleeping = !cat.isSleeping; // 状態をトグル
        if (cat.isSleeping) {
            showMessage("おやすみにゃん...", 2000);
        } else {
            showMessage("ふぁ〜、よく寝たにゃん！", 2000);
        }
        updateUI();
    });

    // --- ショップ機能 ---
    btnShop.addEventListener('click', () => {
        shopModal.style.display = 'flex';
        renderShopItems();
    });

    function renderShopItems() {
        shopItemsContainer.innerHTML = '';
        for (const itemId in items) {
            const item = items[itemId];
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('shop-item');
            itemDiv.dataset.itemId = itemId;
            itemDiv.innerHTML = `
                <p>${item.name} (${item.price}G)</p>
                <button class="buy-button">購入</button>
            `;
            shopItemsContainer.appendChild(itemDiv);
        }

        document.querySelectorAll('.buy-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.target.closest('.shop-item').dataset.itemId;
                buyItem(itemId);
            });
        });
    }

    function buyItem(itemId) {
        const item = items[itemId];
        if (player.money >= item.price) {
            player.money -= item.price;
            // 購入したアイテムの効果を即座に適用（簡易版）
            if (item.effect.fullness) cat.fullness = Math.min(100, cat.fullness + item.effect.fullness);
            if (item.effect.mood) cat.mood = Math.min(100, cat.mood + item.effect.mood);
            if (item.effect.energy) cat.energy = Math.min(100, cat.energy + item.effect.energy);

            showMessage(`${item.name}を購入したにゃん！`, 1500);
            updateUI();
        } else {
            showMessage("お金が足りないにゃん...", 1500);
        }
    }

    // --- 仕事機能 ---
    let workInterval;
    btnWork.addEventListener('click', () => {
        workModal.style.display = 'flex';
    });

    btnStartWork.addEventListener('click', () => {
        let workDuration = 30; // 30秒
        let timer = workDuration;
        btnStartWork.disabled = true;
        workTimerDisplay.textContent = `残り時間: ${timer}秒`;
        showMessage("お仕事頑張るにゃん！", 1500);

        workInterval = setInterval(() => {
            timer--;
            workTimerDisplay.textContent = `残り時間: ${timer}秒`;
            if (timer <= 0) {
                clearInterval(workInterval);
                player.money += 300; // 300G稼ぐ
                showMessage("お仕事お疲れ様にゃん！300Gゲット！", 3000);
                btnStartWork.disabled = false;
                workTimerDisplay.textContent = "";
                updateUI();
                workModal.style.display = 'none';
            }
        }, 1000);
    });

    // --- モーダル共通処理 ---
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', (event) => {
            event.target.closest('.modal').style.display = 'none';
            if (workInterval) {
                clearInterval(workInterval);
                btnStartWork.disabled = false;
                workTimerDisplay.textContent = "";
            }
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target == shopModal) {
            shopModal.style.display = 'none';
        }
        if (event.target == workModal) {
            workModal.style.display = 'none';
            if (workInterval) {
                clearInterval(workInterval);
                btnStartWork.disabled = false;
                workTimerDisplay.textContent = "";
            }
        }
    });

    // ゲーム開始
    initializeGame();
});