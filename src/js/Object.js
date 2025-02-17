
// 默认 Message 对象
export const Message = {
    messageId: null,
    roomId: null,
    userId: null,
    playerName: "",
    messageType: "", // SYSTEM, ALL, DAYTALK, etc.
    messageIndex: 0,
    messageGmToPlayerId: null,
    messageTime: new Date(),
    messageContent: "",
    fontColor: "#000000", // Default black
    fontSize: "14px", // Default size
    dayTime: "0", // "0" = before game starts
    replyTo: null,
    user: null, // Optional user information
  };
  
  // 工厂函数创建 Message 对象
  export const createMessage = (overrides = {}) => ({
    ...Message,
    ...overrides,
  });
  
  // 默认 Player 对象
  export const Player = {
    playerId: 0,
    userId: 0,
    roomPlayerId: 0,
    name: "",
    iconUrl: "",
    roomId: 0,
    identity: null,
    isAlive: true,
    isReady: false,
  };
  
  // 工厂函数创建 Player 对象
  export const createPlayer = (overrides = {}) => ({
    ...Player,
    ...overrides,
  });
  
  // 默认 Room 对象
  export const Room = {
    roomId: 0,
    roomState: "NORMAL", // NORMAL, PLAYING, ENDED, etc.
    players: [], // Array of Player objects
    gameSettings: null, // Optional game settings object
    roomCreatorId: null,
    gameSettingId: null,
    winner: "DRAW", // DRAW, MURABITO, JINROU, etc.
    roomCreateTime: new Date().toISOString(),
    roomEndTime: null,
    roomTitle: "",
    roomDescription: "",
    isAnonymous: "NO", // NO, WEAK, STRONG
    isLocked: false,
    roomPassword: null,
    villageRule: "",
    gameInfo: null, // Optional game info object
    playerMessages: {}, // Map<Long, List<String>>
    user: null, // Optional user information
  };
  
  // 工厂函数创建 Room 对象
  export const createRoom = (overrides = {}) => ({
    ...Room,
    ...overrides,
  });
  
  // 默认 GameActionBody 对象
  export const GameActionBody = {
    code: "",
    roomId: 0,
    operatorOfPlayerId: 0,
    targetOfPlayerId: [], // Array of target player IDs
    actionTime: new Date().toISOString(),
    message: null, // Message object
  };
  
  // 工厂函数创建 GameActionBody 对象
  export const createGameActionBody = (overrides = {}) => ({
    ...GameActionBody,
    ...overrides,
  });
  
  // 默认 Identity 对象
  export const Identity = {
    name: "", // E.g., "Seer", "Werewolf"
  };
  
  // 工厂函数创建 Identity 对象
  export const createIdentity = (overrides = {}) => ({
    ...Identity,
    ...overrides,
  });
  