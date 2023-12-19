exports.up = (pgm) => {
    pgm.createTable('playlist_collaboration', {
        id: {
            type: 'varchar(50)',
            primaryKey: true,
        },
        playlistId: {
            type: 'varchar(50)',
            references: 'playlist',
            onDelete: 'cascade',
            notNull: false,
        },
        userId: {
            type: 'varchar(50)',
            references: 'users',
            onDelete: 'cascade',
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('playlist_collaboration');
};
