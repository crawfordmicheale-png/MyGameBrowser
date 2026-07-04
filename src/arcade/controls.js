(function () {
    function isTypingTarget(target) {
        if (!target) return false;
        const tagName = target.tagName;
        return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || target.isContentEditable;
    }

    function createButton(label, className, onClick) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `arcade-control-btn ${className || ""}`.trim();
        button.textContent = label;
        button.addEventListener("click", onClick);
        return button;
    }

    function createHelpModal(title, instructions) {
        const modal = document.createElement("div");
        modal.className = "arcade-help-modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-hidden", "true");

        const panel = document.createElement("div");
        panel.className = "arcade-help-panel";

        const heading = document.createElement("h2");
        heading.textContent = title || "How to Play";
        panel.appendChild(heading);

        const list = document.createElement("ul");
        (instructions || []).forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });
        panel.appendChild(list);

        const closeButton = createButton("Close", "", () => {
            modal.style.display = "none";
            modal.setAttribute("aria-hidden", "true");
        });
        panel.appendChild(closeButton);

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeButton.click();
            }
        });

        modal.appendChild(panel);
        document.body.appendChild(modal);

        return {
            element: modal,
            open() {
                modal.style.display = "flex";
                modal.setAttribute("aria-hidden", "false");
            },
            close() {
                closeButton.click();
            },
            isOpen() {
                return modal.style.display === "flex";
            }
        };
    }

    window.ArcadeControls = {
        init(options) {
            const settings = options || {};
            const header = document.querySelector(".header");
            const controls = document.createElement("div");
            controls.className = "arcade-controls";

            const help = createHelpModal(settings.helpTitle || "How to Play", settings.instructions || []);
            const canPause = settings.canPause !== false && typeof settings.onPauseToggle === "function";
            let pauseButton = null;

            function openHelp() {
                if (pauseButton && typeof settings.isPaused === "function" && !settings.isPaused()) {
                    pauseButton.click();
                }
                help.open();
            }

            controls.appendChild(createButton("Back to Lobby", "arcade-back-btn", () => {
                window.location.href = settings.lobbyPath || "../../index.html";
            }));

            controls.appendChild(createButton("Restart", "arcade-restart-btn", () => {
                if (typeof settings.onRestart === "function") settings.onRestart();
                if (pauseButton) pauseButton.textContent = "Pause";
            }));

            if (canPause) {
                pauseButton = createButton("Pause", "arcade-pause-btn", () => {
                    const paused = Boolean(settings.onPauseToggle());
                    pauseButton.textContent = paused ? "Resume" : "Pause";
                });
                controls.appendChild(pauseButton);
            }

            controls.appendChild(createButton("How to Play", "arcade-help-btn", openHelp));

            if (typeof settings.onSoundToggle === "function") {
                controls.appendChild(createButton("Sound", "arcade-sound-btn", () => settings.onSoundToggle()));
            }

            if (header) {
                header.insertAdjacentElement("afterend", controls);
            } else {
                document.body.insertBefore(controls, document.body.firstChild);
            }

            document.addEventListener("keydown", event => {
                if (isTypingTarget(event.target)) return;

                if (event.key === "Escape") {
                    if (help.isOpen()) {
                        help.close();
                    } else if (pauseButton) {
                        pauseButton.click();
                    }
                } else if (event.key.toLowerCase() === "r") {
                    event.preventDefault();
                    if (typeof settings.onRestart === "function") settings.onRestart();
                    if (pauseButton) pauseButton.textContent = "Pause";
                } else if (event.key.toLowerCase() === "h") {
                    event.preventDefault();
                    openHelp();
                }
            });

            return {
                controls,
                help,
                refreshPauseLabel() {
                    if (pauseButton && typeof settings.isPaused === "function") {
                        pauseButton.textContent = settings.isPaused() ? "Resume" : "Pause";
                    }
                }
            };
        }
    };
})();
