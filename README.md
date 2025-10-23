## GLITCHFALL (versão modular)

Jogo em HTML5 Canvas com Matter.js, agora organizado em módulos ES6. Este README documenta a arquitetura atual, como rodar, controles e pontos de extensão.

## Como executar
- Método recomendado: servir via HTTP local (necessário para imports ES modules).
  - Sugestões: VS Code Live Server, ou qualquer servidor simples (ex.: `python -m http.server`).
- Abra `index.html` no navegador (Chrome/Edge/Firefox) via servidor local.
- Tela inicial: clique para começar.

### Controles
- Andar: A/D ou Setas
- Pular: W / Seta Cima / Espaço (wall-jump)
- Dash: Left Shift (com recarga e cargas)
- Atirar: Clique esquerdo (na direção do mouse)
- Golpe (slash): Tecla E
- Reiniciar: R (na tela de Game Over)

## Stack
- Matter.js 0.19.0 (CDN)
- HTML5 Canvas (camadas: fundo e principal)
- JavaScript ES Modules (sem build/bundler)

## Estrutura de pastas
```
index.html
css/
  style.css
js/
  config.js
  utils.js
  main.js
  core/
    camera.js
    input.js
  entities/
    effects.js
    enemy.js
    player.js
    projectile.js
    shard.js
  ui/
    hud.js
    screens.js
  world/
    generation.js
    physics.js
    unstable.js
```

## Principais módulos
- `js/main.js`: orquestração (loop, atualização, render, colisões simples, fluxo de fases/upgrade).
- `js/world/physics.js`: engine/world do Matter e sensores do player.
- `js/world/generation.js`: geração de plataformas e portal roxo por fase.
- `js/world/unstable.js`: blocos instáveis (frágil/volátil/quinético), explosão/pulso e render customizado.
- `js/entities/player.js`: movimento, pulo/parede, dash, dano, slash e render.
- `js/entities/projectile.js`: projéteis cinemáticos (jogador/inimigo) e render.
- `js/entities/enemy.js`: inimigo “sentry” com IA simples (wander/chase/attack) e tiro.
- `js/entities/shard.js`: shards colecionáveis com atração e coleta.
- `js/entities/effects.js`: partículas e hit-stop.
- `js/core/camera.js`: câmera com follow/zoom e fundo.
- `js/core/input.js`: teclado/mouse robusto (reset em blur, bloqueio do menu de contexto, foco no canvas).
- `js/ui/hud.js` e `js/ui/screens.js`: HUD, telas de início/upgrade/game over.

## Mecânicas
- Portal e fases: ao entrar no portal, abre tela de upgrade, avança fase e regenera o mundo.
- Tiro: clique esquerdo mira no cursor (projéteis do jogador); inimigos também disparam.
- Slash (E): arco rápido com cooldown, dano em área curta.
- Blocos instáveis: 
  - Frágil cai quando ativado;
  - Volátil acende um fusível e explode (empurra e pode causar dano no player);
  - Quinético emite um pulso de força imediato.
- Shards: dropam de inimigos, são atraídos ao player e rendem pontos.

## Dicas de desenvolvimento
- A maior parte dos elementos não-físicos (inimigos/projéteis/shards) usa colisão manual simples (distância/AABB) para custo baixo.
- O canvas de fundo é separado para reduzir overdraw; o grid é redesenhado apenas em resize.
- Funções públicas têm cabeçalhos JSDoc nos principais módulos para facilitar navegação.

## Solução de problemas
- Módulos não carregam ao abrir o arquivo direto: sirva via HTTP (Live Server, etc.).
- Mouse/teclas “presos” após alt-tab: o input reseta no `blur/visibilitychange`.
- Travou ao explodir bloco volátil: já corrigido; garantimos `hitStop(engine, ...)` usando o engine ativo.

## Licença
Defina uma licença conforme necessidade (ex.: MIT para game jam).
