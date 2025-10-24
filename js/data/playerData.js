const PLAYER_DATA_KEY = 'glitchfall_player_data';

// Estrutura de dados padrão para um novo jogador
const defaultPlayerData = {
  unlockedCharacters: ['kira'], // Começa com a Kira desbloqueada
  unlockedWeapons: ['Lâmina Binária'], // Começa com a arma básica
  permanentCurrency: 0,
  bestScore: 0,
  // Outras melhorias permanentes podem ser adicionadas aqui
  permanentUpgrades: {},
};

/**
 * Carrega os dados do jogador do localStorage.
 * Se não houver dados, cria e salva a estrutura padrão.
 * @returns {object} Os dados do jogador.
 */
export function loadPlayerData() {
  try {
    const data = localStorage.getItem(PLAYER_DATA_KEY);
    if (data) {
      // Mescla os dados salvos com os padrões para garantir que novas propriedades sejam adicionadas
      const savedData = JSON.parse(data);
      return { ...defaultPlayerData, ...savedData };
    } else {
      // Se não houver dados, salva e retorna os padrões
      savePlayerData(defaultPlayerData);
      return defaultPlayerData;
    }
  } catch (error) {
    console.error("Erro ao carregar os dados do jogador:", error);
    return defaultPlayerData;
  }
}

/**
 * Salva os dados do jogador no localStorage.
 * @param {object} playerData O objeto de dados do jogador a ser salvo.
 */
export function savePlayerData(playerData) {
  try {
    localStorage.setItem(PLAYER_DATA_KEY, JSON.stringify(playerData));
  } catch (error) {
    console.error("Erro ao salvar os dados do jogador:", error);
  }
}

/**
 * Adiciona um personagem à lista de desbloqueados e salva.
 * @param {string} characterName O nome do personagem a ser desbloqueado.
 */
export function unlockCharacter(characterName) {
  const playerData = loadPlayerData();
  if (!playerData.unlockedCharacters.includes(characterName)) {
    playerData.unlockedCharacters.push(characterName);
    savePlayerData(playerData);
    console.log(`Personagem ${characterName} desbloqueado!`);
  }
}

/**
 * Adiciona uma arma à lista de desbloqueadas e salva.
 * @param {string} weaponName O nome da arma a ser desbloqueada.
 */
export function unlockWeapon(weaponName) {
  const playerData = loadPlayerData();
  if (!playerData.unlockedWeapons.includes(weaponName)) {
    playerData.unlockedWeapons.push(weaponName);
    savePlayerData(playerData);
    console.log(`Arma ${weaponName} desbloqueada!`);
  }
}

/**
 * Atualiza a pontuação máxima do jogador.
 * @param {number} newScore A nova pontuação.
 */
export function updateBestScore(newScore) {
    const playerData = loadPlayerData();
    if (newScore > playerData.bestScore) {
        playerData.bestScore = newScore;
        savePlayerData(playerData);
    }
}

/**
 * Adiciona uma quantidade de moeda permanente e salva.
 * @param {number} amount A quantidade a ser adicionada.
 */
export function addPermanentCurrency(amount) {
    const playerData = loadPlayerData();
    playerData.permanentCurrency += amount;
    savePlayerData(playerData);
}
