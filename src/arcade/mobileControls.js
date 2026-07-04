(function () {
    const activeControls = [];
    const touchQuery = "(pointer: coarse), (hover: none), (max-width: 900px)";
    const supportsPointer = "PointerEvent" in window;

    function shouldShowControls(options) {
        if (options && options.force) return true;
        if (new URLSearchParams(window.location.search).has("mobileDebug")) return true;
        return window.matchMedia(touchQuery).matches || navigator.maxTouchPoints > 0;
    }

    function preventTouchScroll(element) {
        ["touchstart", "touchmove", "touchend", "pointerdown", "pointermove"].forEach(type => {
            element.addEventListener(type, event => event.preventDefault(), { passive: false });
        });
    }

    function createRoot(className, options) {
        if (!shouldShowControls(options)) return null;
        const root = document.createElement("div");
        root.className = `mobile-controls is-ready ${className || ""}`.trim();
        root.setAttribute("aria-label", "Touch controls");
        preventTouchScroll(root);
        document.body.appendChild(root);
        activeControls.push(root);
        return root;
    }

    function pressKey(code) {
        document.dispatchEvent(new KeyboardEvent("keydown", { code, key: keyForCode(code), bubbles: true }));
    }

    function releaseKey(code) {
        document.dispatchEvent(new KeyboardEvent("keyup", { code, key: keyForCode(code), bubbles: true }));
    }

    function keyForCode(code) {
        const keys = {
            ArrowUp: "ArrowUp",
            ArrowDown: "ArrowDown",
            ArrowLeft: "ArrowLeft",
            ArrowRight: "ArrowRight",
            Space: " "
        };
        return keys[code] || code;
    }

    function bindHold(button, onDown, onUp) {
        let isDown = false;

        const start = event => {
            event.preventDefault();
            if (isDown) return;
            isDown = true;
            button.classList.add("is-pressed");
            onDown();
        };

        const release = event => {
            event.preventDefault();
            if (!isDown) return;
            isDown = false;
            button.classList.remove("is-pressed");
            if (onUp) onUp();
        };

        if (supportsPointer) {
            button.addEventListener("pointerdown", event => {
                button.setPointerCapture(event.pointerId);
                start(event);
            });
            button.addEventListener("pointerup", release);
            button.addEventListener("pointercancel", release);
            button.addEventListener("lostpointercapture", release);
        }

        button.addEventListener("touchstart", start, { passive: false });
        button.addEventListener("touchend", release, { passive: false });
        button.addEventListener("touchcancel", release, { passive: false });

        if (!supportsPointer) {
            button.addEventListener("mousedown", start);
            button.addEventListener("mouseup", release);
            button.addEventListener("mouseleave", release);
        }
    }

    function createButton(label, className, options) {
        const button = document.createElement("button");
        const fallbackLabels = { up: "UP", left: "LEFT", right: "RIGHT", down: "DOWN" };
        button.type = "button";
        button.className = `mobile-control-btn ${className || ""}`.trim();
        button.textContent = fallbackLabels[className] || label;
        button.setAttribute("aria-label", options && options.ariaLabel ? options.ariaLabel : label);
        return button;
    }

    function setHidden(root, hidden) {
        if (!root) return;
        root.classList.toggle("is-hidden", Boolean(hidden));
    }

    function wireVisibility(root, options) {
        if (!root || !options || typeof options.shouldHide !== "function") return;
        const update = () => setHidden(root, options.shouldHide());
        update();
        const intervalId = window.setInterval(update, 250);
        activeControls.push({ destroy: () => window.clearInterval(intervalId) });
    }

    function getCanvasPoint(canvas, event) {
        const clientPoint = getClientPoint(event);
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientPoint.clientX - rect.left) * scaleX,
            y: (clientPoint.clientY - rect.top) * scaleY
        };
    }

    function getClientPoint(event) {
        if (event.touches && event.touches.length) return event.touches[0];
        if (event.changedTouches && event.changedTouches.length) return event.changedTouches[0];
        return event;
    }

    function createDPad(options) {
        const settings = options || {};
        const root = createRoot("mobile-dpad-wrap", settings);
        if (!root) return null;

        const pad = document.createElement("div");
        pad.className = "mobile-dpad";
        root.appendChild(pad);

        [
            { label: "↑", className: "up", code: "ArrowUp" },
            { label: "←", className: "left", code: "ArrowLeft" },
            { label: "→", className: "right", code: "ArrowRight" },
            { label: "↓", className: "down", code: "ArrowDown" }
        ].forEach(item => {
            const button = createButton(item.label, item.className, { ariaLabel: item.code.replace("Arrow", "") });
            bindHold(button, () => {
                if (settings.onDirection) settings.onDirection(item.code);
                else pressKey(item.code);
            }, () => {
                if (!settings.onDirection) releaseKey(item.code);
            });
            pad.appendChild(button);
        });

        wireVisibility(root, settings);
        return root;
    }

    function createActionButtons(options) {
        const settings = options || {};
        const root = createRoot("mobile-actions-wrap", settings);
        if (!root) return null;

        (settings.buttons || []).forEach(item => {
            const button = createButton(item.label, item.className || "", item);
            const down = () => item.onDown ? item.onDown() : pressKey(item.code);
            const up = () => item.onUp ? item.onUp() : releaseKey(item.code);
            bindHold(button, down, up);
            root.appendChild(button);
        });

        wireVisibility(root, settings);
        return root;
    }

    function createHorizontalDragControl(options) {
        const settings = options || {};
        const canvas = settings.canvas;
        if (!canvas || !shouldShowControls(settings)) return null;

        const handler = event => {
            if (settings.shouldHide && settings.shouldHide()) return;
            event.preventDefault();
            const point = getCanvasPoint(canvas, event);
            settings.onMove(point.x, point, event);
        };

        canvas.classList.add("mobile-touch-surface");
        if (supportsPointer) {
            canvas.addEventListener("pointerdown", handler);
            canvas.addEventListener("pointermove", handler);
        }
        canvas.addEventListener("touchstart", handler, { passive: false });
        canvas.addEventListener("touchmove", handler, { passive: false });
        activeControls.push({ destroy: () => {
            canvas.removeEventListener("pointerdown", handler);
            canvas.removeEventListener("pointermove", handler);
            canvas.removeEventListener("touchstart", handler);
            canvas.removeEventListener("touchmove", handler);
        }});
        return canvas;
    }

    function createVerticalDragControl(options) {
        const settings = options || {};
        const canvas = settings.canvas;
        if (!canvas || !shouldShowControls(settings)) return null;

        const handler = event => {
            if (settings.shouldHide && settings.shouldHide()) return;
            event.preventDefault();
            const point = getCanvasPoint(canvas, event);
            settings.onMove(point.y, point, event);
        };

        canvas.classList.add("mobile-touch-surface");
        if (supportsPointer) {
            canvas.addEventListener("pointerdown", handler);
            canvas.addEventListener("pointermove", handler);
        }
        canvas.addEventListener("touchstart", handler, { passive: false });
        canvas.addEventListener("touchmove", handler, { passive: false });
        activeControls.push({ destroy: () => {
            canvas.removeEventListener("pointerdown", handler);
            canvas.removeEventListener("pointermove", handler);
            canvas.removeEventListener("touchstart", handler);
            canvas.removeEventListener("touchmove", handler);
        }});
        return canvas;
    }

    function createVirtualJoystick(options) {
        const settings = options || {};
        const root = createRoot("mobile-joystick-wrap", settings);
        if (!root) return null;

        const base = document.createElement("div");
        const knob = document.createElement("div");
        base.className = "mobile-joystick";
        knob.className = "mobile-joystick-knob";
        base.appendChild(knob);
        root.appendChild(base);

        const reset = () => {
            knob.style.transform = "translate(-50%, -50%)";
            if (settings.onMove) settings.onMove(0, 0);
            if (settings.onEnd) settings.onEnd();
        };

        const move = event => {
            event.preventDefault();
            const clientPoint = getClientPoint(event);
            const rect = base.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const max = rect.width * 0.36;
            let dx = clientPoint.clientX - centerX;
            let dy = clientPoint.clientY - centerY;
            const dist = Math.hypot(dx, dy);
            if (dist > max) {
                dx = dx / dist * max;
                dy = dy / dist * max;
            }
            knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
            if (settings.onMove) settings.onMove(dx / max, dy / max);
        };

        if (supportsPointer) {
            base.addEventListener("pointerdown", event => {
                base.setPointerCapture(event.pointerId);
                move(event);
            });
            base.addEventListener("pointermove", event => {
                if (event.buttons) move(event);
            });
            base.addEventListener("pointerup", reset);
            base.addEventListener("pointercancel", reset);
        }
        base.addEventListener("touchstart", move, { passive: false });
        base.addEventListener("touchmove", move, { passive: false });
        base.addEventListener("touchend", reset, { passive: false });
        base.addEventListener("touchcancel", reset, { passive: false });

        wireVisibility(root, settings);
        return root;
    }

    function destroyMobileControls() {
        while (activeControls.length) {
            const item = activeControls.pop();
            if (item.destroy) item.destroy();
            else if (item.parentNode) item.parentNode.removeChild(item);
        }
    }

    document.addEventListener("gesturestart", event => event.preventDefault());
    document.addEventListener("touchmove", event => {
        const target = event.target;
        const inMobileControls = target && target.closest && target.closest(".mobile-controls");
        const isTouchSurface = target && target.classList && target.classList.contains("mobile-touch-surface");
        if (inMobileControls || isTouchSurface) {
            event.preventDefault();
        }
    }, { passive: false });

    window.ArcadeMobileControls = {
        createDPad,
        createActionButtons,
        createHorizontalDragControl,
        createVerticalDragControl,
        createVirtualJoystick,
        destroyMobileControls,
        shouldShowControls
    };
})();
