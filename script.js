/**
 * =====================================================================
 * Othello Game - Refactored Version
 * =====================================================================
 * 제작: Gemini (Google AI)
 * 리팩토링: Gemini (Google AI)
 * 최종 수정일: 2025년 8월 8일
 *
 * 주요 변경 사항:
 * - OthelloGame 클래스를 도입하여 게임 로직과 상태를 캡슐화.
 * - 전역 변수 및 함수 사용을 최소화하여 코드의 명확성과 안정성 향상.
 * - 각 메서드의 역할을 명확히 분리하여 유지보수 및 확장성 개선.
 * =====================================================================
 */

class OthelloGame {
    // --- [SECTION 1] 초기화 및 생성자 ---

    constructor() {
        this.elements = this._cacheDOMElements();
        this.config = {
            playerColor: 'black',
            weights: [
                [120, -20, 20,  5,  5, 20, -20, 120],
                [-20, -40, -5, -5, -5, -5, -40, -20],
                [ 20,  -5, 15,  3,  3, 15,  -5,  20],
                [  5,  -5,  3,  3,  3,  3,  -5,   5],
                [  5,  -5,  3,  3,  3,  3,  -5,   5],
                [ 20,  -5, 15,  3,  3, 15,  -5,  20],
                [-20, -40, -5, -5, -5, -5, -40, -20],
                [120, -20, 20,  5,  5, 20, -20, 120],
            ],
            ai: {
                easy:   { depth: 1, delay: 1000 },
                normal: { depth: 2, delay: 1500 },
                hard:   { depth: 3, delay: 2000 },
            }
        };
        this.state = {};
        this.winRateChart = null;

        this._initializeState();
        this._initializeEventListeners();
    }

    /**
     * 필요한 모든 DOM 요소를 찾아 캐싱합니다.
     * @returns {object} DOM 요소 맵
     */
    _cacheDOMElements() {
        return {
            gameModeSelection: document.getElementById('game-mode-selection'),
            difficultySelection: document.getElementById('difficulty-selection'),
            mainContent: document.querySelector('.main-content'),
            board: document.getElementById('board'),
            // 점수판 및 턴 표시 요소
            blackPlayerInfo: document.getElementById('black-player-info'),
            whitePlayerInfo: document.getElementById('white-player-info'),
            blackScore: document.getElementById('black-score'),
            whiteScore: document.getElementById('white-score'),
            turnIndicator: document.getElementById('turn-indicator'),
            messageContainer: document.getElementById('message-container'),
            winRateContainer: document.getElementById('win-rate-container'),
            blackWinRateBar: document.getElementById('black-win-rate-bar'),
            whiteWinRateBar: document.getElementById('white-win-rate-bar'),
            blackWinRateText: document.getElementById('black-win-rate-text'),
            whiteWinRateText: document.getElementById('white-win-rate-text'),
            aiCommentaryContainer: document.getElementById('ai-commentary-container'),
            aiCommentaryText: document.getElementById('ai-commentary-text'),
            graphModal: document.getElementById('graph-modal'),
            closeModalButton: document.getElementById('close-modal-button'),
            winRateChartCanvas: document.getElementById('win-rate-chart'),
            settingsButton: document.getElementById('settings-button'),
            settingsModal: document.getElementById('settings-modal'),
            closeSettingsButton: document.getElementById('close-settings-button'),
            toggleWinRate: document.getElementById('toggle-win-rate'),
            toggleAiCommentary: document.getElementById('toggle-ai-commentary'),
            toggleHints: document.getElementById('toggle-hints'),
            // 게임 종료 모달 요소
            gameOverModal: document.getElementById('game-over-modal'),
            gameOverMessage: document.getElementById('game-over-message'),
            finalBlackScore: document.getElementById('final-black-score'),
            finalWhiteScore: document.getElementById('final-white-score'),
            restartButtonModal: document.getElementById('restart-button-modal'),
            reviewButtonModal: document.getElementById('review-button-modal'),
            mainMenuButtonModal: document.getElementById('main-menu-button-modal'),
            // 기권 관련 요소
            resignButton: document.getElementById('resign-button'),
            resignConfirmModal: document.getElementById('resign-confirm-modal'),
            resignConfirmMessage: document.getElementById('resign-confirm-message'),
            resignConfirmYes: document.getElementById('resign-confirm-yes'),
            resignConfirmNo: document.getElementById('resign-confirm-no'),
        };
    }

