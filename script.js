const gameGrid = document.getElementById("gameGrid");
const setupGrid = document.getElementById("setupGrid");
const setupCount = document.getElementById("setupCount");
const searchInput = document.getElementById("searchInput");

let catalog = [];
let setups = [];

const imageCache = {};

const SETUP_TYPES = [
    {
        id: "Circuit",
        name: "Circuit",
        icon: "🏁"
    },
    {
        id: "Drift",
        name: "Drift",
        icon: "🌀"
    },
    {
        id: "Drag",
        name: "Drag",
        icon: "🚀"
    },
    {
        id: "Grip",
        name: "Grip",
        icon: "🛞"
    }
];

// ==========================================
// CAR HELPERS
// ==========================================

function getCarName(car) {
    if (typeof car === "string") {
        return car;
    }

    return car?.name || "Unknown Car";
}

// ==========================================
// GET CAR IMAGE
// ==========================================

async function getCarImage(carName) {
    if (
        Object.prototype.hasOwnProperty.call(
            imageCache,
            carName
        )
    ) {
        return imageCache[carName];
    }

    try {
        const response = await fetch(
            `/api/car-image?car=${encodeURIComponent(carName)}`
        );

        if (!response.ok) {
            imageCache[carName] = null;
            return null;
        }

        const data = await response.json();

        // IMPORTANT:
        // server.js returns "url"
        if (!data.success || !data.url) {
            imageCache[carName] = null;
            return null;
        }

        imageCache[carName] = data;

        return data;

    } catch (error) {
        console.error(
            `Could not load image for ${carName}:`,
            error
        );

        imageCache[carName] = null;

        return null;
    }
}

// ==========================================
// LOAD DATA
// ==========================================

async function loadData() {
    try {
        gameGrid.innerHTML = `
            <div class="empty">
                Loading games...
            </div>
        `;

        setupGrid.innerHTML = `
            <div class="empty">
                Loading setups...
            </div>
        `;

        const [
            catalogResponse,
            setupsResponse
        ] = await Promise.all([
            fetch("/api/catalog"),
            fetch("/api/setups")
        ]);

        if (!catalogResponse.ok) {
            throw new Error(
                "Catalog request failed."
            );
        }

        if (!setupsResponse.ok) {
            throw new Error(
                "Setups request failed."
            );
        }

        const catalogData =
            await catalogResponse.json();

        const setupsData =
            await setupsResponse.json();

        if (!catalogData.success) {
            throw new Error(
                "Catalog API returned an error."
            );
        }

        if (!setupsData.success) {
            throw new Error(
                "Setup API returned an error."
            );
        }

        catalog =
            catalogData.games || [];

        setups =
            setupsData.setups || [];

        renderGames(catalog);
        renderSetups(setups);

    } catch (error) {
        console.error(
            "Loading error:",
            error
        );

        gameGrid.innerHTML = `
            <div class="empty">
                <h3>⚠️ Could not load games</h3>
                <p>
                    Check that the server is running.
                </p>
            </div>
        `;

        setupGrid.innerHTML = `
            <div class="empty">
                <h3>⚠️ Could not load setups</h3>
            </div>
        `;
    }
}

// ==========================================
// RENDER GAMES
// ==========================================

function renderGames(games) {
    gameGrid.innerHTML = "";

    if (!games.length) {
        gameGrid.innerHTML = `
            <div class="empty">
                No games found.
            </div>
        `;

        return;
    }

    games.forEach(game => {
        const card =
            document.createElement("div");

        card.className =
            "game-card";

        card.innerHTML = `
            <div class="game-icon">
                🏎️
            </div>

            <h3>
                ${escapeHTML(game.name)}
            </h3>

            <p>
                ${game.cars.length} cars
            </p>
        `;

        card.addEventListener(
            "click",
            () => showGameCars(game)
        );

        gameGrid.appendChild(card);
    });
}

// ==========================================
// SHOW CARS FOR GAME
// ==========================================

