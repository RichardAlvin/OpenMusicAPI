/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('playlist', {
        id: {
            type: 'varchar(50)',
            primaryKey: true,
        },
        name: {
            type: 'TEXT',
            notNull: true,
        },
        ownerId: {
            type: 'varchar(50)',
            references: 'users',
            onDelete: 'cascade',
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('playlist');
};
