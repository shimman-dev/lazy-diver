interface ScrollSettings {
	scrollPercent: number;
	intervalSeconds: number;
}

interface ScrollMessage {
	command: "start" | "stop" | "getState";
	settings?: ScrollSettings;
}

let scrollInterval: number | undefined;

function updateState(isActive: boolean) {
	chrome.storage.local.set({ isScrolling: isActive });
}

chrome.runtime.onMessage.addListener(
	(message: ScrollMessage, _, sendResponse) => {
		console.log("Lazy Diver 🤿 received command:", message);

		if (message.command === "start") {
			if (message.settings) {
				startScrolling(message.settings);
				updateState(true);
			}
			sendResponse({ status: "started" });
		} else if (message.command === "stop") {
			stopScrolling();
			updateState(false);
			sendResponse({ status: "stopped" });
		} else if (message.command === "getState") {
			sendResponse({ isScrolling: !!scrollInterval });
		}

		return true;
	},
);

function startScrolling(settings: ScrollSettings): void {
	stopScrolling();

	const viewportHeight = window.innerHeight;

	const scrollStep = viewportHeight * (settings.scrollPercent / 100);

	console.log("Diving calculations:", {
		viewportHeight,
		scrollStep,
		scrollPercentage: settings.scrollPercent,
		intervalSeconds: settings.intervalSeconds,
	});

	scrollInterval = window.setInterval(() => {
		const currentPosition = window.scrollY;
		const maxScroll = document.documentElement.scrollHeight - viewportHeight;

		window.scrollTo({
			top: Math.min(currentPosition + scrollStep, maxScroll),
			behavior: "smooth",
		});

		console.log("Diving:", {
			previousPosition: currentPosition,
			newPosition: Math.min(currentPosition + scrollStep, maxScroll),
			viewportPercentage: `${settings.scrollPercent}%`,
			pixelsMoved: scrollStep,
			remainingScroll: maxScroll - currentPosition,
		});

		if (currentPosition >= maxScroll) {
			console.log("Reached bottom of page, becareful of the bends.");
			stopScrolling();
			updateState(false);
		}
	}, settings.intervalSeconds * 1000);

	console.log("Diving started:", scrollInterval);
}

function stopScrolling(): void {
	if (scrollInterval) {
		window.clearInterval(scrollInterval);
		scrollInterval = undefined;
	}
}