async function showGameCars(game) {
    searchInput.value = "";

    setupGrid.innerHTML = `
        <div class="empty">
            Loading car photos...
        </div>
    `;

    setupCount.textContent =
        `${game.cars.length} cars`;

    const header =
        document.createElement("div");

    header.className =
        "empty";

    header.innerHTML = `
        <h3>
            ${escapeHTML(game.name)}
        </h3>

        <p>
            Select a car to view its setup types.
        </p>

        <button
            class="view-btn"
            id="backToGames"
        >
            ← Back to Games
        </button>
    `;

    setupGrid.innerHTML = "";
    setupGrid.appendChild(header);

    header
        .querySelector("#backToGames")
        .addEventListener(
            "click",
            () => {
                renderGames(catalog);
                renderSetups(setups);
            }
        );

    for (const car of game.cars) {
        const carName =
            getCarName(car);

        const imageData =
            await getCarImage(carName);

        const availableSetups =
            getCarSetups(
                game,
                carName
            );

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "setup-card";

        const photo =
            imageData?.url || "";

        let photoHTML;

        if (photo) {
            photoHTML = `
                <img
                    src="${escapeHTML(photo)}"
                    alt="${escapeHTML(carName)}"
                    class="car-image"
                    loading="lazy"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="car-image-placeholder"
                    style="display:none;"
                >
                    📷
                    <small>
                        Image unavailable
                    </small>
                </div>
            `;
        } else {
            photoHTML = `
                <div class="car-image-placeholder">
                    📷
                    <small>
                        Image coming soon
                    </small>
                </div>
            `;
        }

        card.innerHTML = `
            ${photoHTML}

            <div class="setup-game">
                ${escapeHTML(
                    game.shortName
                )}
            </div>

            <h3>
                ${escapeHTML(
                    carName
                )}
            </h3>

            <span class="setup-type">
                ${
                    availableSetups.length
                        ? `${availableSetups.length} setup${availableSetups.length === 1 ? "" : "s"}`
                        : "No setups yet"
                }
            </span>

            <button
                class="view-btn"
                type="button"
            >
                View Car
            </button>
        `;

        card
            .querySelector(
                ".view-btn"
            )
            .addEventListener(
                "click",
                () => {
                    showCar(
                        game,
                        car,
                        imageData
                    );
                }
            );

        setupGrid.appendChild(card);
    }
}

// ==========================================
// GET SETUPS FOR CAR
// ==========================================

function getCarSetups(
    game,
    carName
) {
    return setups.filter(setup => {
        return (
            setup.game
                .toLowerCase() ===
            game.shortName
                .toLowerCase() &&

            setup.car
                .toLowerCase() ===
            carName
                .toLowerCase()
        );
    });
}

// ==========================================
// SHOW CAR
// ==========================================

function showCar(
    game,
    car,
    imageData
) {
    const carName =
        getCarName(car);

    const carSetups =
        getCarSetups(
            game,
            carName
        );

    setupGrid.innerHTML = "";

    setupCount.textContent =
        `${SETUP_TYPES.length} setup types`;

    const header =
        document.createElement(
            "div"
        );

    header.className =
        "empty";

    const photo =
        imageData?.url || "";

    let photoHTML;

    if (photo) {
        photoHTML = `
            <img
                src="${escapeHTML(photo)}"
                alt="${escapeHTML(carName)}"
                class="car-detail-image"
                onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                "
            >

            <div
                class="car-detail-placeholder"
                style="display:none;"
            >
                📷
                <span>
                    Image unavailable
                </span>
            </div>
        `;
    } else {
        photoHTML = `
            <div class="car-detail-placeholder">
                📷
                <span>
                    Exact exterior photo coming soon
                </span>
            </div>
        `;
    }

    const credit =
        imageData?.attribution || "";

    header.innerHTML = `
        ${photoHTML}

        <div class="setup-game">
            ${escapeHTML(
                game.name
            )}
        </div>

        <h3>
            ${escapeHTML(
                carName
            )}
        </h3>

        ${
            credit
                ? `
                    <p class="photo-credit">
                        ${escapeHTML(
                            credit
                        )}
                    </p>
                `
                : ""
        }

        <p>
            Choose a setup type below.
        </p>

        <button
            class="view-btn"
            id="backToCars"
        >
            ← Back to Cars
        </button>
    `;

    setupGrid.appendChild(
        header
    );

    header
        .querySelector(
            "#backToCars"
        )
        .addEventListener(
            "click",
            () => showGameCars(game)
        );

    SETUP_TYPES.forEach(type => {
        const matchingSetups =
            carSetups.filter(
                setup =>
                    setup.type
                        .toLowerCase() ===
                    type.id
                        .toLowerCase()
            );

        const available =
            matchingSetups.length > 0;

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "setup-card";

        card.innerHTML = `
            <div class="game-icon">
                ${type.icon}
            </div>

            <h3>
                ${escapeHTML(
                    type.name
                )}
            </h3>

            <span class="setup-type">
                ${
                    available
                        ? "✅ Available"
                        : "❌ Not added"
                }
            </span>

            <button
                class="view-btn"
                ${available ? "" : "disabled"}
            >
                ${
                    available
                        ? "View Setup"
                        : "Coming Soon"
                }
            </button>
        `;

        if (available) {
            card
                .querySelector(
                    ".view-btn"
                )
                .addEventListener(
                    "click",
                    () => {
                        showSetupsForType(
                            game,
                            car,
                            imageData,
                            type.name,
                            matchingSetups
                        );
                    }
                );
        }

        setupGrid.appendChild(
            card
        );
    });
}

// ==========================================
// SHOW SETUPS FOR TYPE
// ==========================================

