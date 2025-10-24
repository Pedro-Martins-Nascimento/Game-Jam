export const STATES = {
  IN_MENU: 'IN_MENU',
  IN_GAME: 'IN_GAME',
  GAME_OVER: 'GAME_OVER',
  UPGRADE_SCREEN: 'UPGRADE_SCREEN',
};

let currentState = STATES.IN_MENU;

export const gameState = {
  get: () => currentState,
  set: (newState) => {
    if (Object.values(STATES).includes(newState)) {
      console.log(`Game state changed from ${currentState} to ${newState}`);
      currentState = newState;
    } else {
      console.error(`Attempted to set invalid game state: ${newState}`);
    }
  },
  is: (state) => currentState === state,
};
