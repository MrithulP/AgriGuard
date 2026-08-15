import sqlite3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, secrets, re

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data"
DATA.mkdir(exist_ok=True)


def now():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password):
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 120000).hex()
    return f"{salt}${digest}"


def username_from_name(name, suffix=None):
    base = re.sub(r"[^a-z0-9]+", ".", name.lower()).strip(".") or "farmer"
    return f"{base}{suffix or ''}"


def repair_farms_foreign_key(c):
    """Repair prototype databases where farms still references users_legacy.

    The current authentication system uses users(id). Older prototype migrations
    accidentally left farms.user_id pointing at users_legacy(id), which makes a
    brand-new username account fail when its default farm is created. This
    migration preserves farm IDs and all farm data while correcting the FK.
    """
    info = c.execute("PRAGMA foreign_key_list(farms)").fetchall()
    if not info or info[0][2] != "users_legacy":
        return False

    c.execute("PRAGMA foreign_keys=OFF")
    try:
        c.execute("BEGIN")
        c.execute("""CREATE TABLE farms_new(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            area REAL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )""")
        c.execute("""INSERT INTO farms_new(id,user_id,name,latitude,longitude,area,created_at)
                     SELECT id,user_id,name,latitude,longitude,area,created_at FROM farms""")
        c.execute("DROP TABLE farms")
        c.execute("ALTER TABLE farms_new RENAME TO farms")
        c.commit()
    except Exception:
        c.rollback()
        raise
    finally:
        c.execute("PRAGMA foreign_keys=ON")
    return True