function showSetupsForType(
    game,
    car,
    imageData,
    type,
    matchingSetups
) {
    const carName =
        getCarName(car);

    setupGrid.innerHTML = "";

    setupCount.textContent =
        `${matchingSetups.length} setup${matchingSetups.length === 1 ? "" : "s"}`;

    const header =
        document.createElement(
            "div"
        );

    header.className =
        "empty";

    header.innerHTML = `
        <div class="setup-game">
            ${escapeHTML(
                game.name
            )}
        </div>

        <h3>
            ${escapeHTML(
                carName
            )}
        </h3>

        <p>
            ${escapeHTML(
                type
            )} setups
        </p>

        <button
            class="view-btn"
            id="backToTypes"
        >
            ← Back to Setup Types
        </button>
    `;

    setupGrid.appendChild(
        header
    );

    header
        .querySelector(
            "#backToTypes"
        )
        .addEventListener(
            "click",
            () => {
                showCar(
                    game,
                    car,
                    imageData
                );
            }
        );

    matchingSetups.forEach(
        setup => {
            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "setup-card";

            card.innerHTML = `
                <div class="setup-game">
                    ${escapeHTML(
                        setup.game
                    )}
                </div>

                <h3>
                    ${escapeHTML(
                        setup.car
                    )}
                </h3>

                <span class="setup-type">
                    ${escapeHTML(
                        setup.type
                    )}
                </span>

                <button
                    class="view-btn"
                >
                    View Setup
                </button>
            `;

            card
                .querySelector(
                    ".view-btn"
                )
                .addEventListener(
                    "click",
                    () => {
                        showSetup(
                            setup
                        );
                    }
                );

            setupGrid.appendChild(
                card
            );
        }
    );
}

// ==========================================
// RENDER ALL SETUPS
// ==========================================

function renderSetups(list) {
    setupGrid.innerHTML = "";

    setupCount.textContent =
        `${list.length} setup${list.length === 1 ? "" : "s"}`;

    if (!list.length) {
        setupGrid.innerHTML = `
            <div class="empty">
                No setups available yet.
            </div>
        `;

        return;
    }

    list.forEach(
        setup => {
            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "setup-card";

            card.innerHTML = `
                <div class="setup-game">
                    ${escapeHTML(
                        setup.game
                    )}
                </div>

                <h3>
                    ${escapeHTML(
                        setup.car
                    )}
                </h3>

                <span class="setup-type">
                    ${escapeHTML(
                        setup.type
                    )}
                </span>

                <button
                    class="view-btn"
                >
                    View Setup
                </button>
            `;

            card
                .querySelector(
                    ".view-btn"
                )
                .addEventListener(
                    "click",
                    () => {
                        showSetup(
                            setup
                        );
                    }
                );

            setupGrid.appendChild(
                card
            );
        }
    );
}

// ==========================================
// SHOW SETUP
// ==========================================

