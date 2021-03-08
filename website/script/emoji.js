function emojify(text) {
    emojis().forEach(e => {
        e.tags.forEach(tag => {
            text = text.replaceAll(tag, e.code);
        });
    })
    return text;
}

function emojis() {
    return [
        {code: '\u2744', tags: ['snowflake']},
        {code: '\u2604', tags: ['magic']},
        {code: '\u26A1', tags: ['zap']},
        {code: '\u2600', tags: ['sun']},
        {code: '\u2b50', tags: ['star']},
        {code: '\u2618', tags: ['clover']},
        {code: '\u263A', tags: ['happy', ':)'], emote: true},
        {code: '\u2639', tags: ['sad', ':('], emote: true},
        {code: '\u2620', tags: ['death', 'raw']},
        {code: '\u2764', tags: ['heart'], emote: true},
        {code: '\u23F3', tags: ['hourglass']},
        {code: '\u2728', tags: ['spell']},
        {code: '\u2694', tags: ['swords', 'physical']},
        {code: '\u2693', tags: ['anchor']},
        {code: '\u2666', tags: ['diamond']},
        {code: '\u26d3', tags: ['chains']},
        {code: '\u2697', tags: ['poison']},
        {code: '\u2623', tags: ['biohazard']},
        {code: '\u2622', tags: ['radiation']},
        {code: '\u26A0', tags: ['notification']},
        {code: '\u2757', tags: ['exclamation_1']},
        {code: '\u203C', tags: ['exclamation_2']},
        {code: '\u2049', tags: ['surprise']},
        {code: '\u269b', tags: ['atom']},
        {code: '\u267b', tags: ['recycle']},
        {code: '\u269c', tags: ['crown']},
        {code: '\u2b55', tags: ['red-circle']},
        {code: '\u26AB', tags: ['black-circle']},
        {code: '\u26AA', tags: ['white-circle']},
        {code: '\u2714', tags: ['check']},
        {code: '\u274C', tags: ['error']},
        {code: '\u27B0', tags: ['symbol']},
    ];
}