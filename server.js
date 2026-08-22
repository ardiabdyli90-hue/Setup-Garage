const express = require("express");
const cors = require("cors");
const path = require("path");

const setups = require("./setups");
const catalog = require("./catalog");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// =====================================================
// IMAGE CACHE
// =====================================================

const imageCache = new Map();

// =====================================================
// EXACT IMAGE OVERRIDES
// =====================================================
// These are used BEFORE the generic resolver.
// This prevents different generations from sharing
// the same image.

// NOTE:
// Keep adding exact model-specific overrides here
// whenever a generic resolver produces the wrong image.

const exactImageOverrides = {
    // -----------------------------------------------
    // TOYOTA
    // -----------------------------------------------

    "Toyota AE86":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Toyota_AE86.jpg",

    "Toyota Corolla AE86":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Toyota_AE86.jpg",

    "Toyota Supra MK4":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Toyota_Supra_mk4.jpg",

    // -----------------------------------------------
    // NISSAN SKYLINE
    // -----------------------------------------------

    "Nissan Skyline R32":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nissan_Skyline_R32.jpg",

    "Nissan Skyline R33":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nissan_Skyline_R33.jpg",

    "Nissan Skyline R34":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nissan_Skyline_R34.jpg",

    "Nissan Skyline GT-R R32":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nissan_Skyline_R32.jpg",

    "Nissan Skyline GT-R R33":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nissan_Skyline_R33.jpg",

    "Nissan Skyline GT-R R34":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nissan_Skyline_R34.jpg",

    "Nissan GT-R R35":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nissan_GT-R_R35_2018_(1).jpg",

    // -----------------------------------------------
    // NISSAN SILVIA
    // -----------------------------------------------

    "Nissan Silvia S15":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nissan_Silvia_S15_001.JPG",

    // -----------------------------------------------
    // MAZDA RX-7
    // -----------------------------------------------

    "Mazda RX-7 FC":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/MAZDA_RX-7_FC.jpg",

    "Mazda RX-7 FD":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Mazda-RX-7-FD.jpg",

    // -----------------------------------------------
    // HONDA
    // -----------------------------------------------

    "Honda S2000":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Honda_S2000.jpg",

    // -----------------------------------------------
    // BMW
    // -----------------------------------------------

    "BMW M3 E46":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/BMW_M3_E46.jpg",

    // -----------------------------------------------
    // SUBARU
    // -----------------------------------------------

    "Subaru BRZ":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Subaru_BRZ.jpg"
};

// =====================================================
// VEHICLE ALIASES
// =====================================================