function showSetup(setup) {
    const gearbox =
        setup.gearbox || {};

    const front =
        setup.suspension?.front || {};

    const rear =
        setup.suspension?.rear || {};

    const handling =
        setup.handling || {};

    const cog =
        setup.cog || {};

    const assists =
        setup.assists || {};

    setupGrid.innerHTML = `
        <div class="setup-card">

            <div class="setup-game">
                ${escapeHTML(
                    setup.game
                )}
            </div>

            <h2>
                ${escapeHTML(
                    setup.car
                )}
            </h2>

            <span class="setup-type">
                ${escapeHTML(
                    setup.type
                )}
            </span>

            <br><br>

            <button
                class="view-btn"
                id="copySetup"
            >
                📋 Copy Settings
            </button>

            <br><br>

            <h3>
                ⚙️ Gearbox
            </h3>

            <p>
                Gears:
                ${escapeHTML(
                    gearbox.gears ||
                    "TBD"
                )}
            </p>

            <p>
                Final Drive:
                ${escapeHTML(
                    gearbox.finalDrive ||
                    "TBD"
                )}
            </p>

            <p>
                1st:
                ${escapeHTML(
                    gearbox.gear1 ||
                    "TBD"
                )}
            </p>

            <p>
                2nd:
                ${escapeHTML(
                    gearbox.gear2 ||
                    "TBD"
                )}
            </p>

            <p>
                3rd:
                ${escapeHTML(
                    gearbox.gear3 ||
                    "TBD"
                )}
            </p>

            <p>
                4th:
                ${escapeHTML(
                    gearbox.gear4 ||
                    "TBD"
                )}
            </p>

            <p>
                5th:
                ${escapeHTML(
                    gearbox.gear5 ||
                    "TBD"
                )}
            </p>

            <br>

            <h3>
                🛞 Front Suspension
            </h3>

            <p>
                Stiffness:
                ${escapeHTML(
                    front.stiffness ||
                    "TBD"
                )}
            </p>

            <p>
                Travel:
                ${escapeHTML(
                    front.travel ||
                    "TBD"
                )}
            </p>

            <p>
                Incline:
                ${escapeHTML(
                    front.incline ||
                    "TBD"
                )}
            </p>

            <p>
                Offset:
                ${escapeHTML(
                    front.offset ||
                    "TBD"
                )}
            </p>

            <br>

            <h3>
                🛞 Rear Suspension
            </h3>

            <p>
                Stiffness:
                ${escapeHTML(
                    rear.stiffness ||
                    "TBD"
                )}
            </p>

            <p>
                Travel:
                ${escapeHTML(
                    rear.travel ||
                    "TBD"
                )}
            </p>

            <p>
                Incline:
                ${escapeHTML(
                    rear.incline ||
                    "TBD"
                )}
            </p>

            <p>
                Offset:
                ${escapeHTML(
                    rear.offset ||
                    "TBD"
                )}
            </p>

            <br>

            <h3>
                🎯 Handling
            </h3>

            <p>
                Steering Max Angle:
                ${escapeHTML(
                    handling.steeringMaxAngle ||
                    "TBD"
                )}
            </p>

            <p>
                Differential:
                ${escapeHTML(
                    handling.differential ||
                    "TBD"
                )}
            </p>

            <br>

            <h3>
                📐 COG
            </h3>

            <p>
                Height:
                ${escapeHTML(
                    cog.height ||
                    "TBD"
                )}
            </p>

            <br>

            <h3>
                🛞 Tires & Assists
            </h3>

            <p>
                Tires:
                ${escapeHTML(
                    setup.tires ||
                    "TBD"
                )}
            </p>

            <p>
                ABS:
                ${
                    assists.abs
                        ? "ON"
                        : "OFF"
                }
            </p>

            <p>
                TCS:
                ${
                    assists.tcs
                        ? "ON"
                        : "OFF"
                }
            </p>

            <p>
                ESP:
                ${
                    assists.esp
                        ? "ON"
                        : "OFF"
                }
            </p>

            <br>

            <h3>
                🔧 Engine
            </h3>

            <p>
                ${escapeHTML(
                    setup.engine ||
                    "TBD"
                )}
            </p>

            <br>

            <h3>
                📝 Notes
            </h3>

            <p>
                ${escapeHTML(
                    setup.notes ||
                    "No notes"
                )}
            </p>

            <br>

            <button
                class="view-btn"
                id="backButton"
            >
                ← Back
            </button>

        </div>
    `;

    document
        .getElementById(
            "copySetup"
        )
        .addEventListener(
            "click",
            () => copySetup(setup)
        );

    document
        .getElementById(
            "backButton"
        )
        .addEventListener(
            "click",
            () => {
                renderSetups(
                    setups
                );
            }
        );
}

// ==========================================
// COPY SETUP
// ==========================================

async function copySetup(setup) {
    try {
        await navigator.clipboard.writeText(
            JSON.stringify(
                setup,
                null,
                2
            )
        );

        showToast(
            "✅ Settings copied!"
        );

    } catch (error) {
        console.error(error);

        showToast(
            "❌ Could not copy settings."
        );
    }
}

// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    () => {
        const query =
            searchInput.value
                .toLowerCase()
                .trim();

        if (!query) {
            renderGames(catalog);
            renderSetups(setups);
            return;
        }

        const matchingGames =
            catalog.filter(
                game =>
                    game.name
                        .toLowerCase()
                        .includes(query) ||
                    game.shortName
                        .toLowerCase()
                        .includes(query) ||
                    game.cars.some(
                        car =>
                            getCarName(
                                car
                            )
                                .toLowerCase()
                                .includes(
                                    query
                                )
                    )
            );

        renderGames(
            matchingGames
        );

        const matchingSetups =
            setups.filter(
                setup =>
                    setup.game
                        .toLowerCase()
                        .includes(query) ||
                    setup.car
                        .toLowerCase()
                        .includes(query) ||
                    setup.type
                        .toLowerCase()
                        .includes(query)
            );

        renderSetups(
            matchingSetups
        );
    }
);

// ==========================================
// TOAST
// ==========================================

function showToast(message) {
    const oldToast =
        document.getElementById(
            "copyToast"
        );

    if (oldToast) {
        oldToast.remove();
    }

    const toast =
        document.createElement(
            "div"
        );

    toast.id =
        "copyToast";

    toast.className =
        "copy-toast";

    toast.textContent =
        message;

    document.body.appendChild(
        toast
    );

    setTimeout(
        () => toast.remove(),
        2000
    );
}

// ==========================================
// SECURITY
// ==========================================

function escapeHTML(value) {
    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}

// ==========================================
// START
// ==========================================

loadData();