const catalog = require("./catalog");

// =====================================================
// SETUP TYPES
// =====================================================

const SETUP_TYPES = [
    "Circuit",
    "Drift",
    "Drag",
    "Grip"
];

// =====================================================
// HELPERS
// =====================================================

function getCarName(car) {
    if (typeof car === "string") {
        return car;
    }

    return car?.name || "Unknown Car";
}

function slugify(text) {
    return String(text)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// =====================================================
// BASE SETUPS
// =====================================================

const SETUP_PRESETS = {
    Circuit: {
        gearbox: {
            gears: 5,
            finalDrive: "3.90",
            gear1: "3.60",
            gear2: "2.30",
            gear3: "1.70",
            gear4: "1.30",
            gear5: "1.00"
        },

        front: {
            stiffness: "55000",
            travel: "0.20",
            incline: "0.00",
            offset: "-2.50"
        },

        rear: {
            stiffness: "50000",
            travel: "0.21",
            incline: "0.00",
            offset: "-2.20"
        },

        steering: "38",
        differential: "35%",
        cog: "Low",
        tires: "Sport",

        assists: {
            abs: false,
            tcs: false,
            esp: false
        },

        engine: "Stock",

        notes:
            "Circuit starter setup. Focused on predictable grip, stability and controlled cornering."
    },

    Drift: {
        gearbox: {
            gears: 5,
            finalDrive: "4.10",
            gear1: "3.20",
            gear2: "2.20",
            gear3: "1.60",
            gear4: "1.25",
            gear5: "1.00"
        },

        front: {
            stiffness: "45000",
            travel: "0.24",
            incline: "0.00",
            offset: "-2.00"
        },

        rear: {
            stiffness: "35000",
            travel: "0.27",
            incline: "0.00",
            offset: "-1.50"
        },

        steering: "50",
        differential: "90%",
        cog: "Low",
        tires: "Sport",

        assists: {
            abs: false,
            tcs: false,
            esp: false
        },

        engine: "Stock",

        notes:
            "Drift starter setup. Higher steering angle and locking differential are intended for controlled oversteer."
    },

    Drag: {
        gearbox: {
            gears: 5,
            finalDrive: "3.50",
            gear1: "3.10",
            gear2: "2.00",
            gear3: "1.45",
            gear4: "1.10",
            gear5: "0.85"
        },

        front: {
            stiffness: "65000",
            travel: "0.18",
            incline: "0.00",
            offset: "-2.00"
        },

        rear: {
            stiffness: "70000",
            travel: "0.16",
            incline: "0.00",
            offset: "-1.80"
        },

        steering: "35",
        differential: "100%",
        cog: "Low",
        tires: "Sport",

        assists: {
            abs: false,
            tcs: false,
            esp: false
        },

        engine: "Stock",

        notes:
            "Drag starter setup. Focused on straight-line stability, launch consistency and strong acceleration."
    },

    Grip: {
        gearbox: {
            gears: 5,
            finalDrive: "3.80",
            gear1: "3.40",
            gear2: "2.25",
            gear3: "1.65",
            gear4: "1.25",
            gear5: "0.95"
        },

        front: {
            stiffness: "60000",
            travel: "0.19",
            incline: "0.00",
            offset: "-2.30"
        },

        rear: {
            stiffness: "55000",
            travel: "0.20",
            incline: "0.00",
            offset: "-2.00"
        },

        steering: "36",
        differential: "55%",
        cog: "Low",
        tires: "Sport",

        assists: {
            abs: true,
            tcs: false,
            esp: false
        },

        engine: "Stock",

        notes:
            "Grip starter setup. Designed for stable high-speed cornering and predictable traction."
    }
};

// =====================================================
// CREATE SETUP
// =====================================================

function createSetup(game, car, type) {
    const preset = SETUP_PRESETS[type];

    return {
        id:
            `${game.id}-${slugify(car)}-${type.toLowerCase()}`,

        game: game.shortName,

        car: car,

        type: type,

        gearbox: {
            ...preset.gearbox
        },

        suspension: {
            front: {
                ...preset.front
            },

            rear: {
                ...preset.rear
            }
        },

        handling: {
            steeringMaxAngle:
                preset.steering,

            differential:
                preset.differential
        },

        cog: {
            height:
                preset.cog
        },

        tires:
            preset.tires,

        assists: {
            ...preset.assists
        },

        engine:
            preset.engine,

        notes:
            preset.notes
    };
}

// =====================================================
// BUILD EVERY SETUP
// =====================================================

const setups = [];

for (const game of catalog) {
    for (const carEntry of game.cars) {
        const car =
            getCarName(carEntry);

        for (const type of SETUP_TYPES) {
            setups.push(
                createSetup(
                    game,
                    car,
                    type
                )
            );
        }
    }
}

// =====================================================
// AE86 SPECIAL CIRCUIT SETUP
// =====================================================
// This keeps the AE86 setup you've been working with
// slightly different from the generic circuit preset.

const ae86 = setups.find(
    setup =>
        setup.game === "CPM" &&
        setup.car === "Toyota AE86" &&
        setup.type === "Circuit"
);

if (ae86) {
    ae86.gearbox = {
        gears: 5,
        finalDrive: "3.90",
        gear1: "3.60",
        gear2: "2.30",
        gear3: "1.70",
        gear4: "1.30",
        gear5: "1.00"
    };

    ae86.suspension = {
        front: {
            stiffness: "55000",
            travel: "0.20",
            incline: "0.00",
            offset: "-2.50"
        },

        rear: {
            stiffness: "50000",
            travel: "0.21",
            incline: "0.00",
            offset: "-2.20"
        }
    };

    ae86.handling = {
        steeringMaxAngle: "38",
        differential: "35%"
    };

    ae86.cog = {
        height: "Low"
    };

    ae86.tires = "Sport";

    ae86.assists = {
        abs: false,
        tcs: false,
        esp: false
    };

    ae86.engine = "Stock";

    ae86.notes =
        "CPM Toyota AE86 circuit starter setup. Built for predictable grip and reduced oversteer.";
}

// =====================================================
// EXPORT
// =====================================================

module.exports = setups;