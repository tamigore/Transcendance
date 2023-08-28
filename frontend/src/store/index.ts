import { createStore } from 'vuex';
import { User, Room, Message, Game } from '../utils/interfaces';

const store = createStore({
    state: {
        user: {} as User,
        messages: [] as Message[],
        rooms: [] as Room[],
        private: [] as Room[],
        lastRoom: {} as Room,
        lastPrivate: {} as Room,
        lastMessage: {} as Message,
        ingame: false as boolean,
				insolo: false as boolean,
        inQueue: false as boolean,
				inInvite: false as boolean,
				dateInvite: Date.now() as number,
        playerNum: 0 as number,
        gameRoom: "" as string,
        game: {} as Game,
        specGames: [] as Game[],
    },
    mutations: {
        setDateInvite : function(state) {
            state.dateInvite = Date.now();
        },
        setInInvite : function(state, inInvite: boolean) {
			state.inInvite = inInvite;
		},
		setInSolo : function(state, insolo: boolean) {
			state.insolo = insolo;
		},
        setSpecGames : function(state, games: Game[]) {
            state.specGames = games.filter(game =>game.historic == null || game.historic == undefined);
        },
        setGameConnect : async function(state, gameConnect: boolean) {
            state.ingame = gameConnect;
        },
        setUserGameSocket : function (state, gameSocket: string) {
            state.user.gameSocket = gameSocket;
        },
        setGameRoom : function (state, gameRoom: string) {
            state.gameRoom = gameRoom;
        },
        setInQueue : function (state, inQueue: boolean) {
            state.inQueue = inQueue;
        },
        setPlayerNum : function (state, num: number) {
            state.playerNum = num;
        },
        setPlayer2Game : function (state, player2: User) {
            state.game.player2Id = player2.id;
            state.game.player2 = player2;
        },
        setGame : function (state, game: Game) {
            state.game = game;
        },
        addMessage : function (state, chatMessage: Message) {
            state.messages.push(chatMessage);
        },
        setMessages(state, chatMessages: Message[]) {
            state.messages = chatMessages;
        },
        setLastMessage(state, chatMessages: Message) {
            state.lastMessage = chatMessages;
        },
        setLastPrivate(state, room: Room) {
            state.lastPrivate = room;
            // console.log('setLastPrivate: ', state.lastPrivate);
        },
        setLastRoom(state, room: Room) {
            state.lastRoom = room;
            // console.log('setLastRoom: ', state.lastRoom);
        },
        setRooms(state, rooms: Room[]) {
            state.rooms = rooms;
            // console.log('setRooms: ', state.rooms);
        },
        addRoom(state, room: Room) {
            // console.log('addRoom: ', room);
            state.rooms.push(room);
        },
        delRoom(state, room: Room) {
            // console.log('delRoom: ', room);
            const index = state.rooms.indexOf(room);
            if (index >= 0) {
                state.rooms.splice(index, index);
            }
        },
        setPrivate(state, rooms: Room[]) {
            state.private = rooms;
            // console.log('setPrivate: ', state.private);
        },
        addPrivate(state, room: Room) {
            // console.log('addPrivate: ', room);
            state.private.push(room);
        },
        setFriend(state, users: User[]) {
            // console.log('setFriend: ', users);
            state.user.friend = users;
            state.user.friendBy = users;
        },
        setBlocked(state, users: User[]) {
            // console.log('setBlocked: ', users);
            state.user.friend = users;
            state.user.friendBy = users;
        },
        setUser(state, user: User) {
            // console.log('setUser: ', user);
            state.user.updated_at = user.updated_at;
            state.user.email = user.email;
            state.user.username = user.username;
            state.user.chatSocket = user.chatSocket;
            state.user.gameSocket = user.gameSocket;
            state.user.loggedIn = user.loggedIn;
            state.user.bio = user.bio;
            state.user.img = user.img;
            state.user.twoFA = user.twoFA;
            state.user.twoFAState = user.twoFA ? true : false;
            state.user.blocked = user.blocked;
            state.user.friend = user.friend;
            state.user.rooms = user.rooms;
            state.user.ingame = user.ingame;
            state.user.inqueue = user.inqueue;
        },
        delUser(state) {
            state.user = {} as User;
        },
        setUserID(state, id: number) {
            state.user.id = id;
        },
        setLogged(state, islog: boolean) {
            state.user.loggedIn = islog;
        },
        setUsername(state, username: string) {
            state.user.username = username;
        },
        setEmail(state, email: string) {
            state.user.email = email;
        },
        setHash(state, hash: string) {
            state.user.hash = hash;
        },
        setHashRt(state, hashRt: string) {
            state.user.hashRt = hashRt;
        },
        setChatSocket (state, chatSocket: string) {
            state.user.chatSocket = chatSocket;
        },
        setAvatarId (state, avatarId: string) {
            state.user.img = avatarId;
        },
        setBio (state, description: string) {
            state.user.bio = description;
        },
        setTwoFAState(state, twoFAState: boolean ) {
            state.user.twoFAState = twoFAState;
        }
    },
})

export default store;