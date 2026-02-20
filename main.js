let cards = [];
let selectedCards = [];
let MaxHP = 1000;
let playerHP = MaxHP;
let enemyHP = MaxHP;
let hasDrawnThisTurn = false;

async function loadCards() {
    const response = await fetch("cards.csv");
    const text = await response.text();

    const rows = text.trim().split("\n");
    const headers = rows[0].split(",");

    cards = rows.slice(1).map(row => {
        const values = row.split(",");
        const card = {};

        headers.forEach((header, i) => {
            card[header] = values[i];
        });

        //数値変換
        card["ダメージ"] = Number(card["ダメージ"]);
        card["自傷"] = Number(card["自傷"]);
        card["回復"] = Number(card["回復"]);
        card["コンボダメージ増加(掛け算）"] = Number(card["コンボダメージ増加(掛け算）"]);
        card["防御"] = Number(card["防御"]);
        card["コンボ自傷"] = safeNumber(row["コンボ自傷"]);

        return card;
    });

    console.log("読み込み完了", cards);

    return cards;
}

function getRandomCards(count) {
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displayCards(cardList) {
    const area = document.getElementById("cardArea");
    area.innerHTML = "";
    selectedCards = [];

    cardList.forEach(card => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `<strong>${card["名前"]}</strong><br>${card["効果"]}<br>⭐️${card["レアリティ"]}`;
        
        div.addEventListener("click", () => {
            if (selectedCards.includes(card)) {
                //選択解除
                selectedCards = selectedCards.filter(c => c !== card);
                div.style.backgroundColor = "";
            } else {
                if (selectedCards.length >= 3) return;
                selectedCards.push(card);
                div.style.backgroundColor = "lightgreen";
            }

            console.log("選択中:", selectedCards);
        });

        area.appendChild(div);
    });
}

function confirmSelection() {
    if (selectedCards.length !== 3) {
        alert("3枚選んでください");
        return;
    }

    let totalDamage = 0;
    let totalHeal = 0;
    let totalSelfDamage = 0;
    let buff = 1;
    let groupCount = {};
    let names = selectedCards.map(card => card["名前"]);

    let hasBrahma = names.includes("ブラフマー");
    let hasVishnu = names.includes("ヴィシュヌ");
    let hasShiva = names.includes("シヴァ");

    let isThreeGodCombo = hasBrahma && hasVishnu && hasShiva;

    if (isThreeGodCombo) {
        enemyHP = 0;

        document.getElementById("enemyHP").textContent = enemyHP;

        alert("三神コンボ発動！！相手に勝利した!");

        return;
    }

    selectedCards.forEach(card => {
        let group = Number(card["コンボグループ"]);
        if (group !== 0) {
            groupCount[group] = (groupCount[group] || 0) + 1;
        }
    });

    let activeGroups = Object.keys(groupCount).filter(g => groupCount[g] >= 2).map(g => Number(g));

    selectedCards.forEach(card => {
        let damage = card["ダメージ"];
        let group = Number(card["コンボグループ"]);
        let heal = card["回復"]

        if (activeGroups.includes(group)) {
            damage *= Number(card["コンボダメージ増加(掛け算）"]);
            totalSelfDamage += Number(card["コンボ自傷"]);
        }
        totalDamage += damage;
        totalHeal += heal;
        totalSelfDamage += card["自傷"];
        buff *= card["全体ダメージ増加"];

        console.log(card);
        console.log(card["コンボ自傷"]);
        console.log(card["コンボ自傷 "]);
    });

    totalDamage *= buff;
    totalSelfDamage *= buff;

    enemyHP -= totalDamage;
    playerHP += totalHeal;
    playerHP -= totalSelfDamage;

    playerHP = Math.min(playerHP, MaxHP);
    enemyHP = Math.max(enemyHP, 0);

    //HP更新
    document.getElementById("playerHP").textContent = playerHP;
    document.getElementById("enemyHP").textContent = enemyHP;

    alert(`与ダメージ: ${totalDamage} (倍率 x${buff})`);

    if (enemyHP <= 0) {
        alert("勝利!");
        return;
    }

    enemyAttack();

    if (playerHP <= 0) {
        alert("敗北...");
        return;
    }

    nextTurn();
}

function nextTurn() {
    selectedCards = [];

    const cardArea = document.getElementById("cardArea");
    cardArea.innerHTML = "";

    const button = document.getElementById("drawButton");
    button.disabled = false;
}

function enemyAttack() {
    let enemyDamage = Math.floor(Math.random()*200) + 200;

    let totalDefense = 0;

    selectedCards.forEach(card => {
        totalDefense += Number(card["防御"]);
    });

    let finalDamage = Math.max(0, enemyDamage - totalDefense);

    playerHP -= finalDamage;

    document.getElementById("playerHP").textContent = playerHP;

    alert(`敵の攻撃！ ${enemyDamage}ダメージ\n防御 ${totalDefense}\n最終ダメージ ${finalDamage}`);
}

function startGame() {
    const button = document.getElementById("drawButton");
    button.disabled = true;

    loadCards().then(cards => {
        console.log("読み込み完了", cards);

        const shuffled = cards.sort(() => 0.5 - Math.random());
        const hand = shuffled.slice(0, 10);

        console.log("引いた10枚:", hand);

        displayCards(hand);
    });
}

function safeNumber(value) {
    return Number(value) || 0;
}

function resetGame() {
    location.reload();
}
