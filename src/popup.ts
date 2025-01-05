interface ScrollSettings {
	scrollPercent: number;
	intervalSeconds: number;
}

interface ScrollMessage {
	command: "start" | "stop" | "getState";
	settings?: ScrollSettings;
}

let isActive = false;

function updateIcon(active: boolean) {
	const path = active
		? {
				"16": "pinny-diver.png",
				"48": "pinny-diver.png",
				"128": "pinny-diver.png",
			}
		: {
				"16": "pinny-non-diver.png",
				"48": "pinny-non-diver.png",
				"128": "pinny-non-diver.png",
			};

	chrome.action.setIcon({ path });
}
function getSettings(): ScrollSettings {
	const scrollPercent = Number.parseFloat(
		(document.getElementById("scrollPercent") as HTMLInputElement).value,
	);
	const intervalSeconds = Number.parseInt(
		(document.getElementById("intervalSeconds") as HTMLInputElement).value,
	);

	return {
		scrollPercent: Math.min(Math.max(scrollPercent, 1), 100),
		intervalSeconds: Math.min(Math.max(intervalSeconds, 1), 120),
	};
}

function saveSettings(settings: ScrollSettings): void {
	chrome.storage.local.set({ settings });
}

function loadSettings(): void {
	chrome.storage.local.get(["settings"], (result) => {
		if (result.settings) {
			(document.getElementById("scrollPercent") as HTMLInputElement).value =
				result.settings.scrollPercent.toString();
			(document.getElementById("intervalSeconds") as HTMLInputElement).value =
				result.settings.intervalSeconds.toString();
		}
	});
}

function checkScrollingState() {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const activeTab = tabs[0];
		if (activeTab.id) {
			chrome.tabs.sendMessage(
				activeTab.id,
				{ command: "getState" },
				(response) => {
					if (response) {
						updateStatus(response.isScrolling);
					}
				},
			);
		}
	});
}

function updateStatus(active: boolean) {
	isActive = active;
	const startBtn = document.getElementById("startBtn") as HTMLButtonElement;
	const stopBtn = document.getElementById("stopBtn") as HTMLButtonElement;
	const statusIndicator = document.getElementById("status") as HTMLDivElement;
	const inputs = document.querySelectorAll(
		"input",
	) as NodeListOf<HTMLInputElement>;

	if (active) {
		statusIndicator.textContent = "Active";
		statusIndicator.className = "status active";
		startBtn.className = "disabled";
		stopBtn.className = "";
		for (const input of inputs) {
			input.className = "disabled";
		}
	} else {
		statusIndicator.textContent = "Inactive";
		statusIndicator.className = "status inactive";
		startBtn.className = "";
		stopBtn.className = "disabled";
		for (const input of inputs) {
			input.className = "";
		}
	}
	updateIcon(active);
}

function initializePopup(): void {
	const startBtn = document.getElementById("startBtn") as HTMLButtonElement;
	const stopBtn = document.getElementById("stopBtn") as HTMLButtonElement;

	if (!startBtn || !stopBtn) {
		console.error("Required buttons not found");
		return;
	}

	loadSettings();
	checkScrollingState();

	const inputs = document.querySelectorAll("input");
	for (const input of inputs) {
		input.addEventListener("change", () => {
			saveSettings(getSettings());
		});
	}

	startBtn.addEventListener("click", () => {
		const settings = getSettings();
		saveSettings(settings);

		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const activeTab = tabs[0];
			if (activeTab.id) {
				const message: ScrollMessage = {
					command: "start",
					settings,
				};

				chrome.tabs.sendMessage(activeTab.id, message, (response) => {
					if (response && response.status === "started") {
						updateStatus(true);
					}
				});
			}
		});
	});

	stopBtn.addEventListener("click", () => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const activeTab = tabs[0];
			if (activeTab.id) {
				chrome.tabs.sendMessage(
					activeTab.id,
					{ command: "stop" },
					(response) => {
						if (response && response.status === "stopped") {
							updateStatus(false);
						}
					},
				);
			}
		});
	});
}

document.addEventListener("DOMContentLoaded", initializePopup);
