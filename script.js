/**
 * ==========================================================================
 * Consumo e Endividamento: Duas Faces de uma Mesma Moeda?
 * Pitch Acadêmico Interativo (História + Educação Financeira - 8º Ano)
 * 
 * script.js - Dimensionamento 16:9, Navegação Centralizada e
 *             Transição Coreografada da Moeda (Sequência de 3,0 segundos)
 * ==========================================================================
 */

(function () {
  'use strict';

  // --- CONFIGURAÇÃO CENTRALIZADA DE TEMPOS E ESTADO ---
  const CONFIG = {
    nominalWidth: 1440,
    nominalHeight: 810,
    totalSlides: 4,
    // Sequência de 1,9 segundos contínua (sem pausa estática em História):
    // 0-0.5s voo/crescimento | 0.5-1.05s giro e leitura da face "HISTÓRIA"
    // 1.05-1.9s revelação circular iris e desvanecimento suave
    transitionDurationMs: 1900,
    safetyTimeoutMs: 2050
  };

  let currentSlide = 1;
  let isTransitioning = false;
  let isReducedMotion = false;

  // --- ELEMENTOS DO DOM ---
  const stage = document.getElementById('presentation-stage');
  const slide1 = document.getElementById('slide-1');
  const slide2 = document.getElementById('slide-2');
  const slides = document.querySelectorAll('.slide');
  const coinGroup = document.getElementById('coin-interactive-group');
  const coinBtn = document.getElementById('coin-advance-btn');
  const coinShadow = document.getElementById('coin-shadow');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnMotion = document.getElementById('btn-motion');
  const motionLabel = document.getElementById('motion-label');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const counterCurrent = document.getElementById('counter-current');
  const counterTotal = document.getElementById('counter-total');

  /**
   * 1. AJUSTE DO PALCO 16:9 AO TAMANHO DA JANELA
   */
  function adjustStageScale() {
    if (!stage) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const scaleX = windowWidth / CONFIG.nominalWidth;
    const scaleY = windowHeight / CONFIG.nominalHeight;
    const scale = Math.min(scaleX, scaleY);

    stage.style.transform = `scale(${scale})`;
  }

  /**
   * 2. CONTROLE DO MODO DE MOVIMENTO (NORMAL vs REDUZIDO)
   */
  function setReducedMotion(reduced) {
    isReducedMotion = reduced;
    if (reduced) {
      document.body.classList.add('reduced-motion-active');
      if (motionLabel) motionLabel.textContent = '✦ Reduzida';
      if (btnMotion) btnMotion.title = 'Modo de movimento reduzido ativo. Clique para ativar animações normais.';
    } else {
      document.body.classList.remove('reduced-motion-active');
      if (motionLabel) motionLabel.textContent = '✦ Normal';
      if (btnMotion) btnMotion.title = 'Animação 3D da moeda ativa. Clique para modo de movimento reduzido.';
    }
  }

  function toggleMotionMode() {
    setReducedMotion(!isReducedMotion);
  }

  /**
   * 3. ATUALIZAÇÃO DA INTERFACE E CONTROLES ESTÁTICOS
   */
  function updateSlideView(targetIndex) {
    if (targetIndex < 1 || targetIndex > CONFIG.totalSlides) return;

    currentSlide = targetIndex;

    // Atualiza classe no body para exibição condicional da moeda na capa
    if (currentSlide === 1) {
      document.body.classList.add('on-slide-1');
      if (coverEffectsController) {
        coverEffectsController.playArrowsSequence();
      }
    } else {
      document.body.classList.remove('on-slide-1');
    }

    slides.forEach((slide, idx) => {
      const slideNum = idx + 1;
      slide.classList.remove('revealing');
      if (slideNum === currentSlide) {
        slide.classList.add('active');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.classList.remove('active');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    // Garante que o grupo da moeda volte ao repouso inicial
    if (coinGroup) {
      coinGroup.classList.remove('is-animating');
    }

    // Restaura estado dos cartões e conceitos do slide 2 e dispara sequência de entrada quando aplicável
    if (slide2CardsController) {
      slide2CardsController.deselectAll();
      slide2CardsController.resetConcepts();
      if (currentSlide === 2) {
        slide2CardsController.playEntrySequence();
      } else {
        slide2CardsController.stopEntrySequence();
      }
    }

    // Restaura estado do slide 3 e dispara sequência do percurso pedagógico (~2s) ao entrar
    if (slide3Controller) {
      slide3Controller.clearSelection();
      if (currentSlide === 3) {
        slide3Controller.playPathSequence();
      } else {
        slide3Controller.stopPathSequence();
      }
    }

    // Restaura estado do slide 4 e dispara sequência da linha vertical e barra amarela ao entrar
    if (slide4Controller) {
      slide4Controller.clearSelection();
      if (currentSlide === 4) {
        slide4Controller.playEntrySequence();
      } else {
        slide4Controller.stopEntrySequence();
        slide4Controller.resetAll();
      }
    }

    if (counterCurrent) counterCurrent.textContent = currentSlide;
    if (counterTotal) counterTotal.textContent = CONFIG.totalSlides;

    if (btnPrev) {
      btnPrev.disabled = currentSlide <= 1;
      btnPrev.setAttribute('aria-disabled', currentSlide <= 1 ? 'true' : 'false');
    }
    if (btnNext) {
      btnNext.disabled = currentSlide >= CONFIG.totalSlides;
      btnNext.setAttribute('aria-disabled', currentSlide >= CONFIG.totalSlides ? 'true' : 'false');
    }
  }

  /**
   * 4. TRANSIÇÃO COREOGRAFADA DA MOEDA (3,0 SEGUNDOS)
   * Voo (0-0.5s) -> Giro até Verso (0.5-1.2s) -> Pausa de Leitura em "HISTÓRIA" (1.2-2.2s)
   * -> Abertura Circular de Slide 2 (2.2-3.0s) -> Conclusão Baseada em Eventos
   */
  function transitionToSlide2() {
    if (isTransitioning) return;
    if (currentSlide !== 1) return;

    // Respeito ao modo de movimento reduzido
    if (isReducedMotion) {
      updateSlideView(2);
      return;
    }

    isTransitioning = true;

    // Bloqueia comandos repetidos durante a transição
    if (btnPrev) btnPrev.disabled = true;
    if (btnNext) btnNext.disabled = true;

    // Prepara a tela 2 com fundo opaco atrás da máscara circular
    if (slide2) {
      slide2.classList.add('revealing');
    }

    // Inicia a coreografia da moeda e de sua sombra separada
    if (coinGroup) {
      coinGroup.classList.add('is-animating');
    }

    let cleanedUp = false;
    let fallbackTimer = null;

    function finishTransition() {
      if (cleanedUp) return;
      cleanedUp = true;

      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }

      if (coinBtn) {
        coinBtn.removeEventListener('animationend', handleAnimationEnd);
      }

      // Conclui a estabilização da Tela 2
      if (slide2) {
        slide2.classList.remove('revealing');
        slide2.classList.add('active');
        slide2.setAttribute('aria-hidden', 'false');
      }

      if (slide1) {
        slide1.classList.remove('active');
        slide1.setAttribute('aria-hidden', 'true');
      }

      if (coinGroup) {
        coinGroup.classList.remove('is-animating');
      }

      currentSlide = 2;
      document.body.classList.remove('on-slide-1');

      if (slide2CardsController) {
        slide2CardsController.deselectAll();
        slide2CardsController.resetConcepts();
        slide2CardsController.playEntrySequence();
      }

      // Atualiza os controles
      if (counterCurrent) counterCurrent.textContent = currentSlide;
      if (btnPrev) {
        btnPrev.disabled = currentSlide <= 1;
        btnPrev.setAttribute('aria-disabled', currentSlide <= 1 ? 'true' : 'false');
      }
      if (btnNext) {
        btnNext.disabled = currentSlide >= CONFIG.totalSlides;
        btnNext.setAttribute('aria-disabled', currentSlide >= CONFIG.totalSlides ? 'true' : 'false');
      }

      isTransitioning = false;
    }

    function handleAnimationEnd(e) {
      // Finaliza quando a animação de voo da moeda é concluída (~1.9s)
      if (e.animationName === 'coinFlight2s' || e.animationName === 'coinFlight3s') {
        finishTransition();
      }
    }

    // Sincronização via evento nativo de conclusão da animação
    if (coinBtn) {
      coinBtn.addEventListener('animationend', handleAnimationEnd, { once: true });
    }

    // Temporizador de proteção adicional contra falhas
    fallbackTimer = setTimeout(finishTransition, CONFIG.safetyTimeoutMs);
  }

  /**
   * 5. NAVEGAÇÃO CENTRALIZADA
   */
  function nextSlide() {
    if (isTransitioning) return;

    if (currentSlide === 1) {
      transitionToSlide2();
    } else if (currentSlide < CONFIG.totalSlides) {
      updateSlideView(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (isTransitioning) return;

    if (currentSlide > 1) {
      updateSlideView(currentSlide - 1);
    }
  }

  function goToSlide(index) {
    if (isTransitioning) return;

    if (index === 2 && currentSlide === 1) {
      transitionToSlide2();
    } else if (index >= 1 && index <= CONFIG.totalSlides) {
      updateSlideView(index);
    }
  }

  /**
   * 6. ALTERNÂNCIA DE TELA CHEIA (FULLSCREEN)
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Tela cheia bloqueada ou não suportada:', err.message);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // --- REGISTRO DE EVENTOS (LISTENERS) ---

  window.addEventListener('resize', adjustStageScale, { passive: true });
  window.addEventListener('orientationchange', adjustStageScale, { passive: true });

  if (btnPrev) btnPrev.addEventListener('click', prevSlide);
  if (btnNext) btnNext.addEventListener('click', nextSlide);
  if (btnMotion) btnMotion.addEventListener('click', toggleMotionMode);
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);

  // Moeda na Capa
  if (coinBtn) {
    coinBtn.addEventListener('click', function (e) {
      e.preventDefault();
      transitionToSlide2();
    });

    coinBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        transitionToSlide2();
      }
    });
  }

  // Atalhos Globais de Teclado
  window.addEventListener('keydown', function (e) {
    if (isTransitioning) return;

    if (e.key === 'Escape') {
      if (slide2CardsController) {
        slide2CardsController.deselectAll();
      }
      if (slide3Controller) {
        slide3Controller.clearSelection();
      }
      return;
    }

    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case 'Enter':
      case ' ':
        if ((e.key === ' ' || e.key === 'Enter') && document.activeElement) {
          const el = document.activeElement;
          if (
            el.tagName === 'BUTTON' ||
            el.classList.contains('column-card') ||
            el.closest('.column-card') ||
            el.classList.contains('concept-col') ||
            el.closest('.concept-col') ||
            el.classList.contains('method-card') ||
            el.closest('.method-card') ||
            el.classList.contains('path-pill') ||
            el.closest('.path-pill')
          ) {
            return;
          }
        }
        e.preventDefault();
        nextSlide();
        break;

      case 'ArrowLeft':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault();
        prevSlide();
        break;

      case 'Home':
        e.preventDefault();
        goToSlide(1);
        break;

      case 'End':
        e.preventDefault();
        goToSlide(CONFIG.totalSlides);
        break;
    }
  });

  /**
   * 6. CONTROLE INTERATIVO DOS CARTÕES DO SLIDE 2
   * - Inclinação 3D ao passar o mouse (limite de 4 graus, scale 1.02, sombra suave)
   * - Retorno suave ao sair do mouse
   * - Seleção com destaque ao clicar (frente plana, scale 1.06, os outros recuam para 98%)
   * - Acessibilidade completa por toque (mobile) e teclado (Enter / Espaço / Esc)
   */
  let slide2CardsController = null;

  function initSlide2Cards() {
    const cardsGrid = document.querySelector('#slide-2 .columns-grid');
    const cards = document.querySelectorAll('#slide-2 .column-card');
    const conceptBlocks = document.querySelectorAll('#slide-2 .concept-col');
    if (!cardsGrid || !cards.length) return null;

    let selectedCard = null;
    let sequenceTimer = null;

    function setConceptExpanded(block, expanded) {
      if (!block) return;
      block.classList.toggle('is-expanded', expanded);
      block.setAttribute('aria-pressed', expanded ? 'true' : 'false');
      const initialEl = block.querySelector('.concept-def-initial');
      const altEl = block.querySelector('.concept-def-alt');
      if (initialEl) initialEl.setAttribute('aria-hidden', expanded ? 'true' : 'false');
      if (altEl) altEl.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    }

    function toggleConcept(block) {
      if (!block) return;
      const nextState = !block.classList.contains('is-expanded');
      setConceptExpanded(block, nextState);
    }

    function resetConcepts() {
      conceptBlocks.forEach(function (block) {
        setConceptExpanded(block, false);
        block.classList.remove('is-hovering');
      });
    }

    conceptBlocks.forEach(function (block) {
      block.addEventListener('mouseenter', function () {
        block.classList.add('is-hovering');
      });

      block.addEventListener('mouseleave', function () {
        block.classList.remove('is-hovering');
      });

      block.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleConcept(block);
      });

      block.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          toggleConcept(block);
        }
      });
    });

    function stopEntrySequence() {
      if (sequenceTimer) {
        clearTimeout(sequenceTimer);
        sequenceTimer = null;
      }
      cardsGrid.classList.remove('is-playing-sequence');
      if (slide2) {
        slide2.classList.remove('is-animating-underline');
      }
    }

    function playEntrySequence() {
      if (isReducedMotion || document.body.classList.contains('reduced-motion-active')) {
        stopEntrySequence();
        return;
      }

      if (sequenceTimer) {
        clearTimeout(sequenceTimer);
        sequenceTimer = null;
      }

      cardsGrid.classList.remove('is-playing-sequence');
      if (slide2) {
        slide2.classList.remove('is-animating-underline');
      }
      // Força reflow para reiniciar a sequência limpa a cada entrada no Slide 2
      void cardsGrid.offsetWidth;
      cardsGrid.classList.add('is-playing-sequence');
      if (slide2) {
        slide2.classList.add('is-animating-underline');
      }

      sequenceTimer = setTimeout(function () {
        cardsGrid.classList.remove('is-playing-sequence');
        if (slide2) {
          slide2.classList.remove('is-animating-underline');
        }
        sequenceTimer = null;
      }, 2950);
    }

    function deselectAll() {
      if (!selectedCard) return;
      selectedCard.classList.remove('is-selected');
      selectedCard.setAttribute('aria-pressed', 'false');
      selectedCard.style.transform = '';
      selectedCard = null;
      cardsGrid.classList.remove('has-selected');
    }

    function selectCard(card) {
      if (selectedCard === card) {
        deselectAll();
        return;
      }

      if (selectedCard) {
        selectedCard.classList.remove('is-selected');
        selectedCard.setAttribute('aria-pressed', 'false');
        selectedCard.style.transform = '';
      }

      selectedCard = card;
      card.classList.add('is-selected');
      card.setAttribute('aria-pressed', 'true');
      cardsGrid.classList.add('has-selected');

      // Limpa qualquer inclinação temporária para mantê-lo estritamente de frente
      card.style.transform = '';
    }

    cards.forEach(card => {
      card.addEventListener('mouseenter', function () {
        card.classList.add('is-hovering');
      });

      // Efeito de inclinação 3D suave com limite de 4 graus
      card.addEventListener('mousemove', function (e) {
        card.classList.add('is-hovering');
        if (card.classList.contains('is-selected')) return;
        if (isReducedMotion || document.body.classList.contains('reduced-motion-active')) return;

        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const normX = Math.max(-1, Math.min(1, (x - centerX) / centerX));
        const normY = Math.max(-1, Math.min(1, (y - centerY) / centerY));

        // Limite de aproximadamente 4 graus
        const tiltX = (-normY * 4).toFixed(2);
        const tiltY = (normX * 4).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-hovering');
        if (!card.classList.contains('is-selected')) {
          card.style.transform = '';
        }
      });

      // Seleção ao clicar (não avança slide)
      card.addEventListener('click', function (e) {
        e.stopPropagation();
        selectCard(card);
      });

      // Seleção por teclado (Enter ou Espaço)
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          selectCard(card);
        }
      });
    });

    // Clicar fora dos cartões restaura todos
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.column-card')) {
        deselectAll();
      }
    });

    return {
      selectCard,
      deselectAll,
      resetConcepts,
      playEntrySequence,
      stopEntrySequence
    };
  }

  /**
   * 7. REAÇÕES INTERATIVAS NOS RECORTES DA CAPA (SLIDE 1)
   * - Elevação suave (4 a 6px), scale 1.025 e sombra reforçada
   * - Fumaça subindo das chaminés da Fábrica (800ms)
   * - Gráfico da Crise de 1929 sendo desenhado da esquerda para a direita (900ms)
   * - Botão "COMPRAR" do celular acendendo em pulso amarelo suave (600ms)
   * - Sequência de desenho das setas ao entrar na capa (~1s)
   * - Execução única por entrada, sem loops, com proteção contra saída/reentrada rápida
   */
  let coverEffectsController = null;

  function initCoverEffects() {
    const slide1El = document.getElementById('slide-1');
    if (!slide1El) return null;

    const flowRow = slide1El.querySelector('.cards-flow-row');
    const cardKraft = slide1El.querySelector('.card-kraft');
    const cardWhite = slide1El.querySelector('.card-white');
    const cardMint = slide1El.querySelector('.card-mint');

    let arrowsTimer = null;
    let smokeTimer = null;
    let chartTimer = null;
    let buyTimer = null;

    // --- MARCA-TEXTO EM "ENDIVIDAMENTO" ---
    // A palavra inicia visível com a faixa recolhida. No primeiro pointerenter,
    // desenha da esquerda para a direita em ~600ms e preserva o estado durante toda a sessão.
    const endividamentoWrapper = slide1El.querySelector('.highlight-wrapper');
    const highlightInk = slide1El.querySelector('.highlight-ink');
    let isEndividamentoHighlighted = false;

    function triggerEndividamentoHighlight() {
      if (isEndividamentoHighlighted) return;
      isEndividamentoHighlighted = true;

      if (endividamentoWrapper) {
        endividamentoWrapper.classList.add('is-highlighted');
      }
      if (highlightInk) {
        highlightInk.classList.add('is-highlighted');
      }
    }

    if (endividamentoWrapper) {
      endividamentoWrapper.addEventListener('pointerenter', function (e) {
        triggerEndividamentoHighlight();
      });
    }

    // Sequência das setas de conexão ao entrar na capa (~1 segundo total)
    function playArrowsSequence() {
      if (!flowRow) return;
      if (isReducedMotion) {
        flowRow.classList.remove('animating-arrows');
        return;
      }

      // Reinicia animação das setas limpando timers anteriores
      if (arrowsTimer) {
        clearTimeout(arrowsTimer);
        arrowsTimer = null;
      }

      flowRow.classList.remove('animating-arrows');
      // Força reflow para reiniciar keyframe CSS
      void flowRow.offsetWidth;
      flowRow.classList.add('animating-arrows');

      // Mantém as setas visíveis e completas após a sequência de ~1s
      arrowsTimer = setTimeout(() => {
        flowRow.classList.remove('animating-arrows');
        arrowsTimer = null;
      }, 1050);
    }

    // 1. Recorte 1: Fábrica / Fumaça nas Chaminés (800ms)
    if (cardKraft) {
      cardKraft.addEventListener('mouseenter', () => {
        cardKraft.classList.add('is-hovering');
        if (isReducedMotion) return;

        // Se já estiver animando, não reinicia bruscamente
        if (cardKraft.classList.contains('animating-smoke')) return;

        cardKraft.classList.add('animating-smoke');
        if (smokeTimer) clearTimeout(smokeTimer);
        smokeTimer = setTimeout(() => {
          cardKraft.classList.remove('animating-smoke');
          smokeTimer = null;
        }, 820);
      });

      cardKraft.addEventListener('mouseleave', () => {
        cardKraft.classList.remove('is-hovering');
      });
    }

    // 2. Recorte 2: Crise de 1929 / Traçado do Gráfico (900ms)
    if (cardWhite) {
      cardWhite.addEventListener('mouseenter', () => {
        cardWhite.classList.add('is-hovering');
        if (isReducedMotion) return;

        // Se já estiver animando, não reinicia bruscamente
        if (cardWhite.classList.contains('animating-chart')) return;

        cardWhite.classList.add('animating-chart');
        if (chartTimer) clearTimeout(chartTimer);
        chartTimer = setTimeout(() => {
          cardWhite.classList.remove('animating-chart');
          chartTimer = null;
        }, 920);
      });

      cardWhite.addEventListener('mouseleave', () => {
        cardWhite.classList.remove('is-hovering');
      });
    }

    // 3. Recorte 3: Consumo Digital / Botão COMPRAR Acendendo (600ms)
    if (cardMint) {
      cardMint.addEventListener('mouseenter', () => {
        cardMint.classList.add('is-hovering');
        if (isReducedMotion) return;

        // Se já estiver animando, não reinicia bruscamente
        if (cardMint.classList.contains('animating-buy')) return;

        cardMint.classList.add('animating-buy');
        if (buyTimer) clearTimeout(buyTimer);
        buyTimer = setTimeout(() => {
          cardMint.classList.remove('animating-buy');
          buyTimer = null;
        }, 620);
      });

      cardMint.addEventListener('mouseleave', () => {
        cardMint.classList.remove('is-hovering');
      });
    }

    return {
      playArrowsSequence,
      triggerEndividamentoHighlight,
      isEndividamentoHighlighted: () => isEndividamentoHighlighted
    };
  }

  /**
   * 8. CONTROLE INTERATIVO DO SLIDE 3 (METODOLOGIA E PERCURSO PEDAGÓGICO)
   * - Sequência de entrada (~2,0s) desenhando os conectores da esquerda para a direita
   *   e aplicando um destaque breve em cada etapa: Investigar -> Contextualizar -> Vivenciar -> Refletir
   * - Conexão interativa entre as 4 etapas e os 3 cards:
   *   Investigar (1) -> Compreender (1)
   *   Contextualizar (2) -> Compreender (1)
   *   Vivenciar (3) -> Participar (2)
   *   Refletir (4) -> Refletir (3)
   * - Inclinação suave de papel ao passar o mouse (~4 graus, scale 1.02) e crescimento de ~4% ao selecionar
   * - Microanimações nos 3 ícones (fumaça da fábrica, rotação dos dados, busca da lupa + interrogação)
   */
  let slide3Controller = null;

  function initSlide3Controller() {
    const slide3El = document.getElementById('slide-3');
    if (!slide3El) return null;

    const cardsGrid = slide3El.querySelector('.method-cards-grid');
    const cards = slide3El.querySelectorAll('.method-card');
    const pathWrapper = slide3El.querySelector('.path-sequence-wrapper');
    const pills = slide3El.querySelectorAll('.path-pill');
    if (!cardsGrid || !cards.length || !pathWrapper || !pills.length) return null;

    let selectedStepNum = null;
    let selectedCardNum = null;
    let pathSequenceTimer = null;
    const iconTimers = new WeakMap();

    function stopPathSequence() {
      if (pathSequenceTimer) {
        clearTimeout(pathSequenceTimer);
        pathSequenceTimer = null;
      }
      pathWrapper.classList.remove('is-playing-path');
    }

    function playPathSequence() {
      if (isReducedMotion || document.body.classList.contains('reduced-motion-active')) {
        stopPathSequence();
        return;
      }

      stopPathSequence();
      void pathWrapper.offsetWidth;
      pathWrapper.classList.add('is-playing-path');

      pathSequenceTimer = setTimeout(function () {
        pathWrapper.classList.remove('is-playing-path');
        pathSequenceTimer = null;
      }, 2050);
    }

    function triggerIconAnimation(card) {
      if (!card) return;
      if (isReducedMotion || document.body.classList.contains('reduced-motion-active')) return;
      if (card.classList.contains('animating-icon')) return;

      card.classList.add('animating-icon');
      const prevTimer = iconTimers.get(card);
      if (prevTimer) clearTimeout(prevTimer);

      const timer = setTimeout(function () {
        card.classList.remove('animating-icon');
        iconTimers.delete(card);
      }, 840);
      iconTimers.set(card, timer);
    }

    function applySelectionState(stepNum, cardNum) {
      selectedStepNum = stepNum;
      selectedCardNum = cardNum;

      pills.forEach(function (pill) {
        const sNum = parseInt(pill.getAttribute('data-step'), 10);
        const isSel = stepNum !== null && sNum === stepNum;
        pill.classList.toggle('is-selected', isSel);
        pill.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      });

      cards.forEach(function (card) {
        const cNum = parseInt(card.getAttribute('data-card'), 10);
        const isSel = cardNum !== null && cNum === cardNum;
        card.classList.toggle('is-selected', isSel);
        card.setAttribute('aria-pressed', isSel ? 'true' : 'false');
        if (isSel) {
          card.style.transform = '';
        }
      });

      cardsGrid.classList.toggle('has-selected', cardNum !== null);
    }

    function clearSelection() {
      applySelectionState(null, null);
    }

    function selectStep(pill) {
      if (!pill) return;
      // Se houver interação durante a sequência de entrada, finaliza imediatamente deixando conexões completas
      stopPathSequence();

      const stepNum = parseInt(pill.getAttribute('data-step'), 10);
      const targetCardNum = parseInt(pill.getAttribute('data-target-card'), 10);

      if (selectedStepNum === stepNum) {
        clearSelection();
        return;
      }

      applySelectionState(stepNum, targetCardNum);

      const targetCard = slide3El.querySelector(`.method-card[data-card="${targetCardNum}"]`);
      if (targetCard) {
        triggerIconAnimation(targetCard);
      }
    }

    function selectCardDirect(card) {
      if (!card) return;
      stopPathSequence();

      const cardNum = parseInt(card.getAttribute('data-card'), 10);
      if (selectedCardNum === cardNum) {
        clearSelection();
        return;
      }

      // Mapeia o card para sua etapa primária correspondente (1->1, 2->3, 3->4)
      const defaultStepMap = { 1: 1, 2: 3, 3: 4 };
      const stepNum = defaultStepMap[cardNum] || null;
      applySelectionState(stepNum, cardNum);
      triggerIconAnimation(card);
    }

    pills.forEach(function (pill) {
      pill.addEventListener('click', function (e) {
        e.stopPropagation();
        selectStep(pill);
      });

      pill.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          selectStep(pill);
        }
      });
    });

    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.classList.add('is-hovering');
        triggerIconAnimation(card);
      });

      card.addEventListener('mousemove', function (e) {
        card.classList.add('is-hovering');
        if (card.classList.contains('is-selected')) return;
        if (isReducedMotion || document.body.classList.contains('reduced-motion-active')) return;

        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const normX = Math.max(-1, Math.min(1, (x - centerX) / centerX));
        const normY = Math.max(-1, Math.min(1, (y - centerY) / centerY));

        const tiltX = (-normY * 4).toFixed(2);
        const tiltY = (normX * 4).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-hovering');
        if (!card.classList.contains('is-selected')) {
          card.style.transform = '';
        }
      });

      card.addEventListener('click', function (e) {
        e.stopPropagation();
        selectCardDirect(card);
      });

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          selectCardDirect(card);
        }
      });
    });

    // Clicar fora das etapas e dos cards no Slide 3 limpa a seleção
    document.addEventListener('click', function (e) {
      if (currentSlide !== 3) return;
      if (!e.target.closest('#slide-3 .path-pill') && !e.target.closest('#slide-3 .method-card')) {
        clearSelection();
      }
    });

    return {
      playPathSequence,
      stopPathSequence,
      clearSelection,
      selectStep,
      selectCardDirect
    };
  }

  /**
   * 9. CONTROLE INTERATIVO DO SLIDE 4 (DA PROPOSTA À SALA DE AULA)
   * - Animação de entrada: desenho da linha vertical contínua de cima para baixo (~850ms)
   *   seguido pela animação da barrinha amarela de cima para baixo (~1050ms)
   * - Seleção de etapas (Preparar, Vivenciar, Avaliar) por clique, toque e teclado (Enter/Espaço)
   * - Efeito da Trilha: ao selecionar Vivenciar, a moeda diminui até peça de jogo e percorre
   *   as casas de 1 a 6 (~2s), com números 100% legíveis e pulsos em cada casa.
   *   Na chegada à estrela (6 ★), a carta IMPREVISTO desliza para fora do monte.
   *   Ao desmarcar ou trocar de etapa, encerra a animação e devolve tudo ao repouso.
   * - Carta IMPREVISTO clicável: camada de movimento própria para abrir prévia de estudo ampliada.
   *   Segundo clique ou Escape fecha a prévia e devolve a carta ao monte.
   * - Faixa da Extensão: clique na faixa verde aciona sublinhado amarelo tipo marca-texto
   *   sob "ao contexto dos estudantes", com desenho da esquerda para a direita.
   */
  let slide4Controller = null;

  function initSlide4Controller() {
    const slide4El = document.getElementById('slide-4');
    if (!slide4El) return null;

    const appGrid = slide4El.querySelector('.application-grid');
    const stepItems = slide4El.querySelectorAll('.apply-step-item');
    const kitCardTrigger = slide4El.querySelector('#kit-card-trigger');
    const cardPreviewOverlay = slide4El.querySelector('#card-preview-overlay');
    const cardPreviewClose = slide4El.querySelector('#card-preview-close');
    const cardPreviewSheet = slide4El.querySelector('.card-preview-sheet');
    const cardPreviewBackdrop = slide4El.querySelector('.card-preview-backdrop');
    const extensionBanner = slide4El.querySelector('#extension-banner');

    if (!appGrid || !stepItems.length) return null;

    let selectedStep = null;
    let sequenceTimer = null;
    let trailTimer = null;
    let isCardPreviewOpen = false;

    function stopEntrySequence() {
      if (sequenceTimer) {
        clearTimeout(sequenceTimer);
        sequenceTimer = null;
      }
      slide4El.classList.remove('is-playing-sequence');
    }

    function playEntrySequence() {
      if (isReducedMotion || document.body.classList.contains('reduced-motion-active')) {
        stopEntrySequence();
        return;
      }

      stopEntrySequence();
      void slide4El.offsetWidth;
      slide4El.classList.add('is-playing-sequence');

      sequenceTimer = setTimeout(function () {
        slide4El.classList.remove('is-playing-sequence');
        sequenceTimer = null;
      }, 1600);
    }

    function stopTrailSequence() {
      if (trailTimer) {
        clearTimeout(trailTimer);
        trailTimer = null;
      }
      slide4El.classList.remove('is-animating-trail');
    }

    function startTrailSequence() {
      stopTrailSequence();
      if (isReducedMotion || document.body.classList.contains('reduced-motion-active')) {
        return;
      }

      void slide4El.offsetWidth;
      slide4El.classList.add('is-animating-trail');

      trailTimer = setTimeout(function () {
        slide4El.classList.remove('is-animating-trail');
        trailTimer = null;
      }, 2050);
    }

    function applySelectionState(stepNum) {
      selectedStep = stepNum;

      stepItems.forEach(function (item) {
        const sNum = parseInt(item.getAttribute('data-step'), 10);
        const isSel = stepNum !== null && sNum === stepNum;
        item.classList.toggle('is-selected', isSel);
        item.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      });

      const isVivenciar = stepNum === 2;
      appGrid.classList.toggle('is-vivenciar-active', isVivenciar);

      if (isVivenciar) {
        startTrailSequence();
      } else {
        // Encerra imediatamente a sequência da Trilha e devolve as peças à posição inicial
        stopTrailSequence();
      }
    }

    function clearSelection() {
      applySelectionState(null);
    }

    function toggleStep(stepNum) {
      if (selectedStep === stepNum) {
        clearSelection();
      } else {
        applySelectionState(stepNum);
      }
    }

    // --- INTERAÇÃO DA CARTA IMPREVISTO (CAMADA DE MOVIMENTO PRÓPRIA) ---
    function openCardPreview() {
      if (!cardPreviewOverlay || isCardPreviewOpen) return;
      isCardPreviewOpen = true;
      cardPreviewOverlay.classList.add('is-open');
      cardPreviewOverlay.setAttribute('aria-hidden', 'false');
      if (kitCardTrigger) {
        kitCardTrigger.setAttribute('aria-expanded', 'true');
      }
      if (cardPreviewClose) {
        cardPreviewClose.focus();
      }
    }

    function closeCardPreview() {
      if (!cardPreviewOverlay || !isCardPreviewOpen) return;
      isCardPreviewOpen = false;
      cardPreviewOverlay.classList.remove('is-open');
      cardPreviewOverlay.setAttribute('aria-hidden', 'true');
      if (kitCardTrigger) {
        kitCardTrigger.setAttribute('aria-expanded', 'false');
        kitCardTrigger.focus();
      }
    }

    function toggleCardPreview() {
      if (isCardPreviewOpen) {
        closeCardPreview();
      } else {
        openCardPreview();
      }
    }

    if (kitCardTrigger) {
      if (typeof kitCardTrigger.click !== 'function') {
        kitCardTrigger.click = function () {
          this.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        };
      }

      kitCardTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleCardPreview();
      });

      kitCardTrigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          toggleCardPreview();
        }
      });
    }

    if (cardPreviewClose) {
      cardPreviewClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closeCardPreview();
      });
    }

    if (cardPreviewBackdrop) {
      cardPreviewBackdrop.addEventListener('click', function (e) {
        e.stopPropagation();
        closeCardPreview();
      });
    }

    // Um segundo clique na própria folha da carta aberta também a fecha e a devolve ao monte
    if (cardPreviewSheet) {
      cardPreviewSheet.addEventListener('click', function (e) {
        // Se o clique não foi no botão de fechar (já tratado), fecha a carta
        if (!e.target.closest('#card-preview-close')) {
          e.stopPropagation();
          closeCardPreview();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (currentSlide === 4 && isCardPreviewOpen && e.key === 'Escape') {
        e.stopPropagation();
        closeCardPreview();
      }
    });

    // --- INTERAÇÃO DO BANNER DA EXTENSÃO (SUBLINHADO TIPO MARCA-TEXTO) ---
    function toggleExtensionHighlight() {
      if (!extensionBanner) return;
      const isHighlighted = extensionBanner.classList.toggle('is-highlighted');
      extensionBanner.setAttribute('aria-pressed', isHighlighted ? 'true' : 'false');
    }

    if (extensionBanner) {
      extensionBanner.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleExtensionHighlight();
      });

      extensionBanner.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          toggleExtensionHighlight();
        }
      });
    }

    // --- ETAPAS DE APLICAÇÃO ---
    stepItems.forEach(function (item) {
      const stepNum = parseInt(item.getAttribute('data-step'), 10);

      item.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleStep(stepNum);
      });

      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          toggleStep(stepNum);
        }
      });
    });

    // Clicar fora das etapas no Slide 4 encerra a seleção (respeitando cliques no banner e na carta)
    document.addEventListener('click', function (e) {
      if (currentSlide !== 4) return;
      if (isCardPreviewOpen) return;
      if (
        !e.target.closest('#slide-4 .apply-step-item') &&
        !e.target.closest('#slide-4 #extension-banner') &&
        !e.target.closest('#slide-4 #kit-card-trigger')
      ) {
        clearSelection();
      }
    });

    function resetAll() {
      clearSelection();
      stopTrailSequence();
      stopEntrySequence();
      closeCardPreview();
      if (extensionBanner) {
        extensionBanner.classList.remove('is-highlighted');
        extensionBanner.setAttribute('aria-pressed', 'false');
      }
    }

    return {
      playEntrySequence,
      stopEntrySequence,
      clearSelection,
      toggleStep,
      openCardPreview,
      closeCardPreview,
      resetAll
    };
  }

  // --- INICIALIZAÇÃO INICIAL ---
  let isInitialized = false;

  function init() {
    if (isInitialized) return;
    isInitialized = true;

    adjustStageScale();

    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const motionParam = params.get('motion');

    if (motionParam === 'reduced') {
      setReducedMotion(true);
    } else {
      setReducedMotion(false);
    }

    let initialSlide = 1;
    const slideQuery = parseInt(params.get('slide'), 10);
    if (!isNaN(slideQuery) && slideQuery >= 1 && slideQuery <= CONFIG.totalSlides) {
      initialSlide = slideQuery;
    } else if (hash.startsWith('#slide-')) {
      const hashNum = parseInt(hash.replace('#slide-', ''), 10);
      if (!isNaN(hashNum) && hashNum >= 1 && hashNum <= CONFIG.totalSlides) {
        initialSlide = hashNum;
      }
    }

    coverEffectsController = initCoverEffects();
    slide2CardsController = initSlide2Cards();
    slide3Controller = initSlide3Controller();
    slide4Controller = initSlide4Controller();
    updateSlideView(initialSlide);

    // Auto-ocultação da barra de navegação por inatividade (preserva navegação por teclado)
    const navToolbar = document.querySelector('.nav-toolbar');
    let idleTimeout = null;

    function resetIdleTimer() {
      if (!navToolbar) return;
      navToolbar.classList.remove('idle-hidden');
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        navToolbar.classList.add('idle-hidden');
      }, 2600);
    }

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('pointerdown', resetIdleTimer);
    if (navToolbar) {
      navToolbar.addEventListener('mouseenter', () => {
        clearTimeout(idleTimeout);
        navToolbar.classList.remove('idle-hidden');
      });
      navToolbar.addEventListener('mouseleave', resetIdleTimer);
      navToolbar.addEventListener('focusin', () => {
        clearTimeout(idleTimeout);
        navToolbar.classList.remove('idle-hidden');
      });
      navToolbar.addEventListener('focusout', resetIdleTimer);
    }
    resetIdleTimer();
  }

  document.addEventListener('DOMContentLoaded', init);
  init();

})();
