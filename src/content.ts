import type { ScrollMessage, ScrollSettings } from "./popup.ts";

let scrollInterval: number | undefined;
console.log("Lazy Diver content script loaded");
function updateState(isActive: boolean) {
	chrome.storage.local.set({ isScrolling: isActive });
}

chrome.runtime.onMessage.addListener((message: ScrollMessage, _, sendResponse) => {
	console.log("Lazy Diver 🤿 received command:", message);

	if (message.command === "start") {
		if (!message.settings) {
			console.error("No settings provided for start command");
			sendResponse({ error: "Missing settings" });
			return true;
		}
		startScrolling(message.settings);
		sendResponse({ status: "started", isScrolling: true });
	} else if (message.command === "stop") {
		stopScrolling();
		sendResponse({ status: "stopped", isScrolling: false });
	} else if (message.command === "getState") {
		sendResponse({ isScrolling: !!scrollInterval });
	} else {
		console.error("Unknown command received:", message.command);
		sendResponse({ error: "Unknown command" });
	}

	return true;
});

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

const stopScrolling = (): void => {
	if (scrollInterval) {
		window.clearInterval(scrollInterval);
		scrollInterval = undefined;
	}
};
