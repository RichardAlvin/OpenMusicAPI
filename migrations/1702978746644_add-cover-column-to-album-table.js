exports.up = (pgm) => {
    pgm.addColumns('album', {
        cover: {
            type: 'text',
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('album', {
        cover: {
            type: 'text',
            notNull: false,
        },
    });
};
