/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('playlist_activity', {
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
        songId: {
            type: 'varchar(50)',
            references: 'song',
            onDelete: 'cascade',
            notNull: false,
        },
        userId: {
            type: 'varchar(50)',
            references: 'users',
            onDelete: 'cascade',
            notNull: false,
        },
        action: {
            type: 'varchar(50)',
            notNull: false,
        },
        time: {
            type: 'string',
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('playlist_activity');
};
