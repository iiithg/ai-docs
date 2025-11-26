import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import './SnakeGame.css';
import SoundManager from '../utils/SoundManager';

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

// 豆子类型
const FOOD_TYPES = {
  NORMAL: { type: 'normal', points: 10, color: '#ff6b6b', duration: -1 },
  GOLDEN: { type: 'golden', points: 50, color: '#ffd93d', duration: 5000 },
  SPEED: { type: 'speed', points: 25, color: '#4ecdc4', duration: 3000, effect: 'speed' },
  SLOW: { type: 'slow', points: 15, color: '#a8e6cf', duration: 4000, effect: 'slow' },
  GHOST: { type: 'ghost', points: 30, color: '#b19cd9', duration: 6000, effect: 'ghost' },
};

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [foods, setFoods] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(GAME_SPEED);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showMilestone, setShowMilestone] = useState(null);
  
  const gameLoopRef = useRef();
  const lastUpdateTimeRef = useRef(0);
  const previousScoreRef = useRef(0);

  // 监听分数变化，触发特效
  useEffect(() => {
    if (score > 0 && score > previousScoreRef.current) {
      const milestone = Math.floor(score / 100) * 100;
      const prevMilestone = Math.floor(previousScoreRef.current / 100) * 100;
      
      if (milestone > prevMilestone) {
        // 触发礼花特效
        triggerConfetti();
        // 显示里程碑提示
        setShowMilestone(milestone);
        setTimeout(() => setShowMilestone(null), 3000);
        // 播放特殊音效
        SoundManager.play('goldenFood');
      }
    }
    previousScoreRef.current = score;
  }, [score]);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  // 生成随机食物
  const generateFood = useCallback(() => {
    const foodTypes = Object.values(FOOD_TYPES);
    const weights = [0.6, 0.15, 0.1, 0.1, 0.05]; // 普通豆子60%概率，金色15%，其他较少
    
    let random = Math.random();
    let selectedType = foodTypes[0];
    
    for (let i = 0; i < weights.length; i++) {
      if (random < weights[i]) {
        selectedType = foodTypes[i];
        break;
      }
      random -= weights[i];
    }

    const newFood = {
      id: Date.now() + Math.random(),
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
      ...selectedType,
      createdAt: Date.now(),
    };

    return newFood;
  }, []);

  // 检查食物是否过期
  const checkFoodExpiry = useCallback((foods) => {
    const now = Date.now();
    return foods.filter(food => {
      if (food.duration === -1) return true; // 普通豆子不过期
      return now - food.createdAt < food.duration;
    });
  }, []);

  // 应用食物效果
  const applyFoodEffect = useCallback((effect, duration) => {
    switch (effect) {
      case 'speed':
        setGameSpeed(GAME_SPEED * 0.6); // 加速
        setTimeout(() => setGameSpeed(GAME_SPEED), duration);
        break;
      case 'slow':
        setGameSpeed(GAME_SPEED * 1.5); // 减速
        setTimeout(() => setGameSpeed(GAME_SPEED), duration);
        break;
      case 'ghost':
        setIsGhostMode(true);
        setTimeout(() => setIsGhostMode(false), duration);
        break;
    }
  }, []);

  // 移动蛇
  const moveSnake = useCallback(() => {
    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // 检查边界碰撞（幽灵模式可以穿墙）
      if (!isGhostMode) {
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
          SoundManager.play('gameOver');
          setGameOver(true);
          return currentSnake;
        }
      } else {
        // 幽灵模式穿墙
        head.x = (head.x + BOARD_SIZE) % BOARD_SIZE;
        head.y = (head.y + BOARD_SIZE) % BOARD_SIZE;
      }

      // 检查自身碰撞（幽灵模式不会撞到自己）
      if (!isGhostMode && newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        SoundManager.play('gameOver');
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // 检查是否吃到食物
      const eatenFood = foods.find(food => food.x === head.x && food.y === head.y);
      if (eatenFood) {
        setScore(prev => prev + eatenFood.points);
        
        // 播放音效
        if (eatenFood.type === 'golden') {
          SoundManager.play('goldenFood');
        } else if (eatenFood.effect === 'speed') {
          SoundManager.play('speedBoost');
        } else if (eatenFood.effect === 'ghost') {
          SoundManager.play('ghostMode');
        } else {
          SoundManager.play('eat');
        }
        
        // 应用食物效果
        if (eatenFood.effect) {
          applyFoodEffect(eatenFood.effect, eatenFood.duration);
        }

        // 移除被吃的食物并生成新食物
        setFoods(currentFoods => {
          const filteredFoods = currentFoods.filter(f => f.id !== eatenFood.id);
          const newFood = generateFood();
          return [...filteredFoods, newFood];
        });
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, isGhostMode, foods, generateFood, applyFoodEffect]);

  // 游戏循环
  const gameLoop = useCallback((currentTime) => {
    if (!isPaused && currentTime - lastUpdateTimeRef.current >= gameSpeed) {
      moveSnake();
      lastUpdateTimeRef.current = currentTime;
    }
    
    if (gameStarted && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameStarted, gameOver, gameSpeed, isPaused, moveSnake]);

  // 初始化食物
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const initialFoods = Array.from({ length: 3 }, () => generateFood());
      setFoods(initialFoods);
    }
  }, [gameStarted, gameOver, generateFood]);

  // 键盘控制
  const handleKeyPress = useCallback((e) => {
    if (!gameStarted) return;

    switch (e.key) {
      case 'ArrowUp':
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
      case ' ':
        e.preventDefault();
        if (!gameOver) setIsPaused(prev => !prev);
        break;
    }
  }, [gameStarted, gameOver, direction]);

  // 开始游戏
  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
    setGameSpeed(GAME_SPEED);
    setIsGhostMode(false);
  };

  // 重新开始
  const restartGame = () => {
    startGame();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, gameLoop]);

  // 定期清理过期食物
  useEffect(() => {
    const interval = setInterval(() => {
      setFoods(checkFoodExpiry);
    }, 1000);
    return () => clearInterval(interval);
  }, [checkFoodExpiry]);

  // 渲染游戏板
  const renderBoard = () => {
    const board = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        const isHead = snake[0]?.x === x && snake[0]?.y === y;
        const food = foods.find(f => f.x === x && f.y === y);
        
        let cellClass = 'cell';
        if (isSnake) {
          cellClass += isHead ? ' snake-head' : ' snake-body';
          if (isGhostMode) cellClass += ' ghost-mode';
        } else if (food) {
          // Do not add food class to the cell container to avoid style conflicts
          // cellClass += ` food-${food.type}`;
        }

        board.push(
          <div
            key={`${x}-${y}`}
            className={cellClass}
            style={food ? { '--food-color': food.color } : {}}
          >
            {food && (
              <div 
                className={`food food-${food.type}`}
                style={{ backgroundColor: food.color }}
              />
            )}
          </div>
        );
      }
    }
    return board;
  };

  return (
    <div className="snake-game">
      <div className="game-header">
        <h1>🐍 超级蛇游戏</h1>
        <div className="game-stats">
          <div className="score">得分: {score}</div>
          <div className="length">长度: {snake.length}</div>
          {showMilestone && (
            <div className="milestone-notification">
              🎉 突破 {showMilestone} 分! 🎉
            </div>
          )}
          {isGhostMode && <div className="effect-indicator ghost">👻 幽灵模式</div>}
          {isPaused && <div className="effect-indicator paused">⏸️ 暂停</div>}
        </div>
      </div>

      <div className="game-board-container">
        <div className="game-board">
          {renderBoard()}
        </div>
      </div>

      <div className="game-controls">
        {!gameStarted ? (
          <button onClick={startGame} className="start-btn">
            开始游戏
          </button>
        ) : gameOver ? (
          <div className="game-over">
            <h2>游戏结束!</h2>
            <p>最终得分: {score}</p>
            <button onClick={restartGame} className="restart-btn">
              重新开始
            </button>
          </div>
        ) : (
          <div className="game-info">
            <p>使用方向键控制蛇的移动</p>
            <p>按空格键暂停/继续游戏</p>
            <div className="food-legend">
              <h3>豆子类型:</h3>
              <div className="legend-item">
                <span className="legend-color normal"></span>
                <span>普通豆子 (+10分)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color golden"></span>
                <span>金色豆子 (+50分)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color speed"></span>
                <span>速度豆子 (+25分, 加速)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color slow"></span>
                <span>缓慢豆子 (+15分, 减速)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color ghost"></span>
                <span>幽灵豆子 (+30分, 穿墙)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnakeGame;