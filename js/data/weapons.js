export const weapons = [
  {
    name: "Lâmina Binária",
    aesthetics: "Espada metálica com circuitos azul-neon, cabo com luzes de “bits” fluindo.",
    progression: [
      { level: 1, description: "Dano base." },
      { level: 2, description: "+30% de dano, brilho neon moderado." },
      { level: 3, description: "+50% de dano e adiciona carga de golpe." },
      { level: 4, description: "Desbloqueia o “corte glitch” que causa lentidão." },
      { level: 5, description: "+80% de dano, versão Glitched com lâmina translúcida e partículas de erro." }
    ],
    specialEffect: {
      rare: "Borda roxa e partículas extras.",
      glitched: "Carga extra e um pequeno teleporte ao acertar um inimigo."
    }
  },
  {
    name: "Dual-Chaves de Depuração",
    aesthetics: "Duas pistolas finas, cada slide com “debug code” visível. Bits saem quando o projétil acerta.",
    progression: [
      { level: 1, description: "Dano base." },
      { level: 2, description: "+20% de cadência de tiro (fire-rate)." },
      { level: 3, description: "Desbloqueia projétil que salta para um inimigo vizinho." },
      { level: 4, description: "Aumenta a chance de acerto crítico." },
      { level: 5, description: "Versão Glitched com tiros que saltam em cadeia para múltiplos inimigos." }
    ],
    specialEffect: {
      rare: "Efeito de “depuração” que reduz a defesa do inimigo por 2 segundos.",
      glitched: "Efeito de “depuração” que reduz a defesa do inimigo por 2 segundos."
    }
  },
  {
    name: "Canhão de Dados",
    aesthetics: "Canhão futurista com cilindro transparente exibindo dados flutuantes e tubos externos com faíscas.",
    progression: [
      { level: 1, description: "Dano base." },
      { level: 2, description: "+15% de dano, cilindro de vidro gira mais rápido." },
      { level: 3, description: "Modo de rajada ou Overclock ativável." },
      { level: 4, description: "+20% de chance de crítico e melhor controle de aquecimento." },
      { level: 5, description: "Versão Glitched com projéteis que perfuram ou ricocheteiam e visual “bugado”." }
    ],
    specialEffect: {
      rare: "Cilindro de vidro com cor distinta.",
      glitched: "Efeitos extras e menor risco de superaquecimento."
    }
  },
  {
    name: "Lança Fragmento",
    aesthetics: "Lança escura/fosca com fragmentos brilhantes na ponta, deixando um rastro de partículas ao ser arremessada.",
    progression: [
      { level: 1, description: "Dano base." },
      { level: 2, description: "+20% de dano no retorno (recall)." },
      { level: 3, description: "Desbloqueia “explosão de fragmentos” se atingir 3 ou mais inimigos." },
      { level: 4, description: "+15% de chance de crítico, rastro de fragmentos mais duradouro." },
      { level: 5, description: "Versão Glitched com uma onda de fragmentos que segue o jogador e visual translúcido." }
    ],
    specialEffect: {
      rare: "Cor especial e partículas extras.",
      glitched: "Lança dupla ou lança que se divide ao ser arremessada."
    }
  },
  {
    name: "Martelo de Commit",
    aesthetics: "Martelo pesado com a palavra “Commit” gravada e faíscas de dados na cabeça.",
    progression: [
      { level: 1, description: "Dano corpo a corpo base." },
      { level: 2, description: "+25% de dano, martelo visivelmente maior." },
      { level: 3, description: "Desbloqueia um golpe carregado." },
      { level: 4, description: "Atordoamento (stun) extra se o inimigo estiver corrompido." },
      { level: 5, description: "Versão Glitched com impacto que cria um choque visual de “código quebrando”." }
    ],
    specialEffect: {
      rare: "Cabeça do martelo com contornos neon.",
      glitched: "Impacto com uma zona de dano extra."
    }
  },
  {
    name: "Projétil Glitch-Pulse",
    aesthetics: "Arma de médio alcance com cano curto. Projéteis deixam um rastro de glitch e uma zona de distorção no chão.",
    progression: [
      { level: 1, description: "Dano base." },
      { level: 2, description: "+20% de dano, rastro de partículas mais visível." },
      { level: 3, description: "Desbloqueia uma zona de “glitch” que reduz a velocidade dos inimigos por 2 segundos." },
      { level: 4, description: "Projétil extra ou alcance aumentado." },
      { level: 5, description: "Versão Glitched com zona de efeito maior e visual de ruptura do mundo." }
    ],
    specialEffect: {
      rare: "Projétil com cor distinta.",
      glitched: "Zona de distorção adicional ou efeito de confusão nos inimigos."
    }
  },
  {
    name: "Arco de Código Espiral",
    aesthetics: "Arco estilizado com uma corda feita de linhas de código e flechas que emitem “bits” ao serem disparadas.",
    progression: [
      { level: 1, description: "Dano base." },
      { level: 2, description: "+30% de dano." },
      { level: 3, description: "Flechas perfuram múltiplos inimigos ou ricocheteiam." },
      { level: 4, description: "Aumenta a chance de crítico ou a velocidade do projétil." },
      { level: 5, description: "Versão Glitched com flechas que se dividem em 2 ou 3 no impacto." }
    ],
    specialEffect: {
      rare: "Arco com decalques neon.",
      glitched: "Flechas “multiplicadas” ou com efeito de cadeia."
    }
  },
  {
    name: "Geração de Sub-Rotina",
    aesthetics: "Drone que orbita o jogador e dispara um laser fino. Bits saltam do drone quando ativado.",
    progression: [
      { level: 1, description: "Drone básico com laser de baixo dano." },
      { level: 2, description: "Aumenta o dano do laser ou a velocidade de disparo." },
      { level: 3, description: "Adiciona um segundo drone ou o laser dispara em cone." },
      { level: 4, description: "Aumenta o alcance ou adiciona efeito de atordoamento (stun)." },
      { level: 5, description: "Versão Glitched com drones que se dividem ou laser que perfura inimigos." }
    ],
    specialEffect: {
      rare: "Drones com cores especiais.",
      glitched: "Invoca um mini-bug ou dispara o laser em “salva”."
    }
  },
  {
    name: "Faca de Thread Estilhaçada",
    aesthetics: "Faca de corpo a corpo leve com uma lâmina de fios de “thread” visíveis. Cortes deixam um rastro fino de dados.",
    progression: [
      { level: 1, description: "Dano base rápido." },
      { level: 2, description: "Aumenta a velocidade de ataque ou o dano." },
      { level: 3, description: "Desbloqueia uma explosão de “thread” após 3 acertos rápidos." },
      { level: 4, description: "Aumenta a chance de crítico ou o alcance." },
      { level: 5, "description": "Versão Glitched com a faca atingindo em arco ou múltiplos alvos." }
    ],
    specialEffect: {
      rare: "Lâmina com brilho especial.",
      glitched: "Estilhaçamento extra ou efeito de “rebote”."
    }
  },
  {
    name: "Lança-Gravidade de Overflow",
    aesthetics: "Arma de gravidade robusta com uma esfera central que parece “inflada” com dados. O impacto causa distorção visual.",
    progression: [
      { level: 1, description: "Dano base e arrasta o alvo levemente." },
      { level: 2, description: "+30% de dano ou alcance aumentado." },
      { level: 3, description: "Desbloqueia a “onda de overflow” que arrasta inimigos para o ponto de impacto." },
      { level: 4, description: "Aumenta a velocidade da onda ou o número de inimigos afetados." },
      { level: 5, description: "Versão Glitched com uma zona de efeito maior e visual de “vórtice de código”." }
    ],
    specialEffect: {
      rare: "Efeito de gravidade visível.",
      glitched: "Zona massiva de controle de multidão e visual artístico de glitch."
    }
  },
  {
    name: "Espingarda de Backup",
    aesthetics: "Espingarda de cano curto com “backup” gravado na lateral. Um rastro de bits sai da boca da arma.",
    progression: [
      { level: 1, description: "Dano base de curto alcance." },
      { level: 2, description: "+25% de dano ou mais projéteis por disparo." },
      { level: 3, description: "Espalhamento maior ou tiro em grupo." },
      { level: 4, description: "Aumenta a chance de crítico ou a velocidade de recarga." },
      { level: 5, description: "Versão Glitched com rajadas extras e projéteis que ricocheteiam." }
    ],
    specialEffect: {
      rare: "Cano com cor especial.",
      glitched: "Efeito de “backup explosion” – o tiro cria uma mini-explosão de dados."
    }
  },
  {
    name: "Canhão de Subprocessos",
    aesthetics: "Canhão grande com um módulo lateral que lança “mini-bugs”. Tubos emitem bits.",
    progression: [
      { level: 1, description: "Dano base." },
      { level: 2, description: "+20% de dano ou maior taxa de envio de mini-bugs." },
      { level: 3, description: "Desbloqueia a invocação de “mini-bugs” que atacam inimigos por 3 segundos." },
      { level: 4, description: "Aumenta a vida ou o dano dos mini-bugs." },
      { level: 5, description: "Versão Glitched com uma “horda de mini-bugs” e efeito visual de glitch massivo." }
    ],
    specialEffect: {
      rare: "Módulo lateral com cor distinta.",
      glitched: "Maior número de mini-bugs e efeito extra como “explosão de bug”."
    }
  },
  {
    name: "Chicote de Código Mutante",
    aesthetics: "Chicote estilizado feito de linhas de código mutantes que se enrolam, com um ataque visual longo.",
    progression: [
      { level: 1, description: "Dano base." },
      { level: 2, description: "Aumenta o alcance ou o dano." },
      { level: 3, description: "Desbloqueia um ataque que atinge inimigos atrás ou ao lado." },
      { level: 4, description: "Aumenta a chance de crítico ou a velocidade do chicote." },
      { level: 5, description: "Versão Glitched com o chicote se dividindo em duas ou três pontas." }
    ],
    specialEffect: {
      rare: "Chicote com fios neon.",
      glitched: "Divisão em múltiplas pontas ou efeito de “rebote”."
    }
  },
  {
    name: "Lança-Explosão de Glitch",
    aesthetics: "Lança híbrida com ponta “explosiva” e visual de partículas instáveis. A zona de explosão é visível no impacto.",
    progression: [
      { level: 1, description: "Dano base." },
      { level: 2, description: "Aumenta o dano da explosão ou o alcance." },
      { level: 3, description: "Desbloqueia um efeito de distorção que inverte o movimento do inimigo por 1 segundo." },
      { level: 4, description: "Aumenta o raio da explosão ou a frequência." },
      { level: 5, description: "Versão Glitched com explosão maior e efeito visual de “mundo piscando”." }
    ],
    specialEffect: {
      rare: "Cor especial e partículas extras.",
      glitched: "Efeito de movimento invertido mais longo ou “zona de glitch expandida”."
    }
  }
];