const vehicleAliases = {
    // Toyota
    "Toyota GT86": {
        make: "Toyota",
        model: "GT86"
    },

    "Toyota GR86": {
        make: "Toyota",
        model: "GR86"
    },

    "Toyota GR Supra": {
        make: "Toyota",
        model: "GR Supra"
    },

    "Toyota Supra MK5": {
        make: "Toyota",
        model: "GR Supra"
    },

    "Toyota Chaser JZX100": {
        make: "Toyota",
        model: "Chaser JZX100"
    },

    "Toyota Mark II": {
        make: "Toyota",
        model: "Mark II"
    },

    // Nissan
    "Nissan GT-R R35": {
        make: "Nissan",
        model: "GT-R"
    },

    "Nissan Skyline R32": {
        make: "Nissan",
        model: "Skyline R32"
    },

    "Nissan Skyline R33": {
        make: "Nissan",
        model: "Skyline R33"
    },

    "Nissan Skyline R34": {
        make: "Nissan",
        model: "Skyline R34"
    },

    "Nissan Skyline GT-R R32": {
        make: "Nissan",
        model: "Skyline GT-R R32"
    },

    "Nissan Skyline GT-R R33": {
        make: "Nissan",
        model: "Skyline GT-R R33"
    },

    "Nissan Skyline GT-R R34": {
        make: "Nissan",
        model: "Skyline GT-R R34"
    },

    "Nissan Silvia S13": {
        make: "Nissan",
        model: "Silvia S13"
    },

    "Nissan Silvia S14": {
        make: "Nissan",
        model: "Silvia S14"
    },

    "Nissan Silvia S15": {
        make: "Nissan",
        model: "Silvia S15"
    },

    // Mazda
    "Mazda RX-7 FC": {
        make: "Mazda",
        model: "RX-7 FC"
    },

    "Mazda RX-7 FD": {
        make: "Mazda",
        model: "RX-7 FD"
    },

    // BMW
    "BMW M3 E30": {
        make: "BMW",
        model: "M3 E30"
    },

    "BMW M3 E36": {
        make: "BMW",
        model: "M3 E36"
    },

    "BMW M3 E46": {
        make: "BMW",
        model: "M3 E46"
    },

    "BMW M3 E92": {
        make: "BMW",
        model: "M3 E92"
    },

    // Mercedes
    "Mercedes-AMG C63": {
        make: "Mercedes-Benz",
        model: "C63 AMG"
    },

    "Mercedes-AMG E63": {
        make: "Mercedes-Benz",
        model: "E63 AMG"
    },

    "Mercedes-AMG GT": {
        make: "Mercedes-Benz",
        model: "AMG GT"
    },

    "Mercedes-AMG GT R": {
        make: "Mercedes-Benz",
        model: "AMG GT R"
    },

    "Mercedes-AMG G63": {
        make: "Mercedes-Benz",
        model: "G63 AMG"
    },

    // Audi
    "Audi RS6": {
        make: "Audi",
        model: "RS6"
    },

    "Audi RS7": {
        make: "Audi",
        model: "RS7"
    },

    "Audi R8": {
        make: "Audi",
        model: "R8"
    },

    // Porsche
    "Porsche 911": {
        make: "Porsche",
        model: "911"
    },

    "Porsche 911 GT3": {
        make: "Porsche",
        model: "911 GT3"
    },

    // Lamborghini
    "Lamborghini Huracan": {
        make: "Lamborghini",
        model: "Huracan"
    },

    "Lamborghini Aventador": {
        make: "Lamborghini",
        model: "Aventador"
    },

    // Ferrari
    "Ferrari LaFerrari": {
        make: "Ferrari",
        model: "LaFerrari"
    },

    // McLaren
    "McLaren 720S": {
        make: "McLaren",
        model: "720S"
    },

    "McLaren P1": {
        make: "McLaren",
        model: "P1"
    },

    "McLaren Senna": {
        make: "McLaren",
        model: "Senna"
    }
};

// =====================================================
// DETERMINE MAKE + MODEL
// =====================================================

function getVehicleQuery(carName) {
    if (vehicleAliases[carName]) {
        return vehicleAliases[carName];
    }

    const knownMakes = [
        "Toyota",
        "Nissan",
        "Mazda",
        "Honda",
        "Subaru",
        "Mitsubishi",
        "BMW",
        "Audi",
        "Lexus",
        "Porsche",
        "Ferrari",
        "Lamborghini",
        "McLaren",
        "Bugatti",
        "Koenigsegg",
        "Pagani",
        "Chevrolet",
        "Dodge",
        "Ford",
        "Jeep",
        "Volkswagen",
        "Mini",
        "Maserati",
        "Aston Martin",
        "Lotus",
        "Rimac",
        "Alfa Romeo",
        "Cadillac",
        "GMC",
        "Ram",
        "Range Rover",
        "Lada",
        "Tofas",
        "DeLorean",
        "Hennessey",
        "Zenvo",
        "Scania",
        "Kenworth",
        "DAF"
    ];

    for (const make of knownMakes) {
        if (
            carName
                .toLowerCase()
                .startsWith(
                    make.toLowerCase() + " "
                )
        ) {
            return {
                make,
                model: carName
                    .slice(make.length)
                    .trim()
            };
        }
    }

    return null;
}

// =====================================================
// FIND IMAGE
// =====================================================

