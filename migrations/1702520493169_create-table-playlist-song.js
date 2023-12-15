/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('playlist_song', {
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
    });
};

exports.down = (pgm) => {
    pgm.dropTable('playlist_song');
};
