function setText(el, text) {
    if (!el) {
        return;
    }
    el.textContent = text;
}

function renderBattleLog(data) {
    setText(document.getElementById('battle-title'), data.title);
    setText(document.getElementById('battle-result'), data.result);
    setText(document.getElementById('battle-reward'), data.rewards);
    if (data.finalMp) {
        setText(
            document.getElementById('battle-mp'),
            `味方 ${data.finalMp.ally} / 敵 ${data.finalMp.enemy}`
        );
    }

    const turnBlocks = document.querySelectorAll('.turn-block[data-turn]');
    turnBlocks.forEach((block) => {
        const turnNumber = Number(block.getAttribute('data-turn'));
        const turnData = data.log.find((entry) => entry.turn === turnNumber);
        if (!turnData) {
            block.style.display = 'none';
            return;
        }

        const allyLabel = block.querySelector('[data-hp="ally"]');
        const enemyLabel = block.querySelector('[data-hp="enemy"]');
        const allyMpLabel = block.querySelector('[data-mp="ally"]');
        const enemyMpLabel = block.querySelector('[data-mp="enemy"]');
        const allyBar = block.querySelector('.hp-bar .ally');
        const enemyBar = block.querySelector('.hp-bar .enemy');

        const allyStatus = turnData.start.allyStatus ? ` ${turnData.start.allyStatus}` : '';
        const enemyStatus = turnData.start.enemyStatus ? ` ${turnData.start.enemyStatus}` : '';

        setText(
            allyLabel,
            `味方 ${turnData.start.allyHp} / ${data.ally.hp}${allyStatus}`
        );
        setText(
            enemyLabel,
            `敵 ${turnData.start.enemyHp} / ${data.enemy.hp}${enemyStatus}`
        );
        setText(
            allyMpLabel,
            `MP ${turnData.start.allyMp} / ${data.ally.mp}`
        );
        setText(
            enemyMpLabel,
            `MP ${turnData.start.enemyMp} / ${data.enemy.mp}`
        );

        if (allyBar) {
            allyBar.style.width = `${Math.round((turnData.start.allyHp / data.ally.hp) * 100)}%`;
        }
        if (enemyBar) {
            enemyBar.style.width = `${Math.round((turnData.start.enemyHp / data.enemy.hp) * 100)}%`;
        }

        const actionsContainer = block.querySelector('[data-actions]');
        if (!actionsContainer) {
            return;
        }
        actionsContainer.innerHTML = '';
        if (turnData.startEffects && turnData.startEffects.length > 0) {
            turnData.startEffects.forEach((effect, idx) => {
                const line = document.createElement('div');
                line.className = `action-line ${effect.side === '味方' ? 'ally' : 'enemy'}`;

                const meta = document.createElement('div');
                meta.className = 'action-meta';
                meta.textContent = `開始時 / ${effect.side}`;

                const text = document.createElement('p');
                text.className = 'action-text';
                text.innerHTML = `${effect.text}<br>→ ${effect.result}`;

                line.appendChild(meta);
                line.appendChild(text);
                actionsContainer.appendChild(line);
            });
        }
        turnData.actions.forEach((action) => {
            const line = document.createElement('div');
            line.className = `action-line ${action.side === '味方' ? 'ally' : 'enemy'}`;

            const meta = document.createElement('div');
            meta.className = 'action-meta';
            meta.textContent = `行動順 ${action.order} / ${action.side}`;

            const text = document.createElement('p');
            text.className = 'action-text';
            text.innerHTML = `${action.text}<br>→ ${action.result}`;

            line.appendChild(meta);
            line.appendChild(text);
            actionsContainer.appendChild(line);
        });
    });
}

function loadBattleLog() {
    const raw = localStorage.getItem('dummyBattleLog');
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch (error) {
        return null;
    }
}

const data = loadBattleLog();
if (data) {
    renderBattleLog(data);
}