    /**
     * 게임 상태를 초기 기본값으로 설정합니다.
     */
    _initializeState() {
        this.state = {
            board: [],
            currentPlayer: 'black',
            gameMode: null,
            aiDifficulty: null,
            isGameOver: false, // 게임 종료 상태 추가
            winRateHistory: [],
            settings: {
                showWinRate: true,
                showAiCommentary: true,
                showHints: true,
            },
        };
    }

    /**
     * 게임에 필요한 모든 이벤트 리스너를 등록합니다.
     */
    _initializeEventListeners() {
        document.getElementById('pvp-button').addEventListener('click', () => this.startGame('pvp'));
        document.getElementById('pve-button').addEventListener('click', () => this._showScreen('difficultySelection'));
        
        document.querySelectorAll('.difficulty-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.state.aiDifficulty = e.target.dataset.difficulty;
                this.startGame('pve');
            });
        });

        document.getElementById('back-to-selection-button').addEventListener('click', () => this._showScreen('gameModeSelection'));
        
        this.elements.board.addEventListener('click', (e) => this._handleBoardClick(e));
        this.elements.closeModalButton.addEventListener('click', () => this.elements.graphModal.style.display = 'none');

        // 설정 관련 이벤트 리스너
        this.elements.settingsButton.addEventListener('click', () => this.elements.settingsModal.style.display = 'flex');
        this.elements.closeSettingsButton.addEventListener('click', () => this.elements.settingsModal.style.display = 'none');
        this.elements.toggleWinRate.addEventListener('change', (e) => this._toggleSetting('showWinRate', e.target.checked));
        this.elements.toggleAiCommentary.addEventListener('change', (e) => this._toggleSetting('showAiCommentary', e.target.checked));
        this.elements.toggleHints.addEventListener('change', (e) => this._toggleSetting('showHints', e.target.checked));

        // 새로운 게임 종료 모달 버튼 이벤트 리스너
        this.elements.restartButtonModal.addEventListener('click', () => this.initGame());
        this.elements.reviewButtonModal.addEventListener('click', () => this._showWinRateGraph());
        this.elements.mainMenuButtonModal.addEventListener('click', () => this._showScreen('gameModeSelection'));

        // 기권 관련 이벤트 리스너
        this.elements.resignButton.addEventListener('click', () => this._handleResignClick());
        this.elements.resignConfirmYes.addEventListener('click', () => this._confirmResign());
        this.elements.resignConfirmNo.addEventListener('click', () => this.elements.resignConfirmModal.style.display = 'none');
    }

    // --- [SECTION 2] 게임 흐름 제어 ---

    /**
     * 선택된 모드로 게임을 시작합니다.
     * @param {string} mode - 'pvp' 또는 'pve'
     */
    startGame(mode) {
        this.state.gameMode = mode;
        this._showScreen('game');
        this.initGame();
    }

    /**
     * 게임 보드와 상태를 초기화합니다.
     */
    initGame() {
        // this._initializeState(); // 이 줄을 제거하고 아래 코드로 대체합니다.
        this.state.board = Array(8).fill(null).map(() => Array(8).fill(null));
        this.state.board[3][3] = 'white'; this.state.board[3][4] = 'black';
        this.state.board[4][3] = 'black'; this.state.board[4][4] = 'white';
        this.state.currentPlayer = 'black';
        this.state.isGameOver = false; // 게임 시작 시 초기화
        this.state.winRateHistory = [];
        this.state.gameMode = this.state.gameMode; // 현재 게임 모드는 유지
        this.state.aiDifficulty = this.state.aiDifficulty; // 현재 AI 난이도 유지

        if (this.winRateChart) this.winRateChart.destroy();

        // UI 초기화
        this.elements.gameOverModal.style.display = 'none'; // 게임 종료 모달 숨기기
        this._applySettings(); // 승률 및 해설 컨테이너를 다시 표시
        this._updateUI();
        this._updateAiCommentary('게임이 시작되었습니다.');
    }

    /**
     * 사용자가 보드를 클릭했을 때의 동작을 처리합니다.
     * @param {Event} e - 클릭 이벤트 객체
     */
    _handleBoardClick(e) {
        if (this.state.isGameOver) return; // 게임이 종료되었으면 아무것도 하지 않음

        if (this.state.gameMode === 'pve' && this.state.currentPlayer !== this.config.playerColor) return;

        const cell = e.target.closest('.cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        this._placeDisc(row, col);
    }

    /**
     * 지정된 위치에 돌을 놓고, 게임의 다음 단계를 진행합니다.
     * @param {number} row - 돌을 놓을 행
     * @param {number} col - 돌을 놓을 열
     */
    _placeDisc(row, col) {
        const flips = this._getFlips(row, col, this.state.currentPlayer, this.state.board);
        if (flips.length === 0) {
            if (this.state.gameMode === 'pvp' || this.state.currentPlayer === this.config.playerColor) {
                this._showMessage("해당 위치에는 돌을 놓을 수 없습니다");
            }
            return;
        }

        this.state.board[row][col] = this.state.currentPlayer;
        flips.forEach(([r, c]) => { this.state.board[r][c] = this.state.currentPlayer; });

        this._switchTurn();
    }

    /**
     * 턴을 상대방에게 넘깁니다.
     */
    _switchTurn() {
        const opponent = (this.state.currentPlayer === 'black') ? 'white' : 'black';
        const opponentHasMoves = this._getValidMoves(opponent, this.state.board).length > 0;

        if (opponentHasMoves) {
            this.state.currentPlayer = opponent;
        } else {
            this._showMessage(`${this.state.currentPlayer === 'black' ? '백돌' : '흑돌'}이 둘 곳이 없어 턴을 넘깁니다.`);
            if (this._getValidMoves(this.state.currentPlayer, this.state.board).length === 0) {
                this._endGame();
                return;
            }
        }

        this._updateUI();

        if (this.state.gameMode === 'pve' && this.state.currentPlayer !== this.config.playerColor) {
            this._triggerAiMove();
        }
    }

    /**
     * 게임 종료 로직을 처리합니다.
     */
    _endGame(isResign = false) {
        if (this.state.isGameOver) return; // 이미 게임이 종료되었다면 중복 실행 방지
        this.state.isGameOver = true; // 게임 종료 상태로 설정

        // 기권이 아닐 경우에만 마지막 상태를 업데이트 (기권 시에는 즉시 종료)
        if (!isResign) {
            this._updateUI();
        }

        const blackScore = this.state.board.flat().filter(c => c === 'black').length;
        const whiteScore = this.state.board.flat().filter(c => c === 'white').length;

        let message = '';
        if (isResign) {
            const winner = this.state.currentPlayer === 'black' ? '백돌' : '흑돌';
            message = `${winner}의 승리!`;
        } else {
            if (blackScore > whiteScore) message = '흑돌의 승리!';
            else if (whiteScore > blackScore) message = '백돌의 승리!';
            else message = '무승부!';
        }

        this.elements.gameOverMessage.textContent = message;
        this.elements.finalBlackScore.textContent = blackScore;
        this.elements.finalWhiteScore.textContent = whiteScore;

        // 다른 사이드바 요소는 숨기고, 게임 종료 모달만 표시
        this.elements.winRateContainer.style.display = 'none';
        this.elements.aiCommentaryContainer.style.display = 'none';
        this.elements.gameOverModal.style.display = 'block';
    }

    _handleResignClick() {
        if (this.state.isGameOver) return;
        let message = '정말로 기권하시겠습니까?';
        if (this.state.gameMode === 'pvp') {
            const player = this.state.currentPlayer === 'black' ? '흑돌' : '백돌';
            message = `${player}, 정말로 기권하시겠습니까?`;
        }
        this.elements.resignConfirmMessage.textContent = message;
        this.elements.resignConfirmModal.style.display = 'flex';
    }

    _confirmResign() {
        this.elements.resignConfirmModal.style.display = 'none';
        this._endGame(true); // isResign 플래그를 true로 설정하여 게임 종료
    }

    // --- [SECTION 3] UI 업데이트 ---

    /**
     * 모든 UI 요소를 현재 게임 상태에 맞게 업데이트합니다.
     */
    _updateUI() {
        this._renderBoard();
        this._updateScore();
        this._updateTurn();
        this._updateWinRate();
        this._applySettings();
    }

    /**
     * 보드를 화면에 그립니다.
     */
    _renderBoard() {
        this.elements.board.innerHTML = '';
        const validMoves = this._getValidMoves(this.state.currentPlayer, this.state.board);

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (this.state.board[r][c]) {
                    const disc = document.createElement('div');
                    disc.className = `disc ${this.state.board[r][c]}`;
                    cell.appendChild(disc);
                } else {
                    const isValidMove = this.state.settings.showHints && validMoves.some(move => move.row === r && move.col === c);
                    if (isValidMove) {
                        const hint = document.createElement('div');
                        hint.className = `valid-move-hint ${this.state.currentPlayer}`;
                        cell.appendChild(hint);
                    }
                }
                this.elements.board.appendChild(cell);
            }
        }
    }

    /**
     * 점수를 업데이트합니다.
     */
    _updateScore() {
        this.elements.blackScore.textContent = this.state.board.flat().filter(c => c === 'black').length;
        this.elements.whiteScore.textContent = this.state.board.flat().filter(c => c === 'white').length;
    }

    /**
     * 현재 턴 정보를 업데이트합니다.
     */
    _updateTurn() {
        this.elements.turnIndicator.classList.remove('turn-black', 'turn-white');

        if (this.state.gameMode === 'pve') {
            const turnText = this.state.currentPlayer === this.config.playerColor ? '플레이어의 차례' : 'AI의 차례';
            this.elements.turnIndicator.textContent = turnText;
        } else {
            const turnText = `${this.state.currentPlayer === 'black' ? '흑돌' : '백돌'}의 차례`;
            this.elements.turnIndicator.textContent = turnText;
            this.elements.turnIndicator.classList.add(`turn-${this.state.currentPlayer}`);
        }

        // 현재 턴인 플레이어의 정보 강조
        if (this.state.currentPlayer === 'black') {
            this.elements.blackPlayerInfo.classList.add('active');
            this.elements.whitePlayerInfo.classList.remove('active');
        } else {
            this.elements.whitePlayerInfo.classList.add('active');
            this.elements.blackPlayerInfo.classList.remove('active');
        }
    }

    /**
     * AI의 해설을 UI에 표시합니다.
     * @param {string} text - 표시할 해설 내용
     */
    _updateAiCommentary(text) {
        this.elements.aiCommentaryText.textContent = text;
    }

    /**
     * 특정 화면을 표시합니다.
     * @param {string} screenName - 표시할 화면의 이름
     */
    _showScreen(screenName) {
        this.elements.gameModeSelection.style.display = 'none';
        this.elements.difficultySelection.style.display = 'none';
        this.elements.mainContent.style.display = 'none';

        switch(screenName) {
            case 'gameModeSelection':
                this.elements.gameModeSelection.style.display = 'block';
                break;
            case 'difficultySelection':
                this.elements.difficultySelection.style.display = 'block';
                break;
            case 'game':
                this.elements.mainContent.style.display = 'flex';
                this._applySettings(); // 게임 화면 표시 시 설정 적용
                break;
        }
    }

    /**
     * 사용자에게 짧은 메시지를 버블 형태로 보여줍니다.
     * @param {string} message - 표시할 메시지
     */
    _showMessage(message) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = message;
        this.elements.messageContainer.appendChild(bubble);
        setTimeout(() => { bubble.classList.add('show'); }, 10);
        setTimeout(() => {
            bubble.classList.remove('show');
            setTimeout(() => { this.elements.messageContainer.removeChild(bubble); }, 500);
        }, 1300);
    }

    // --- [SECTION 4] 설정 관리 ---

    /**
     * 설정 값을 변경하고 UI에 적용합니다.
     * @param {string} setting - 변경할 설정의 키
     * @param {boolean} value - 새로운 설정 값
     */
    _toggleSetting(setting, value) {
        this.state.settings[setting] = value;
        if (setting === 'showHints') {
            this._renderBoard();
        } else {
            this._applySettings();
        }
    }

    /**
     * 현재 설정 상태를 UI에 적용합니다.
     */
    _applySettings() {
        this.elements.winRateContainer.style.display = this.state.settings.showWinRate ? 'block' : 'none';
        this.elements.aiCommentaryContainer.style.display = this.state.settings.showAiCommentary && this.state.gameMode === 'pve' ? 'block' : 'none';
    }

    // --- [SECTION 5] 승률 계산 및 그래프 ---

    /**
     * 현재 보드 상태의 점수를 계산합니다.
     * @param {Array} board - 평가할 보드 상태
     * @returns {number} 보드의 점수
     */
    _calculateBoardScore(board) {
        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] === 'black') score += this.config.weights[r][c];
                if (board[r][c] === 'white') score -= this.config.weights[r][c];
            }
        }
        return score;
    }

    /**
     * 점수를 0-100% 범위의 승률로 변환합니다.
     * @param {number} score - 변환할 점수
     * @returns {number} 0-100 사이의 승률
     */
    _scoreToWinRate(score) {
        return Math.round(100 / (1 + Math.exp(-score / 100)));
    }

    /**
     * 승률을 계산하고 UI에 업데이트하며, 기록을 저장합니다.
     */
    _updateWinRate() {
        const score = this._calculateDynamicScore(); // 동적 점수 계산으로 변경
        const blackWinRate = this._scoreToWinRate(score);
        const whiteWinRate = 100 - blackWinRate;

        this.elements.blackWinRateBar.style.width = blackWinRate + '%';
        this.elements.whiteWinRateBar.style.width = whiteWinRate + '%';
        this.elements.blackWinRateText.textContent = blackWinRate + '%';
        this.elements.whiteWinRateText.textContent = whiteWinRate + '%';

        this.state.winRateHistory.push({ move: this.state.winRateHistory.length + 1, black: blackWinRate, white: whiteWinRate });
    }

    /**
     * 동적 판세 점수를 계산합니다.
     * @returns {number} 현재 판의 동적 점수
     */
    _calculateDynamicScore() {
        const player = this.state.currentPlayer;
        const isMaximizing = player === 'black';
        const depth = this.config.ai[this.state.aiDifficulty] ? this.config.ai[this.state.aiDifficulty].depth : 1;
        const score = this._minimax(this.state.board, player, depth, -Infinity, Infinity, isMaximizing);
        return score;
    }

    /**
     * AI의 해설을 생성합니다.
     * @param {object} bestMove - AI가 선택한 최적의 수
     * @param {number} bestScore - 최적 수의 평가 점수
     * @param {Array} validMoves - 가능한 모든 수
     * @returns {string} 생성된 해설 메시지
     */
    _generateAiCommentary(bestMove, bestScore, validMoves) {
        const moveCoords = this._toChessCoords(bestMove.row, bestMove.col);
        const isCorner = this.config.weights[bestMove.row][bestMove.col] > 100;

        if (isCorner) {
            return `승리의 열쇠, 귀퉁이(${moveCoords})를 차지했습니다! 이 곳은 절대 뒤집히지 않습니다.`;
        }

        if (validMoves.length > 1) {
            // 다른 수들과 비교 분석
            let worstScore = Infinity;
            for (const move of validMoves) {
                if (move === bestMove) continue;
                const tempBoard = this.state.board.map(row => [...row]);
                tempBoard[move.row][move.col] = this.state.currentPlayer;
                move.flips.forEach(([r, c]) => tempBoard[r][c] = this.state.currentPlayer);
                const opponent = (this.state.currentPlayer === 'black') ? 'white' : 'black';
                const depth = this.config.ai.hard.depth;
                const score = this._minimax(tempBoard, opponent, depth, -Infinity, Infinity, false);
                if (score < worstScore) {
                    worstScore = score;
                }
            }

            if (bestScore > worstScore + 50) { // 점수 차이가 클 때
                return `${moveCoords}에 두는 것이 현재로선 최선입니다. 다른 수를 두면 장기적으로 불리해질 수 있다고 판단했습니다.`;
            }
        }

        return `${moveCoords}에 두어 판의 주도권을 가져오는 것이 중요하다고 생각했습니다.`;
    }

    /**
     * 게임 종료 후, 승률 변화 그래프를 그립니다.
     */
    _showWinRateGraph() {
        if (this.state.winRateHistory.length === 0) return;
        this.elements.graphModal.style.display = 'flex';

        if (this.winRateChart) this.winRateChart.destroy();

        this.winRateChart = new Chart(this.elements.winRateChartCanvas, {
            type: 'line',
            data: {
                labels: this.state.winRateHistory.map(h => h.move),
                datasets: [
                    { label: '흑 승률', data: this.state.winRateHistory.map(h => h.black), borderColor: 'black', backgroundColor: 'rgba(0,0,0,0.1)', fill: true, tension: 0.2 },
                    { label: '백 승률', data: this.state.winRateHistory.map(h => h.white), borderColor: 'grey', backgroundColor: 'rgba(211,211,211,0.1)', fill: true, tension: 0.2 }
                ]
            },
            options: {
                responsive: true,
                scales: { y: { min: 0, max: 100, ticks: { callback: value => value + '%' } } },
                plugins: { title: { display: true, text: '턴별 승률 변화', font: { size: 16 } } }
            }
        });
    }

    // --- [SECTION 6] 핵심 게임 로직 (유효성 검사) ---

    /**
     * 특정 플레이어가 둘 수 있는 모든 유효한 수의 목록을 반환합니다.
     * @param {string} player - 'black' 또는 'white'
     * @param {Array} board - 검사할 보드 상태
     * @returns {Array} 유효한 수의 정보가 담긴 객체 배열
     */
    _getValidMoves(player, board) {
        const validMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] === null) {
                    const flips = this._getFlips(r, c, player, board);
                    if (flips.length > 0) {
                        validMoves.push({ row: r, col: c, flips });
                    }
                }
            }
        }
        return validMoves;
    }

    /**
     * 특정 위치에 돌을 놓았을 때 뒤집히는 모든 돌의 좌표를 반환합니다.
     * @returns {Array} 뒤집히는 돌들의 좌표 배열
     */
    _getFlips(row, col, player, board) {
        const opponent = (player === 'black') ? 'white' : 'black';
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        if (board[row][col] !== null) return [];

        const flips = [];
        for (const [dr, dc] of directions) {
            let r = row + dr, c = col + dc;
            const potentialFlips = [];
            while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
                potentialFlips.push([r, c]);
                r += dr; c += dc;
            }
            if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player) {
                flips.push(...potentialFlips);
            }
        }
        return flips;
    }

    // --- [SECTION 7] AI 로직 ---

    /**
     * AI의 턴을 시작합니다.
     */
    _triggerAiMove() {
        this._updateAiCommentary('AI가 생각 중...');
        const difficulty = this.state.aiDifficulty || 'normal';
        const delay = this.config.ai[difficulty].delay;

        setTimeout(() => {
            const { move, reason } = this._findBestMove();
            if (move) {
                this._updateAiCommentary(reason);
                this._placeDisc(move.row, move.col);
            }
        }, delay);
    }

    /**
     * 설정된 난이도에 따라 최적의 수를 찾습니다.
     * @returns {{move: object, reason: string}} 최적의 수와 그 이유
     */
    _findBestMove() {
        const validMoves = this._getValidMoves(this.state.currentPlayer, this.state.board);
        if (validMoves.length === 0) return { move: null, reason: '' };

        switch (this.state.aiDifficulty) {
            case 'easy':   return this._findMoveEasy(validMoves);
            case 'normal': return this._findMoveNormal(validMoves);
            case 'hard':   return this._findMoveHard(validMoves);
            default:       return this._findMoveNormal(validMoves);
        }
    }

    _findMoveEasy(validMoves) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        return { move: randomMove, reason: `음... 그냥 ${this._toChessCoords(randomMove.row, randomMove.col)}에 두고 싶었어요.` };
    }

    _findMoveNormal(validMoves) {
        let bestScore = -Infinity;
        let bestMove = null;
        for (const move of validMoves) {
            let score = this.config.weights[move.row][move.col] + move.flips.length;
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        const isCorner = this.config.weights[bestMove.row][bestMove.col] > 100;
        const reason = isCorner
            ? `${this._toChessCoords(bestMove.row, bestMove.col)}은(는) 승리에 중요한 귀퉁이 자리입니다.`
            : `${this._toChessCoords(bestMove.row, bestMove.col)}에 두어 ${bestMove.flips.length}개의 돌을 뒤집는 것이 좋다고 판단했습니다.`;
        return { move: bestMove, reason };
    }

    _findMoveHard(validMoves) {
        let bestScore = -Infinity;
        let bestMove = null;

        for (const move of validMoves) {
            const tempBoard = this.state.board.map(row => [...row]);
            tempBoard[move.row][move.col] = this.state.currentPlayer;
            move.flips.forEach(([r, c]) => tempBoard[r][c] = this.state.currentPlayer);

            const opponent = (this.state.currentPlayer === 'black') ? 'white' : 'black';
            const depth = this.config.ai.hard.depth;
            const score = this._minimax(tempBoard, opponent, depth, -Infinity, Infinity, false);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        // AI 해설 생성 (개선된 로직)
        const reason = this._generateAiCommentary(bestMove, bestScore, validMoves);
        return { move: bestMove, reason };
    }

    /**
     * Minimax 알고리즘으로 최적의 수를 탐색합니다.
     * @param {Array} board - 현재 보드 상태
     * @param {string} player - 현재 플레이어
     * @param {number} depth - 탐색 깊이
     * @param {boolean} isMaximizingPlayer - 현재 플레이어가 점수를 최대화하는 플레이어인지 여부
     * @returns {number} 해당 분기의 최종 평가 점수
     */
    _minimax(board, player, depth, alpha, beta, isMaximizingPlayer) {
        if (depth === 0) {
            return this._calculateBoardScore(board);
        }

        const validMoves = this._getValidMoves(player, board);
        if (validMoves.length === 0) {
            return this._calculateBoardScore(board);
        }

        const opponent = (player === 'black') ? 'white' : 'black';

        if (isMaximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of validMoves) {
                const tempBoard = board.map(row => [...row]);
                tempBoard[move.row][move.col] = player;
                move.flips.forEach(([r, c]) => tempBoard[r][c] = player);
                const an_eval = this._minimax(tempBoard, opponent, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, an_eval);
                alpha = Math.max(alpha, an_eval);
                if (beta <= alpha) {
                    break; // 베타 컷오프
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of validMoves) {
                const tempBoard = board.map(row => [...row]);
                tempBoard[move.row][move.col] = player;
                move.flips.forEach(([r, c]) => tempBoard[r][c] = player);
                const an_eval = this._minimax(tempBoard, opponent, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, an_eval);
                beta = Math.min(beta, an_eval);
                if (beta <= alpha) {
                    break; // 알파 컷오프
                }
            }
            return minEval;
        }
    }

    // --- [SECTION 8] 유틸리티 함수 ---

    /**
     * (행, 열) 숫자 좌표를 'A1'과 같은 체스 좌표로 변환합니다.
     * @param {number} row - 행 (0-7)
     * @param {number} col - 열 (0-7)
     * @returns {string} 변환된 체스 좌표
     */
    _toChessCoords(row, col) {
        const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        return `${cols[col]}${row + 1}`;
    }
}

// --- [SECTION 9] 초기 실행 ---
// DOM이 완전히 로드된 후 OthelloGame 인스턴스를 생성합니다.
document.addEventListener('DOMContentLoaded', () => {
    new OthelloGame();
});