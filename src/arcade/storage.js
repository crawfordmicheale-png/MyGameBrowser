(function () {
    const profileKey = "arcade.profile";
    const highScorePrefix = "arcade.highScore.";
    const winCountPrefix = "arcade.winCount.";

    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            // Saving is optional in private or restricted browser modes.
        }
    }

    function readNumber(key) {
        try {
            const value = Number(localStorage.getItem(key));
            return Number.isFinite(value) ? value : 0;
        } catch (error) {
            return 0;
        }
    }

    function writeNumber(key, value) {
        try {
            localStorage.setItem(key, String(value));
        } catch (error) {
            // Saving is optional in private or restricted browser modes.
        }
    }

    function highScoreKey(gameId) {
        return `${highScorePrefix}${gameId}`;
    }

    function winCountKey(gameId) {
        return `${winCountPrefix}${gameId}`;
    }

    function migrateLegacyHighScore(gameId, legacyKey) {
        if (!legacyKey) return;

        const key = highScoreKey(gameId);
        const currentScore = readNumber(key);
        const legacyScore = readNumber(legacyKey);

        if (legacyScore > currentScore) {
            writeNumber(key, legacyScore);
        }
    }

    window.ArcadeStorage = {
        getDisplayName() {
            const profile = readJson(profileKey, {});
            return profile.displayName || "";
        },

        setDisplayName(displayName) {
            const profile = readJson(profileKey, {});
            profile.displayName = String(displayName || "").trim();
            writeJson(profileKey, profile);
            return profile.displayName;
        },

        getHighScore(gameId, legacyKey) {
            migrateLegacyHighScore(gameId, legacyKey);
            return readNumber(highScoreKey(gameId));
        },

        setHighScore(gameId, score, legacyKey) {
            const numericScore = Number(score);
            if (!Number.isFinite(numericScore)) return readNumber(highScoreKey(gameId));

            const currentScore = this.getHighScore(gameId, legacyKey);
            const bestScore = Math.max(currentScore, Math.floor(numericScore));
            writeNumber(highScoreKey(gameId), bestScore);

            if (legacyKey) {
                writeNumber(legacyKey, bestScore);
            }

            return bestScore;
        },

        getWinCount(gameId) {
            return readNumber(winCountKey(gameId));
        },

        incrementWinCount(gameId) {
            const wins = this.getWinCount(gameId) + 1;
            writeNumber(winCountKey(gameId), wins);
            return wins;
        }
    };
})();
