const dummyActors = GAME_DATA.actors;
const dummySkills = GAME_DATA.skills;
const statusDefs = GAME_DATA.statuses;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function fillSelect(select, items) {
    select.innerHTML = '';
    items.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
    });
}

function getActor(type, id) {
    return dummyActors[type].find((actor) => actor.id === id);
}

function getSkill(id) {
    return dummySkills.find((skill) => skill.id === id);
}

function calcPhysicalDamage(attacker, defender, skill, isCrit) {
    const base = attacker.stats.atk * skill.power;
    const rand = 0.75 + Math.random() * 0.25;
    const defRate = isCrit ? 0 : clamp(defender.stats.atk / (defender.stats.atk + 200), 0.05, 0.65);
    return Math.floor(base * rand * (1 - defRate));
}

function calcMagicDamage(skill) {
    const rand = 0.75 + Math.random() * 0.25;
    return Math.floor(skill.power * rand);
}

function calcCritRate(attacker) {
    return clamp(attacker.stats.int / 500, 0.05, 0.5);
}

function calcHitRate(attacker, defender) {
    return clamp(0.75 + (attacker.stats.spd - defender.stats.spd) / 1000, 0.7, 0.98);
}

function applyStatus(target, statusType) {
    if (!statusType || !statusDefs[statusType]) {
        return;
    }
    if (!target.statuses[statusType]) {
        target.statuses[statusType] = { turns: statusDefs[statusType].maxTurns };
    } else {
        target.statuses[statusType].turns = statusDefs[statusType].maxTurns;
    }
}

function statusLabel(statuses) {
    const names = Object.keys(statuses).filter((key) => statuses[key].turns > 0);
    return names.join(' ');
}

function applyStartOfTurnEffects(actor) {
    if (actor.statuses['毒'] && actor.statuses['毒'].turns > 0) {
        const damage = Math.floor(actor.maxHp * 0.05);
        actor.hp = Math.max(0, actor.hp - damage);
        return [`毒 ${damage}ダメージ`];
    }
    return [];
}

function shouldSkipAction(actor) {
    if (actor.statuses['眠り'] && actor.statuses['眠り'].turns > 0) {
        return '眠りで行動不能';
    }
    if (actor.statuses['麻痺'] && actor.statuses['麻痺'].turns > 0) {
        if (Math.random() < statusDefs['麻痺'].skipRate) {
            return '麻痺で行動不能';
        }
    }
    return null;
}

function tickStatuses(actor) {
    Object.keys(actor.statuses).forEach((key) => {
        if (actor.statuses[key].turns > 0) {
            actor.statuses[key].turns -= 1;
        }
    });
}

function runDummyBattle(ally, enemy, allySkill, enemySkill) {
    const log = [];
    const allyState = {
        name: ally.name,
        hp: ally.hp,
        mp: ally.mp,
        maxHp: ally.hp,
        maxMp: ally.mp,
        stats: ally.stats,
        statuses: {},
    };
    const enemyState = {
        name: enemy.name,
        hp: enemy.hp,
        mp: enemy.mp,
        maxHp: enemy.hp,
        maxMp: enemy.mp,
        stats: enemy.stats,
        statuses: {},
    };

    const turnCount = 5;
    for (let turn = 1; turn <= turnCount; turn += 1) {
        if (allyState.hp <= 0 || enemyState.hp <= 0) {
            break;
        }

        const startEffects = [];
        const allyEffects = applyStartOfTurnEffects(allyState);
        const enemyEffects = applyStartOfTurnEffects(enemyState);
        if (allyEffects.length > 0) {
            startEffects.push(
                ...allyEffects.map((effect) => ({
                    side: '味方',
                    text: '状態異常',
                    result: effect,
                }))
            );
        }
        if (enemyEffects.length > 0) {
            startEffects.push(
                ...enemyEffects.map((effect) => ({
                    side: '敵',
                    text: '状態異常',
                    result: effect,
                }))
            );
        }

        const start = {
            allyHp: allyState.hp,
            enemyHp: enemyState.hp,
            allyStatus: statusLabel(allyState.statuses),
            enemyStatus: statusLabel(enemyState.statuses),
            allyMp: allyState.mp,
            enemyMp: enemyState.mp,
        };

        const actions = [];
        const order = allyState.stats.spd >= enemyState.stats.spd ? ['ally', 'enemy'] : ['enemy', 'ally'];

        for (let i = 0; i < order.length; i += 1) {
            const side = order[i];
            const isAlly = side === 'ally';
            const actor = isAlly ? allyState : enemyState;
            const target = isAlly ? enemyState : allyState;
            const skill = isAlly ? allySkill : enemySkill;
            const text = `${skill.name}（${skill.type}）`;
            let result = '';

            if (actor.hp <= 0 || target.hp <= 0) {
                break;
            }

            if (skill.mpCost > 0) {
                if (actor.mp < skill.mpCost) {
                    result = 'MP不足で失敗';
                } else {
                    actor.mp -= skill.mpCost;
                }
            }

            if (result === '') {
                const skipReason = shouldSkipAction(actor);
                if (skipReason) {
                    result = skipReason;
                }
            }

            if (result === '') {
                if (skill.type === '物理') {
                    const hitRate = calcHitRate(actor, target);
                    if (Math.random() > hitRate) {
                        result = '回避';
                    } else {
                        const isCrit = Math.random() < calcCritRate(actor);
                        const damage = calcPhysicalDamage(actor, target, skill, isCrit);
                        target.hp = Math.max(0, target.hp - damage);
                        result = `${damage}ダメージ${isCrit ? ' / クリティカル' : ''}`;
                    }
                } else {
                    const damage = calcMagicDamage(skill);
                    target.hp = Math.max(0, target.hp - damage);
                    result = `${damage}ダメージ`;
                }
            }

            if (result === '' || result.includes('ダメージ')) {
                if (skill.status && Math.random() < skill.status.rate) {
                    const statusResist = clamp(target.stats.mnd / 400, 0, 0.5);
                    if (Math.random() > statusResist) {
                        applyStatus(target, skill.status.type);
                        result += ` / 状態異常: ${skill.status.type}`;
                    }
                }
            }

            if (skill.heal) {
                actor.hp = Math.min(actor.maxHp, actor.hp + skill.heal);
                result += ` / 回復 ${skill.heal}`;
            }

            actions.push({
                order: i + 1,
                side: isAlly ? '味方' : '敵',
                text,
                result,
            });
            if (target.hp <= 0) {
                break;
            }
        }

        tickStatuses(allyState);
        tickStatuses(enemyState);

        allyState.mp = Math.min(allyState.maxMp, allyState.mp + Math.floor(allyState.maxMp * 0.1));
        enemyState.mp = Math.min(enemyState.maxMp, enemyState.mp + Math.floor(enemyState.maxMp * 0.1));

        log.push({
            turn,
            start,
            startEffects,
            actions,
            end: {
                allyHp: allyState.hp,
                enemyHp: enemyState.hp,
                allyMp: allyState.mp,
                enemyMp: enemyState.mp,
            },
        });
    }

    const result =
        allyState.hp > enemyState.hp ? '勝利' : allyState.hp === enemyState.hp ? '引き分け' : '敗北';

    return {
        title: `${ally.name} vs ${enemy.name}`,
        ally,
        enemy,
        log,
        result,
        rewards: result === '勝利' ? '装備: 1 / スキル: 0 / 称号: 1 / 実績: 0' : '装備: 0 / スキル: 0',
        finalMp: {
            ally: allyState.mp,
            enemy: enemyState.mp,
        },
    };
}

function saveBattleLog(data) {
    localStorage.setItem('dummyBattleLog', JSON.stringify(data));
}

function setup() {
    const allySelect = document.getElementById('ally-select');
    const enemySelect = document.getElementById('enemy-select');
    const allySkillSelect = document.getElementById('ally-skill');
    const enemySkillSelect = document.getElementById('enemy-skill');
    const runButton = document.getElementById('run-battle');
    const allyList = document.getElementById('ally-data');
    const enemyList = document.getElementById('enemy-data');
    const skillList = document.getElementById('skill-data');

    fillSelect(allySelect, dummyActors.allies);
    fillSelect(enemySelect, dummyActors.enemies);
    fillSelect(allySkillSelect, dummySkills);
    fillSelect(enemySkillSelect, dummySkills);

    if (allyList) {
        allyList.innerHTML = '';
        dummyActors.allies.forEach((actor) => {
            const li = document.createElement('li');
            li.textContent = `${actor.name} HP:${actor.hp} MP:${actor.mp} ATK:${actor.stats.atk} SPD:${actor.stats.spd}`;
            allyList.appendChild(li);
        });
    }

    if (enemyList) {
        enemyList.innerHTML = '';
        dummyActors.enemies.forEach((actor) => {
            const li = document.createElement('li');
            li.textContent = `${actor.name} HP:${actor.hp} MP:${actor.mp} ATK:${actor.stats.atk} SPD:${actor.stats.spd}`;
            enemyList.appendChild(li);
        });
    }

    if (skillList) {
        skillList.innerHTML = '';
        dummySkills.forEach((skill) => {
            const li = document.createElement('li');
            const statusText = skill.status ? ` 状態:${skill.status.type}(${Math.round(skill.status.rate * 100)}%)` : '';
            const healText = skill.heal ? ` 回復:${skill.heal}` : '';
            li.textContent = `${skill.name} ${skill.type} 威力:${skill.power} MP:${skill.mpCost}${healText}${statusText}`;
            skillList.appendChild(li);
        });
    }

    runButton.addEventListener('click', () => {
        const ally = getActor('allies', allySelect.value);
        const enemy = getActor('enemies', enemySelect.value);
        const allySkill = getSkill(allySkillSelect.value);
        const enemySkill = getSkill(enemySkillSelect.value);

        if (!ally || !enemy || !allySkill || !enemySkill) {
            return;
        }

        const data = runDummyBattle(ally, enemy, allySkill, enemySkill);
        saveBattleLog(data);
        window.location.href = 'combat-log.html';
    });
}

setup();
