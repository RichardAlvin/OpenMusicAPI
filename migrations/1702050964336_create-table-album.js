exports.up = (pgm) => {
    pgm.createTable('album', {
        id: {
            type: 'varchar(50)',
            primaryKey: true,
        },
        name: {
            type: 'TEXT',
            notNull: true,
        },
        year: {
            type: 'INTEGER',
            notNull: true,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('album');
};
