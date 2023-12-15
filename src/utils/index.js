const playlistMapping = ({
    id,
    name,
    username,
}) => ({
    id,
    name,
    username,
});

const playlistSongMapping = ({
    id,
    name,
    username,
    songs,
}) => ({
    id,
    name,
    username,
    songs,
});

module.exports = { playlistMapping, playlistSongMapping };
