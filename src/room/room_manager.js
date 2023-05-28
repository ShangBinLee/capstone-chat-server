const joinRooms = (socket, chatRoomIds) => {
    chatRoomIds.forEach(chatRoomId => {
        socket.join(chatRoomId);
    });
};

export {
    joinRooms
};