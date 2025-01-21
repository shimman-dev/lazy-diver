export type ScrollSettings = {
	scrollPercent: number;
	intervalSeconds: number;
};

export type ScrollMessage = {
	command: "start" | "stop" | "getState";
	settings?: ScrollSettings;
};

let isActive = false;

const getSettings = (): ScrollSettings => {
	const scrollPercent = Number.parseFloat((document.getElementById("scrollPercent") as HTMLInputElement).value);
	const intervalSeconds = Number.parseInt((document.getElementById("intervalSeconds") as HTMLInputElement).value);

	return {
		scrollPercent: Math.min(Math.max(scrollPercent, 1), 100),
		intervalSeconds: Math.min(Math.max(intervalSeconds, 1), 120),
	};
};

const saveSettings = (settings: ScrollSettings): void => {
	chrome.storage.local.set({ settings });
};

const loadSettings = (): void => {
	chrome.storage.local.get(["settings"], (result) => {
		if (result.settings) {
			(document.getElementById("scrollPercent") as HTMLInputElement).value = result.settings.scrollPercent.toString();
			(document.getElementById("intervalSeconds") as HTMLInputElement).value =
				result.settings.intervalSeconds.toString();
		}
	});
};

const updateIconsText = (active: boolean) => {
	const pinnyImage = document.querySelector("img.Pinny") as HTMLImageElement;
	const divingArea = document.querySelector(".Pinny-diving-area") as HTMLDivElement;
	const legend = document.querySelector("legend") as HTMLLegendElement;

	legend.textContent = active ? "Continue Diving?" : "Start Diving?";
	divingArea.classList.toggle("water", active);
	pinnyImage.src = active ? "pinny-diver.png" : "pinny-non-diver.png";

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const currentTab = tabs[0];
		if (!currentTab?.id) {
			console.error("No active tab found");
			return;
		}

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

		chrome.action.setIcon(
			{
				tabId: currentTab.id,
				path: path,
			},
			() => {
				if (chrome.runtime.lastError) {
					console.error("Error updating icon:", chrome.runtime.lastError, "for tab:", currentTab.id);
				} else {
					console.log("Successfully updated icon for tab:", currentTab.id);
				}
			},
		);
	});
};

const updateStatus = (active: boolean) => {
	isActive = active;
	const yesRadio = document.getElementById("yes") as HTMLInputElement;
	const noRadio = document.getElementById("no") as HTMLInputElement;

	if (active) {
		yesRadio.checked = true;
		noRadio.checked = false;
	} else {
		yesRadio.checked = false;
		noRadio.checked = true;
	}

	updateIconsText(active);
};

const checkScrollingState = () => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const activeTab = tabs[0];
		if (activeTab.id) {
			chrome.tabs.sendMessage(activeTab.id, { command: "getState" }, (response) => {
				if (response) {
					updateStatus(response.isScrolling);
				}
			});
		}
	});
};

const ensureContentScriptInjected = (tabId: number): Promise<boolean> => {
	return new Promise((resolve) => {
		chrome.tabs.sendMessage(tabId, { command: "getState" }, () => {
			if (chrome.runtime.lastError) {
				chrome.scripting.executeScript(
					{
						target: { tabId },
						files: ["content.js"],
					},
					() => {
						setTimeout(() => resolve(true), 100);
					},
				);
			} else {
				resolve(true);
			}
		});
	});
};

const handleRadioChange = async (event: Event) => {
	const radio = event.target as HTMLInputElement;
	const isYes = radio.id === "yes";

	const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	const activeTab = tabs[0];

	if (!activeTab?.id) {
		console.error("No active tab found");
		return;
	}

	const response = await ensureContentScriptInjected(activeTab.id);
	if (!response) {
		console.error("Failed to inject content script");
		return;
	}

	const message: ScrollMessage = {
		command: isYes ? "start" : "stop",
		settings: isYes ? getSettings() : undefined,
	};

	chrome.tabs.sendMessage(activeTab.id, message, (response) => {
		if (!response) {
			console.error("No response received");
			return;
		}

		updateStatus(isYes);
	});
};

const initializePopup = (): void => {
	const yesRadio = document.getElementById("yes") as HTMLInputElement;
	const noRadio = document.getElementById("no") as HTMLInputElement;

	if (!yesRadio || !noRadio) {
		console.error("Required radio buttons not found");
		return;
	}

	loadSettings();
	checkScrollingState();

	const numberInputs = document.querySelectorAll('input[type="number"]');
	for (const input of numberInputs) {
		input.addEventListener("change", () => {
			saveSettings(getSettings());
			if (isActive) {
				handleRadioChange({ target: document.getElementById("yes") } as Event);
			}
		});
	}

	yesRadio.addEventListener("change", handleRadioChange);
	noRadio.addEventListener("change", handleRadioChange);
};

document.addEventListener("DOMContentLoaded", initializePopup);
