exports.up = (pgm) => {
    pgm.createTable('album_like', {
        id: {
            type: 'varchar(50)',
            primaryKey: true,
        },
        userId: {
            type: 'varchar(50)',
            references: 'users',
            onDelete: 'cascade',
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
    pgm.dropTable('album_like');
};
