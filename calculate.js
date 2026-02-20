function calculateTurn(selectedCards, playerHP, enemyHP) {
    let totalDamage = 0;
    let totalHeal = 0;
    let totalSelfDamage = 0;

    //コンボ集計
    const groupCount = {}
    selectedCards.forEach(card => {
        if (!card.comboGroup) return;
        groupCount[card.comboGroup] = (groupCount[card.comboGroup] || 0) + 1;
    });

    //即死判定
    if (groupCount["trimurti"] === 3) {
        return {
            playerHP,
            enemyHP: 0,
            log: "三神降臨!即死ダメージ!"
        };
    }

    //ダメージ計算
    selectedCards.forEach(card => {
        let damage = card.damage;

        if (card.comboGroup && groupCount[card.comboGroup] >= 2) {
            damage *= card.comboMultiplier;
            totalSelfDamage += card.comboSelfDamage || 0;
        }
        
        totalDamage += damage;
        totalHeal += card.heal || 0;
        totalSelfDamage += card.selfDamage || 0;
    });

    enemyHP -= totalDamage;
    playerHP += totalHeal;
    playerHP -= totalSelfDamage;

    return {
        playerHP,
        enemyHP,
        log: '与ダメージ: ${totalDamage}'
    };
}