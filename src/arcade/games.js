(function () {
    window.ARCADE_GAMES = [
        {
            id: "snake",
            title: "Neon Snake",
            description: "Grow the snake, chase food, and avoid the walls.",
            genre: "Classic / Arcade",
            route: "./games/snake/index.html",
            highScoreKey: "arcade.highScore.snake",
            legacyHighScoreKey: "snakeHighScore",
            scoreType: "score",
            scoreLabel: "Best",
            status: "Playable",
            thumbnail: "\uD83D\uDC0D"
        },
        {
            id: "tictactoe",
            title: "Tic-Tac-Toe",
            description: "Take turns claiming spaces in a neon strategy duel.",
            genre: "Puzzle / Strategy",
            route: "./games/tictactoe/index.html",
            highScoreKey: null,
            status: "Playable",
            thumbnail: "XO"
        },
        {
            id: "invaders",
            title: "Galactic Invaders",
            description: "Defend your ship from descending alien waves.",
            genre: "Action / Shooter",
            route: "./games/invaders/index.html",
            highScoreKey: "arcade.highScore.invaders",
            scoreType: "score",
            scoreLabel: "Best",
            status: "Prototype",
            thumbnail: "\uD83D\uDC7E"
        },
        {
            id: "platformer",
            title: "Cyber Leap",
            description: "Jump through platforms, collect coins, and reach the portal.",
            genre: "Platformer / Adventure",
            route: "./games/platformer/index.html",
            highScoreKey: "arcade.highScore.platformer",
            scoreType: "score",
            scoreLabel: "Best",
            status: "Prototype",
            thumbnail: "\uD83C\uDFC3"
        },
        {
            id: "runner",
            title: "Neon Runner 3D",
            description: "Dodge obstacles in a fast WebGL endless run.",
            genre: "Endless / WebGL",
            route: "./games/runner/index.html",
            highScoreKey: "arcade.highScore.runner",
            scoreType: "distance",
            scoreLabel: "Best",
            status: "Prototype",
            thumbnail: "\uD83C\uDFCE\uFE0F"
        },
        {
            id: "survivor",
            title: "Neon Survivor",
            description: "Survive the swarm, collect XP, and choose upgrades.",
            genre: "Bullet Heaven / RPG",
            route: "./games/survivor/index.html",
            highScoreKey: "arcade.highScore.survivor",
            scoreType: "time",
            scoreLabel: "Best",
            status: "Prototype",
            thumbnail: "\uD83C\uDF0C"
        },
        {
            id: "theo-grey",
            title: "Theo & Grey: Backyard Treasure Hunt",
            description: "Help Theo gather cozy backyard treasures before sunset.",
            genre: "Cozy / Collectathon",
            route: "./games/theo-grey/index.html",
            highScoreKey: "arcade.highScore.theo-grey",
            scoreType: "score",
            scoreLabel: "Best",
            status: "Playable",
            thumbnail: "TG"
        },
        {
            id: "breakout",
            title: "Neon Breakout",
            description: "Bounce the ball, clear bricks, and keep the system alive.",
            genre: "Action / Physics",
            route: "./games/breakout/index.html",
            highScoreKey: "arcade.highScore.breakout",
            scoreType: "score",
            scoreLabel: "Best",
            status: "Playable",
            thumbnail: "\uD83E\uDDF1"
        },
        {
            id: "pong",
            title: "Cyber Pong",
            description: "Face the AI in a glowing paddle duel.",
            genre: "Action / Multiplayer",
            route: "./games/pong/index.html",
            highScoreKey: "arcade.winCount.pong",
            scoreType: "wins",
            scoreLabel: "Wins",
            status: "Playable",
            thumbnail: "\uD83C\uDFD3"
        }
    ];
})();
