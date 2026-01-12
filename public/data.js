const GAME_DATA = {
    actors: {
        allies: [
            {
                id: 'ally-1',
                name: 'ムクの群れ',
                hp: 200,
                mp: 100,
                stats: { atk: 100, spd: 100, int: 100, mnd: 80 },
            },
            {
                id: 'ally-2',
                name: '無垢の幼体',
                hp: 160,
                mp: 120,
                stats: { atk: 80, spd: 120, int: 120, mnd: 90 },
            },
        ],
        enemies: [
            {
                id: 'enemy-1',
                name: '灰の群れ',
                hp: 200,
                mp: 80,
                stats: { atk: 90, spd: 90, int: 80, mnd: 70 },
            },
            {
                id: 'enemy-2',
                name: '影の個体',
                hp: 140,
                mp: 110,
                stats: { atk: 70, spd: 130, int: 110, mnd: 60 },
            },
        ],
    },
    skills: [
        { id: 'skill-1', name: '裂傷の爪', type: '物理', power: 1.0, mpCost: 0, status: { type: '毒', rate: 0.2 } },
        { id: 'skill-2', name: '灰の火', type: '魔法', power: 80, mpCost: 30, status: { type: '毒', rate: 0.6 } },
        { id: 'skill-3', name: '静かな収束', type: '魔法', power: 60, mpCost: 20, heal: 20 },
        { id: 'skill-4', name: '影踏み', type: '物理', power: 0.9, mpCost: 0, status: { type: '眠り', rate: 0.3 } },
    ],
    statuses: {
        毒: { maxTurns: 3 },
        眠り: { maxTurns: 1 },
        麻痺: { maxTurns: 2, skipRate: 0.3 },
    },
};