async function findCarImage(carName) {
    // Exact override ALWAYS wins.
    if (exactImageOverrides[carName]) {
        const result = {
            url: exactImageOverrides[carName],
            title: carName,
            license:
                "See Wikimedia Commons file page",
            author: "",
            attribution: ""
        };

        imageCache.set(
            carName,
            result
        );

        return result;
    }

    // Check cache.
    if (imageCache.has(carName)) {
        return imageCache.get(carName);
    }

    const vehicle =
        getVehicleQuery(carName);

    if (!vehicle) {
        imageCache.set(
            carName,
            null
        );

        return null;
    }

    try {
        const url =
            "https://carapi.trustcar.info/getImage" +
            `?make=${encodeURIComponent(
                vehicle.make
            )}` +
            `&model=${encodeURIComponent(
                vehicle.model
            )}` +
            "&format=json";

        const response =
            await fetch(url);

        if (!response.ok) {
            imageCache.set(
                carName,
                null
            );

            return null;
        }

        const data =
            await response.json();

        if (
            !data.found ||
            !data.image_url
        ) {
            imageCache.set(
                carName,
                null
            );

            return null;
        }

        const result = {
            url: data.image_url,
            title:
                data.title ||
                carName,
            license:
                data.license ||
                "",
            author:
                data.author ||
                "",
            attribution:
                data.attribution ||
                ""
        };

        imageCache.set(
            carName,
            result
        );

        return result;

    } catch (error) {
        console.error(
            `Image lookup failed for ${carName}:`,
            error.message
        );

        imageCache.set(
            carName,
            null
        );

        return null;
    }
}

// =====================================================
// WEBSITE
// =====================================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});

// =====================================================
// STATUS
// =====================================================

app.get("/api/status", (req, res) => {
    const totalCars =
        catalog.reduce(
            (total, game) =>
                total +
                game.cars.length,
            0
        );

    res.json({
        success: true,
        message:
            "Car Setup Hub API is running!",
        games:
            catalog.length,
        cars:
            totalCars,
        setups:
            setups.length
    });
});

// =====================================================
// CATALOG
// =====================================================

app.get("/api/catalog", (req, res) => {
    res.json({
        success: true,
        games: catalog
    });
});

app.get(
    "/api/catalog/:game",
    (req, res) => {
        const game =
            catalog.find(
                item =>
                    item.id
                        .toLowerCase() ===
                    req.params.game
                        .toLowerCase()
            );

        if (!game) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "Game not found"
                });
        }

        res.json({
            success: true,
            game
        });
    }
);

// =====================================================
// CAR IMAGE API
// =====================================================

app.get(
    "/api/car-image",
    async (req, res) => {
        const car =
            String(
                req.query.car || ""
            ).trim();

        if (!car) {
            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Missing car name"
                });
        }

        const result =
            await findCarImage(car);

        if (!result) {
            return res
                .status(404)
                .json({
                    success: false,
                    car,
                    url: null
                });
        }

        res.json({
            success: true,
            car,
            url: result.url,
            title:
                result.title,
            license:
                result.license,
            author:
                result.author,
            attribution:
                result.attribution
        });
    }
);

// =====================================================
// SETUPS
// =====================================================

app.get(
    "/api/setups",
    (req, res) => {
        res.json({
            success: true,
            setups
        });
    }
);

app.get(
    "/api/setups/:id",
    (req, res) => {
        const setup =
            setups.find(
                item =>
                    item.id ===
                    req.params.id
            );

        if (!setup) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "Setup not found"
                });
        }

        res.json({
            success: true,
            setup
        });
    }
);

// =====================================================
// SEARCH
// =====================================================

app.get(
    "/api/search",
    (req, res) => {
        const query =
            String(
                req.query.q || ""
            )
                .toLowerCase()
                .trim();

        const results =
            setups.filter(setup =>
                setup.car
                    .toLowerCase()
                    .includes(query) ||
                setup.game
                    .toLowerCase()
                    .includes(query) ||
                setup.type
                    .toLowerCase()
                    .includes(query)
            );

        res.json({
            success: true,
            setups: results
        });
    }
);

// =====================================================
// START SERVER
// =====================================================

const PORT =
    process.env.PORT || 3000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {
        const totalCars =
            catalog.reduce(
                (total, game) =>
                    total +
                    game.cars.length,
                0
            );

        console.log(
            "=========================================="
        );

        console.log(
            "            CAR SETUP HUB"
        );

        console.log(
            "=========================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Games loaded: ${catalog.length}`
        );

        console.log(
            `Cars loaded: ${totalCars}`
        );

        console.log(
            `Setups loaded: ${setups.length}`
        );

        console.log(
            "=========================================="
        );
    }
);