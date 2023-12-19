exports.up = (pgm) => {
    pgm.createTable('song', {
        id: {
            type: 'varchar(50)',
            primaryKey: true,
        },
        title: {
            type: 'TEXT',
            notNull: true,
        },
        year: {
            type: 'INTEGER',
            notNull: true,
        },
        genre: {
            type: 'TEXT',
            notNull: true,
        },
        performer: {
            type: 'TEXT',
            notNull: true,
        },
        duration: {
            type: 'INTEGER',
            notNull: false,
        },
        albumId: {
            type: 'varchar(50)',
            references: 'album',
            onDelete: 'cascade',
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('song');
};