def init_app():
    db = DATA / "app.db"
    c = sqlite3.connect(db)
    c.execute("PRAGMA foreign_keys=ON")

    # Repair the known username-migration bug before any new accounts are created.
    repair_farms_foreign_key(c)

    # Migrate older phone-based prototype databases. The current app does not
    # ask for or use phone numbers. For an old local prototype DB, keep the
    # legacy column temporarily but add the new account fields.
    cols = [r[1] for r in c.execute("PRAGMA table_info(users)").fetchall()]
    if cols and "username" not in cols:
        c.execute("ALTER TABLE users ADD COLUMN username TEXT")
        c.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'farmer'")
        rows = c.execute("SELECT id,name FROM users ORDER BY id").fetchall()
        used = set()
        for row in rows:
            base = username_from_name(row[1])
            username = base
            n = 2
            while username in used:
                username = f"{base}{n}"
                n += 1
            used.add(username)
            c.execute("UPDATE users SET username=?, role='farmer' WHERE id=?", (username, row[0]))
        c.commit()

    c.executescript("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        role TEXT NOT NULL DEFAULT 'farmer',
        created_at TEXT NOT NULL,
        last_login TEXT
    );
    CREATE TABLE IF NOT EXISTS farms(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        area REAL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS crops(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farm_id INTEGER NOT NULL,
        crop_type TEXT NOT NULL,
        planting_date TEXT NOT NULL,
        area REAL,
        growth_stage TEXT,
        status TEXT DEFAULT 'Active',
        created_at TEXT NOT NULL,
        FOREIGN KEY(farm_id) REFERENCES farms(id)
    );
    CREATE TABLE IF NOT EXISTS iot_devices(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farm_id INTEGER NOT NULL,
        device_name TEXT,
        device_type TEXT,
        status TEXT,
        last_seen TEXT,
        FOREIGN KEY(farm_id) REFERENCES farms(id)
    );
    CREATE TABLE IF NOT EXISTS sensor_readings(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        temperature REAL,
        humidity REAL,
        soil_moisture REAL,
        soil_temperature REAL,
        soil_ph REAL,
        FOREIGN KEY(device_id) REFERENCES iot_devices(id)
    );
    CREATE TABLE IF NOT EXISTS weather_data(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farm_id INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        temperature REAL,
        humidity REAL,
        rainfall REAL,
        wind_speed REAL,
        forecast_type TEXT,
        FOREIGN KEY(farm_id) REFERENCES farms(id)
    );
    CREATE TABLE IF NOT EXISTS predictions(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop_id INTEGER NOT NULL,
        pest_id INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        probability REAL,
        severity TEXT,
        confidence REAL,
        FOREIGN KEY(crop_id) REFERENCES crops(id)
    );
    """)

    # Prototype accounts. No phone numbers are used anywhere.
    has_legacy_phone = "phone" in [r[1] for r in c.execute("PRAGMA table_info(users)").fetchall()]
    if not c.execute("SELECT 1 FROM users WHERE username='farmer'").fetchone():
        if has_legacy_phone:
            uid = c.execute(
                "INSERT INTO users(name,phone,username,password_hash,language,role,created_at) VALUES(?,?,?,?,?,?,?)",
                ("Demo Farmer", "legacy:farmer", "farmer", hash_password("12345678"), "en", "farmer", now())
            ).lastrowid
        else:
            uid = c.execute(
                "INSERT INTO users(name,username,password_hash,language,role,created_at) VALUES(?,?,?,?,?,?)",
                ("Demo Farmer", "farmer", hash_password("12345678"), "en", "farmer", now())
            ).lastrowid
        fid = c.execute(
            "INSERT INTO farms(user_id,name,latitude,longitude,area,created_at) VALUES(?,?,?,?,?,?)",
            (uid, "My Farm", 30.74, 76.79, 2.0, now())
        ).lastrowid
        c.execute(
            "INSERT INTO crops(farm_id,crop_type,planting_date,area,growth_stage,status,created_at) VALUES(?,?,?,?,?,?,?)",
            (fid, "Rice", "2026-07-15", 2.0, "Growing", "Active", now())
        )
        c.execute(
            "INSERT INTO crops(farm_id,crop_type,planting_date,area,growth_stage,status,created_at) VALUES(?,?,?,?,?,?,?)",
            (fid, "Wheat", "2026-11-10", 1.5, "Planned", "Active", now())
        )
        did = c.execute(
            "INSERT INTO iot_devices(farm_id,device_name,device_type,status,last_seen) VALUES(?,?,?,?,?)",
            (fid, "Demo Field Sensor", "ESP32 prototype", "Online", now())
        ).lastrowid
        c.execute(
            "INSERT INTO sensor_readings(device_id,timestamp,temperature,humidity,soil_moisture,soil_temperature,soil_ph) VALUES(?,?,?,?,?,?,?)",
            (did, now(), 28.4, 78.0, 64.0, 25.8, 6.5)
        )
        c.execute(
            "INSERT INTO weather_data(farm_id,timestamp,temperature,humidity,rainfall,wind_speed,forecast_type) VALUES(?,?,?,?,?,?,?)",
            (fid, now(), 28.4, 78.0, 8.5, 9.0, "Next 24 hours")
        )

    if not c.execute("SELECT 1 FROM users WHERE username='admin'").fetchone():
        if has_legacy_phone:
            c.execute(
                "INSERT INTO users(name,phone,username,password_hash,language,role,created_at) VALUES(?,?,?,?,?,?,?)",
                ("AgriGuard Admin", "legacy:admin", "admin", hash_password("Admin123!"), "en", "admin", now())
            )
        else:
            c.execute(
                "INSERT INTO users(name,username,password_hash,language,role,created_at) VALUES(?,?,?,?,?,?)",
                ("AgriGuard Admin", "admin", hash_password("Admin123!"), "en", "admin", now())
            )
    c.commit()
    c.close()


def init_knowledge():
    db = DATA / "knowledge.db"
    c = sqlite3.connect(db)
    c.execute("PRAGMA foreign_keys=ON")
    c.executescript("""
    CREATE TABLE IF NOT EXISTS crops(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        scientific_name TEXT,
        description TEXT,
        image TEXT,
        active INTEGER DEFAULT 1,
        created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS pests(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        scientific_name TEXT,
        description TEXT,
        image TEXT,
        active INTEGER DEFAULT 1,
        created_at TEXT,
        FOREIGN KEY(crop_id) REFERENCES crops(id)
    );
    CREATE TABLE IF NOT EXISTS symptoms(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pest_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        image TEXT,
        FOREIGN KEY(pest_id) REFERENCES pests(id)
    );
    CREATE TABLE IF NOT EXISTS solutions(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pest_id INTEGER NOT NULL,
        solution_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        instructions TEXT,
        warning TEXT,
        source TEXT,
        active INTEGER DEFAULT 1,
        created_at TEXT,
        FOREIGN KEY(pest_id) REFERENCES pests(id)
    );
    CREATE TABLE IF NOT EXISTS translations(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_type TEXT,
        content_id INTEGER,
        language TEXT,
        field TEXT,
        translated_text TEXT
    );
    """)

    # Add metadata columns when upgrading the original knowledge database.
    for table in ("crops", "pests", "solutions"):
        existing_cols = [r[1] for r in c.execute(f"PRAGMA table_info({table})").fetchall()]
        if "created_at" not in existing_cols:
            c.execute(f"ALTER TABLE {table} ADD COLUMN created_at TEXT")
            c.execute(f"UPDATE {table} SET created_at=? WHERE created_at IS NULL", (now(),))

    if not c.execute("SELECT 1 FROM crops").fetchone():
        rice = c.execute("INSERT INTO crops(name,scientific_name,description,created_at) VALUES(?,?,?,?)",
                         ("Rice", "Oryza sativa", "A major cereal crop. AgriGuard monitors environmental conditions and pest risk.", now())).lastrowid
        wheat = c.execute("INSERT INTO crops(name,scientific_name,description,created_at) VALUES(?,?,?,?)",
                          ("Wheat", "Triticum aestivum", "A major cereal crop monitored for seasonal pest risks.", now())).lastrowid
        bph = c.execute("INSERT INTO pests(crop_id,name,scientific_name,description,created_at) VALUES(?,?,?,?,?)",
                         (rice, "Brown Planthopper", "Nilaparvata lugens", "A sap-sucking rice pest associated with hopperburn and yield loss.", now())).lastrowid
        stem = c.execute("INSERT INTO pests(crop_id,name,scientific_name,description,created_at) VALUES(?,?,?,?,?)",
                         (rice, "Rice Stem Borer", "Scirpophaga incertulas", "Larvae bore into rice stems and can cause dead hearts or whiteheads.", now())).lastrowid
        aphid = c.execute("INSERT INTO pests(crop_id,name,scientific_name,description,created_at) VALUES(?,?,?,?,?)",
                          (wheat, "Wheat Aphid", "Rhopalosiphum padi", "Small sap-sucking insects that can reduce plant vigour under favourable conditions.", now())).lastrowid
        termite = c.execute("INSERT INTO pests(crop_id,name,scientific_name,description,created_at) VALUES(?,?,?,?,?)",
                            (wheat, "Termite", "Odontotermes spp.", "Soil-dwelling insects that may damage roots and plant bases.", now())).lastrowid
        for pid, symptoms in [
            (bph, ["Yellowing or drying patches", "Hopperburn in severe infestations", "Insects concentrated near the plant base"]),
            (stem, ["Dead hearts in young plants", "Whiteheads around heading stage", "Tiny holes or frass around stems"]),
            (aphid, ["Curling or yellowing leaves", "Clusters of small insects on leaves", "Reduced plant vigour"]),
            (termite, ["Wilting plants", "Root or basal damage", "Plants may be easily pulled from soil"])
        ]:
            for s in symptoms:
                c.execute("INSERT INTO symptoms(pest_id,description) VALUES(?,?)", (pid, s))
        solutions = [
            (bph,"Natural","Low","Monitor and inspect the field regularly","Check the lower parts of rice plants and look for increasing hopper populations.","Inspect representative plants across the field and record changes.","Use monitoring to confirm the issue before treatment.","Agricultural extension guidance"),
            (bph,"Biological","Medium","Use verified biological control options","Consider locally approved biological control approaches appropriate for rice pests.","Follow the product label and local agricultural guidance.","Use only registered/approved products.","Local agriculture department / extension guidance"),
            (bph,"Chemical","High","Consult an agricultural professional for approved control","Chemical control should only be considered when thresholds and local guidance indicate it is necessary.","Use only locally registered products and follow the label exactly.","Do not mix chemicals or exceed label rates.","Local agricultural authority / product label"),
            (stem,"Natural","Low","Field sanitation and monitoring","Remove and manage heavily damaged plant material where appropriate.","Inspect plants regularly, especially during vulnerable growth stages.","Avoid unnecessary intervention.","Agricultural extension guidance"),
            (stem,"Biological","Medium","Use verified biological control options","Consider approved biological control methods for stem borers.","Follow local recommendations and product instructions.","Use only registered/approved products.","Local agricultural authority"),
            (stem,"Chemical","High","Consult an agricultural professional for approved control","Chemical intervention should be based on confirmed infestation and local recommendations.","Follow the exact label and pre-harvest interval.","Professional guidance is recommended.","Local agricultural authority / product label"),
            (aphid,"Natural","Low","Monitor aphid colonies and beneficial insects","Inspect leaf surfaces and avoid unnecessary broad-spectrum treatment.","Record colony size and check whether natural enemies are present.","Protect beneficial insects.","Agricultural extension guidance"),
            (aphid,"Biological","Medium","Encourage or use approved biological controls","Use locally appropriate biological control measures where available.","Follow approved instructions.","Use registered products only.","Local agricultural authority"),
            (aphid,"Chemical","High","Consult an agricultural professional for approved control","Use chemical control only when economically justified and locally recommended.","Follow label directions exactly.","Avoid unnecessary spraying.","Local agricultural authority / product label"),
            (termite,"Natural","Low","Improve field monitoring and soil management","Inspect damaged patches and maintain appropriate field conditions.","Monitor affected zones and record spread.","Confirm the cause before treatment.","Agricultural extension guidance"),
            (termite,"Biological","Medium","Use approved biological approaches where available","Consider locally approved biological methods.","Follow product guidance.","Only use registered/approved products.","Local agricultural authority"),
            (termite,"Chemical","High","Consult an agricultural professional for approved control","Chemical intervention should be based on confirmed damage and local recommendations.","Follow the exact product label and safety requirements.","Keep chemicals away from children, livestock and water sources.","Local agricultural authority / product label"),
        ]
        for s in solutions:
            c.execute("""INSERT INTO solutions(pest_id,solution_type,severity,title,description,instructions,warning,source,created_at)
                         VALUES(?,?,?,?,?,?,?,?,?)""", (*s, now()))
    c.commit()
    c.close()


if __name__ == "__main__":
    init_app()
    init_knowledge()
    print("Databases initialized. Username authentication + admin knowledge base ready.")
