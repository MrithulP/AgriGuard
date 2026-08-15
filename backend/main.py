from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import sqlite3, hashlib, secrets, random
from pathlib import Path
from datetime import datetime, timezone

BASE = Path(__file__).resolve().parent.parent
APP_DB = BASE / "data" / "app.db"
KNOW_DB = BASE / "data" / "knowledge.db"
FRONTEND = BASE / "frontend"

app = FastAPI(title="AgriGuard API", version="0.2.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
sessions = {}


def conn(path):
    c = sqlite3.connect(path)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys=ON")
    return c


def repair_farms_foreign_key():
    """Repair old prototype DBs whose farms FK still targets users_legacy."""
    if not APP_DB.exists():
        return
    c = conn(APP_DB)
    try:
        info = c.execute("PRAGMA foreign_key_list(farms)").fetchall()
        if not info or info[0][2] != "users_legacy":
            return
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
    finally:
        c.close()


repair_farms_foreign_key()

def hash_password(password):
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 120000).hex()
    return f"{salt}${digest}"


def verify_password(password, stored):
    salt, digest = stored.split("$", 1)
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 120000).hex()
    return secrets.compare_digest(check, digest)


def token_from_header(authorization):
    return authorization.replace("Bearer ", "").strip()


def current_user(authorization: str = Header(default="")):
    token = token_from_header(authorization)
    uid = sessions.get(token)
    if not uid:
        raise HTTPException(401, "Please log in.")
    c = conn(APP_DB)
    row = c.execute("SELECT id,name,username,language,role FROM users WHERE id=?", (uid,)).fetchone()
    c.close()
    if not row:
        sessions.pop(token, None)
        raise HTTPException(401, "Please log in again.")
    return dict(row)


def require_admin(authorization: str = Header(default="")):
    user = current_user(authorization)
    if user["role"] != "admin":
        raise HTTPException(403, "Admin access required.")
    return user


def now():
    return datetime.now(timezone.utc).isoformat()


class Register(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    username: str = Field(min_length=3, max_length=40)
    password: str = Field(min_length=6, max_length=128)
    language: str = "en"


class Login(BaseModel):
    username: str
    password: str


class LanguageUpdate(BaseModel):
    language: str


class CropCreate(BaseModel):
    farm_id: int
    crop_type: str
    planting_date: str
    area: float = 1.0
    growth_stage: str = "Growing"


class AdminCrop(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    scientific_name: str = ""
    description: str = ""


class AdminPest(BaseModel):
    crop_id: int
    name: str = Field(min_length=2, max_length=100)
    scientific_name: str = ""
    description: str = ""
    symptoms: list[str] = []


class AdminCropUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    scientific_name: str = ""
    description: str = ""


class AdminPestUpdate(BaseModel):
    crop_id: int
    name: str = Field(min_length=2, max_length=100)
    scientific_name: str = ""
    description: str = ""
    symptoms: list[str] = []


class AdminSolutionUpdate(BaseModel):
    pest_id: int
    solution_type: str
    severity: str
    title: str
    description: str
    instructions: str
    warning: str = ""
    source: str = ""


class AdminSolution(BaseModel):
    pest_id: int
    solution_type: str
    severity: str
    title: str
    description: str
    instructions: str
    warning: str = ""
    source: str = ""


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/register")
def register(body: Register):
    name = body.name.strip()
    username = body.username.strip().lower()
    language = body.language if body.language in {"en", "hi", "pa"} else "en"
    if not name or not username:
        raise HTTPException(400, "Name and username are required.")
    c = conn(APP_DB)
    try:
        if c.execute("SELECT id FROM users WHERE lower(username)=?", (username,)).fetchone():
            raise HTTPException(400, "That username is already taken.")
        cur = c.execute(
            "INSERT INTO users(name,username,password_hash,language,role,created_at) VALUES(?,?,?,?,?,?)",
            (name, username, hash_password(body.password), language, "farmer", now())
        )
        user_id = cur.lastrowid
        farm_id = c.execute(
            "INSERT INTO farms(user_id,name,latitude,longitude,area,created_at) VALUES(?,?,?,?,?,?)",
            (user_id, "My Farm", 30.74, 76.79, 2.0, now())
        ).lastrowid
        c.commit()
        return {"message": "Account created", "user_id": user_id, "farm_id": farm_id}
    except sqlite3.IntegrityError as e:
        c.rollback()
        error_text = str(e).lower()
        if "users.username" in error_text or ("unique constraint failed" in error_text and "username" in error_text):
            detail = "That username is already taken. Please choose another one."
        elif "foreign key constraint failed" in error_text:
            detail = "Your account could not be linked to its farm. Please restart AgriGuard and try again."
        else:
            detail = "We couldn't create the account because of a database error. Please try again."
        raise HTTPException(400, detail) from e
    finally:
        c.close()


@app.post("/api/auth/login")
def login(body: Login):
    username = body.username.strip().lower()
    c = conn(APP_DB)
    row = c.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
    if not row or not verify_password(body.password, row["password_hash"]):
        c.close()
        raise HTTPException(401, "Invalid username or password.")
    c.execute("UPDATE users SET last_login=? WHERE id=?", (now(), row["id"]))
    c.commit()
    c.close()
    token = secrets.token_urlsafe(32)
    sessions[token] = row["id"]
    return {"token": token, "user": {"id": row["id"], "name": row["name"], "username": row["username"], "language": row["language"], "role": row["role"]}}


@app.get("/api/me")
def me(authorization: str = Header(default="")):
    return current_user(authorization)


@app.patch("/api/me/language")
def update_language(body: LanguageUpdate, authorization: str = Header(default="")):
    user = current_user(authorization)
    if body.language not in {"en", "hi", "pa"}:
        raise HTTPException(400, "Unsupported language.")
    c = conn(APP_DB)
    c.execute("UPDATE users SET language=? WHERE id=?", (body.language, user["id"]))
    c.commit(); c.close()
    return {"language": body.language}


@app.get("/api/farms")
def farms(authorization: str = Header(default="")):
    user = current_user(authorization)
    c = conn(APP_DB)
    rows = c.execute("SELECT * FROM farms WHERE user_id=?", (user["id"],)).fetchall()
    c.close()
    return [dict(r) for r in rows]


@app.get("/api/crops")
def get_crops(authorization: str = Header(default="")):
    user = current_user(authorization)
    c = conn(APP_DB)
    rows = c.execute("""
        SELECT c.*, f.name AS farm_name
        FROM crops c JOIN farms f ON c.farm_id=f.id
        WHERE f.user_id=? AND c.status='Active'
        ORDER BY c.created_at DESC
    """, (user["id"],)).fetchall()
    c.close()
    return [dict(r) for r in rows]


@app.post("/api/crops")
def add_crop(body: CropCreate, authorization: str = Header(default="")):
    user = current_user(authorization)
    k = conn(KNOW_DB)
    known = k.execute("SELECT id FROM crops WHERE name=? AND active=1", (body.crop_type,)).fetchone()
    k.close()
    if not known:
        raise HTTPException(400, "Please select a crop from the current AgriGuard crop list.")
    c = conn(APP_DB)
    farm = c.execute("SELECT id FROM farms WHERE id=? AND user_id=?", (body.farm_id, user["id"])).fetchone()
    if not farm:
        c.close()
        raise HTTPException(403, "Farm not found.")
    cur = c.execute("""
        INSERT INTO crops(farm_id,crop_type,planting_date,area,growth_stage,status,created_at)
        VALUES(?,?,?,?,?,'Active',?)
    """, (body.farm_id, body.crop_type, body.planting_date, body.area, body.growth_stage, now()))
    c.commit()
    crop_id = cur.lastrowid
    c.close()
    return {"crop_id": crop_id}


@app.delete("/api/crops/{crop_id}")
def remove_crop(crop_id: int, authorization: str = Header(default="")):
    """Remove a farmer's crop from the active crop list while retaining its historical data."""
    user = current_user(authorization)
    c = conn(APP_DB)
    crop = c.execute("""
        SELECT c.id FROM crops c
        JOIN farms f ON c.farm_id=f.id
        WHERE c.id=? AND f.user_id=? AND c.status='Active'
    """, (crop_id, user["id"])).fetchone()
    if not crop:
        c.close()
        raise HTTPException(404, "Crop not found or already removed.")
    c.execute("UPDATE crops SET status='Removed' WHERE id=?", (crop_id,))
    c.commit()
    c.close()
    return {"status": "removed", "crop_id": crop_id}


@app.get("/api/crop/{crop_id}/dashboard")
def crop_dashboard(crop_id: int, authorization: str = Header(default="")):
    user = current_user(authorization)
    c = conn(APP_DB)
    crop = c.execute("""
        SELECT c.*, f.name AS farm_name, f.latitude, f.longitude
        FROM crops c JOIN farms f ON c.farm_id=f.id
        WHERE c.id=? AND f.user_id=? AND c.status='Active'
    """, (crop_id, user["id"])).fetchone()
    if not crop:
        c.close()
        raise HTTPException(404, "Crop not found.")
    sensor = c.execute("""
        SELECT * FROM sensor_readings WHERE device_id IN
        (SELECT id FROM iot_devices WHERE farm_id=?) ORDER BY timestamp DESC LIMIT 1
    """, (crop["farm_id"],)).fetchone()
    weather = c.execute("SELECT * FROM weather_data WHERE farm_id=? ORDER BY timestamp DESC LIMIT 1", (crop["farm_id"],)).fetchone()
    pred = c.execute("SELECT * FROM predictions WHERE crop_id=? ORDER BY timestamp DESC LIMIT 1", (crop_id,)).fetchone()
    c.close()

    prediction = dict(pred) if pred else None
    pest = None
    solutions = []
    if prediction:
        k = conn(KNOW_DB)
        pest = k.execute("SELECT * FROM pests WHERE id=?", (prediction["pest_id"],)).fetchone()
        if pest:
            pest = dict(pest)
            symptoms = k.execute("SELECT * FROM symptoms WHERE pest_id=?", (prediction["pest_id"],)).fetchall()
            pest["symptoms"] = [dict(s) for s in symptoms]
            sols = k.execute("""
                SELECT * FROM solutions WHERE pest_id=? AND severity=? AND active=1
                ORDER BY CASE solution_type WHEN 'Natural' THEN 1 WHEN 'Biological' THEN 2 ELSE 3 END
            """, (prediction["pest_id"], prediction["severity"])).fetchall()
            solutions = [dict(s) for s in sols]
        k.close()
    return {"crop": dict(crop), "sensor": dict(sensor) if sensor else None, "weather": dict(weather) if weather else None, "prediction": prediction, "pest": pest, "solutions": solutions}


@app.get("/api/knowledge/crops")
def knowledge_crops():
    k = conn(KNOW_DB)
    rows = k.execute("SELECT * FROM crops WHERE active=1 ORDER BY name").fetchall()
    k.close()
    return [dict(r) for r in rows]


@app.get("/api/knowledge/pests")
def knowledge_pests(crop: str | None = None):
    k = conn(KNOW_DB)
    if crop:
        rows = k.execute("""
            SELECT p.*, c.name AS crop_name FROM pests p JOIN crops c ON p.crop_id=c.id
            WHERE c.name=? AND c.active=1 AND p.active=1 ORDER BY p.name
        """, (crop,)).fetchall()
    else:
        rows = k.execute("""
            SELECT p.*, c.name AS crop_name FROM pests p JOIN crops c ON p.crop_id=c.id
            WHERE c.active=1 AND p.active=1 ORDER BY c.name,p.name
        """).fetchall()
    k.close()
    return [dict(r) for r in rows]



@app.get("/api/alerts")
def get_alerts(authorization: str = Header(default="")):
    """Return current, user-specific crop and sensor alerts."""
    user = current_user(authorization)
    c = conn(APP_DB)
    rows = c.execute("""
        SELECT
            c.id AS crop_id, c.crop_type, p.pest_id, p.severity,
            p.probability, p.confidence, p.timestamp
        FROM crops c
        JOIN farms f ON c.farm_id=f.id
        JOIN predictions p ON p.id = (
            SELECT p2.id FROM predictions p2
            WHERE p2.crop_id=c.id
            ORDER BY p2.timestamp DESC LIMIT 1
        )
        WHERE f.user_id=? AND c.status='Active'
        ORDER BY CASE p.severity WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END,
                 p.timestamp DESC
    """, (user["id"],)).fetchall()

    k = conn(KNOW_DB)
    pest_names = {r["id"]: r["name"] for r in k.execute("SELECT id,name FROM pests").fetchall()}
    k.close()

    alerts = []
    for r in rows:
        item = dict(r)
        pest_name = pest_names.get(item["pest_id"], "Potential pest")
        if item["severity"] in {"High", "Medium"}:
            alerts.append({
                "type": "risk", "severity": item["severity"],
                "crop_id": item["crop_id"], "crop": item["crop_type"],
                "pest": pest_name,
                "probability": item["probability"], "confidence": item["confidence"],
                "timestamp": item["timestamp"],
                "title": f"{item['crop_type']} — {item['severity']} pest risk",
                "message": f"{pest_name} is being monitored."
            })

    devices = c.execute("""
        SELECT d.id,d.device_name,d.status,d.last_seen
        FROM iot_devices d JOIN farms f ON d.farm_id=f.id
        WHERE f.user_id=? ORDER BY d.last_seen DESC
    """, (user["id"],)).fetchall()
    for d in devices:
        if d["status"] != "Online":
            alerts.append({
                "type":"sensor", "severity":"Medium", "crop_id":None,
                "crop":"Field sensor", "pest":None, "probability":None,
                "confidence":None, "timestamp":d["last_seen"],
                "title":"Field sensor needs attention",
                "message":f"{d['device_name'] or 'Field sensor'} is currently offline."
            })
    c.close()
    return alerts

# -------------------- ADMIN KNOWLEDGE BASE --------------------

@app.get("/api/admin/overview")
def admin_overview(authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    data = {
        "crops": k.execute("SELECT COUNT(*) FROM crops WHERE active=1").fetchone()[0],
        "pests": k.execute("SELECT COUNT(*) FROM pests WHERE active=1").fetchone()[0],
        "solutions": k.execute("SELECT COUNT(*) FROM solutions WHERE active=1").fetchone()[0],
        "archived_crops": k.execute("SELECT COUNT(*) FROM crops WHERE active=0").fetchone()[0],
        "archived_pests": k.execute("SELECT COUNT(*) FROM pests WHERE active=0").fetchone()[0],
    }
    k.close()
    return data


@app.get("/api/admin/crops")
def admin_crops(authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    rows = k.execute("""
        SELECT c.*, COUNT(CASE WHEN p.active=1 THEN 1 END) AS pest_count
        FROM crops c LEFT JOIN pests p ON p.crop_id=c.id
        GROUP BY c.id ORDER BY c.active DESC, c.name
    """).fetchall()
    k.close()
    return [dict(r) for r in rows]


@app.post("/api/admin/crops")
def admin_add_crop(body: AdminCrop, authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    try:
        if k.execute("SELECT id FROM crops WHERE lower(name)=lower(?)", (body.name.strip(),)).fetchone():
            raise HTTPException(400, "A crop with this name already exists.")
        cur = k.execute("INSERT INTO crops(name,scientific_name,description,active,created_at) VALUES(?,?,?,?,?)",
                        (body.name.strip(), body.scientific_name.strip(), body.description.strip(), 1, now()))
        k.commit()
        return {"crop_id": cur.lastrowid, "status": "added"}
    finally:
        k.close()


@app.patch("/api/admin/crops/{crop_id}")
def admin_toggle_crop(crop_id: int, authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    row = k.execute("SELECT active FROM crops WHERE id=?", (crop_id,)).fetchone()
    if not row:
        k.close(); raise HTTPException(404, "Crop not found.")
    new_value = 0 if row["active"] else 1
    k.execute("UPDATE crops SET active=? WHERE id=?", (new_value, crop_id))
    k.commit(); k.close()
    return {"status": "restored" if new_value else "archived", "active": bool(new_value)}


@app.put("/api/admin/crops/{crop_id}")
def admin_edit_crop(crop_id: int, body: AdminCropUpdate, authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    row = k.execute("SELECT id FROM crops WHERE id=?", (crop_id,)).fetchone()
    if not row:
        k.close(); raise HTTPException(404, "Crop not found.")
    duplicate = k.execute("SELECT id FROM crops WHERE lower(name)=lower(?) AND id<>?", (body.name.strip(), crop_id)).fetchone()
    if duplicate:
        k.close(); raise HTTPException(400, "A crop with this name already exists.")
    k.execute("UPDATE crops SET name=?,scientific_name=?,description=? WHERE id=?", (body.name.strip(), body.scientific_name.strip(), body.description.strip(), crop_id))
    k.commit(); k.close()
    return {"status":"updated"}


@app.delete("/api/admin/crops/{crop_id}")
def admin_delete_crop(crop_id: int, authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    row = k.execute("SELECT id FROM crops WHERE id=?", (crop_id,)).fetchone()
    if not row:
        k.close(); raise HTTPException(404, "Crop not found.")
    pests = [r[0] for r in k.execute("SELECT id FROM pests WHERE crop_id=?", (crop_id,)).fetchall()]
    if pests:
        placeholders=','.join('?' for _ in pests)
        k.execute(f"DELETE FROM solutions WHERE pest_id IN ({placeholders})", pests)
        k.execute(f"DELETE FROM symptoms WHERE pest_id IN ({placeholders})", pests)
        k.execute(f"DELETE FROM pests WHERE id IN ({placeholders})", pests)
    k.execute("DELETE FROM crops WHERE id=?", (crop_id,))
    k.commit(); k.close()
    return {"status":"deleted"}


@app.get("/api/admin/pests")
def admin_pests(authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    rows = k.execute("""
        SELECT p.*, c.name AS crop_name,
               COUNT(CASE WHEN s.active=1 THEN 1 END) AS solution_count
        FROM pests p JOIN crops c ON p.crop_id=c.id
        LEFT JOIN solutions s ON s.pest_id=p.id
        GROUP BY p.id ORDER BY c.name,p.active DESC,p.name
    """).fetchall()
    k.close()
    return [dict(r) for r in rows]


@app.post("/api/admin/pests")
def admin_add_pest(body: AdminPest, authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    crop = k.execute("SELECT id FROM crops WHERE id=? AND active=1", (body.crop_id,)).fetchone()
    if not crop:
        k.close(); raise HTTPException(400, "Choose an active crop.")
    if k.execute("SELECT id FROM pests WHERE crop_id=? AND lower(name)=lower(?)", (body.crop_id, body.name.strip())).fetchone():
        k.close(); raise HTTPException(400, "This pest already exists for that crop.")
    cur = k.execute("""
        INSERT INTO pests(crop_id,name,scientific_name,description,active,created_at) VALUES(?,?,?,?,1,?)
    """, (body.crop_id, body.name.strip(), body.scientific_name.strip(), body.description.strip(), now()))
    pest_id = cur.lastrowid
    for symptom in body.symptoms:
        symptom = symptom.strip()
        if symptom:
            k.execute("INSERT INTO symptoms(pest_id,description) VALUES(?,?)", (pest_id, symptom))
    k.commit(); k.close()
    return {"pest_id": pest_id, "status": "added"}


@app.patch("/api/admin/pests/{pest_id}")
def admin_toggle_pest(pest_id: int, authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    row = k.execute("SELECT active FROM pests WHERE id=?", (pest_id,)).fetchone()
    if not row:
        k.close(); raise HTTPException(404, "Pest not found.")
    new_value = 0 if row["active"] else 1
    k.execute("UPDATE pests SET active=? WHERE id=?", (new_value, pest_id))
    k.commit(); k.close()
    return {"status": "restored" if new_value else "archived", "active": bool(new_value)}


@app.put("/api/admin/pests/{pest_id}")
def admin_edit_pest(pest_id: int, body: AdminPestUpdate, authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    row = k.execute("SELECT id FROM pests WHERE id=?", (pest_id,)).fetchone()
    if not row:
        k.close(); raise HTTPException(404, "Pest not found.")
    crop = k.execute("SELECT id FROM crops WHERE id=? AND active=1", (body.crop_id,)).fetchone()
    if not crop:
        k.close(); raise HTTPException(400, "Choose an active crop.")
    duplicate = k.execute("SELECT id FROM pests WHERE crop_id=? AND lower(name)=lower(?) AND id<>?", (body.crop_id, body.name.strip(), pest_id)).fetchone()
    if duplicate:
        k.close(); raise HTTPException(400, "This pest already exists for that crop.")
    k.execute("UPDATE pests SET crop_id=?,name=?,scientific_name=?,description=? WHERE id=?", (body.crop_id, body.name.strip(), body.scientific_name.strip(), body.description.strip(), pest_id))
    k.execute("DELETE FROM symptoms WHERE pest_id=?", (pest_id,))
    for symptom in body.symptoms:
        symptom=symptom.strip()
        if symptom: k.execute("INSERT INTO symptoms(pest_id,description) VALUES(?,?)", (pest_id,symptom))
    k.commit(); k.close()
    return {"status":"updated"}


@app.delete("/api/admin/pests/{pest_id}")
def admin_delete_pest(pest_id: int, authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    row = k.execute("SELECT id FROM pests WHERE id=?", (pest_id,)).fetchone()
    if not row:
        k.close(); raise HTTPException(404, "Pest not found.")
    k.execute("DELETE FROM solutions WHERE pest_id=?", (pest_id,))
    k.execute("DELETE FROM symptoms WHERE pest_id=?", (pest_id,))
    k.execute("DELETE FROM pests WHERE id=?", (pest_id,))
    k.commit(); k.close()
    return {"status":"deleted"}


@app.get("/api/admin/pests/{pest_id}/details")
def admin_pest_details(pest_id: int, authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    pest = k.execute("SELECT p.*, c.name AS crop_name FROM pests p JOIN crops c ON p.crop_id=c.id WHERE p.id=?", (pest_id,)).fetchone()
    if not pest:
        k.close(); raise HTTPException(404, "Pest not found.")
    symptoms = k.execute("SELECT id,description FROM symptoms WHERE pest_id=? ORDER BY id", (pest_id,)).fetchall()
    k.close()
    data=dict(pest); data["symptoms"]=[dict(x) for x in symptoms]
    return data


@app.get("/api/admin/solutions")
def admin_solutions(authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    rows = k.execute("""
        SELECT s.*, p.name AS pest_name, c.name AS crop_name
        FROM solutions s JOIN pests p ON s.pest_id=p.id JOIN crops c ON p.crop_id=c.id
        ORDER BY s.active DESC,c.name,p.name,s.severity,s.solution_type
    """).fetchall()
    k.close()
    return [dict(r) for r in rows]


@app.post("/api/admin/solutions")
def admin_add_solution(body: AdminSolution, authorization: str = Header(default="")):
    require_admin(authorization)
    if body.solution_type not in {"Natural", "Biological", "Chemical"}:
        raise HTTPException(400, "Solution type must be Natural, Biological or Chemical.")
    if body.severity not in {"Low", "Medium", "High"}:
        raise HTTPException(400, "Severity must be Low, Medium or High.")
    k = conn(KNOW_DB)
    pest = k.execute("SELECT id FROM pests WHERE id=? AND active=1", (body.pest_id,)).fetchone()
    if not pest:
        k.close(); raise HTTPException(400, "Choose an active pest.")
    cur = k.execute("""
        INSERT INTO solutions(pest_id,solution_type,severity,title,description,instructions,warning,source,active,created_at)
        VALUES(?,?,?,?,?,?,?,?,1,?)
    """, (body.pest_id, body.solution_type, body.severity, body.title.strip(), body.description.strip(), body.instructions.strip(), body.warning.strip(), body.source.strip(), now()))
    k.commit(); solution_id = cur.lastrowid; k.close()
    return {"solution_id": solution_id, "status": "published"}


@app.patch("/api/admin/solutions/{solution_id}")
def admin_toggle_solution(solution_id: int, authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    row = k.execute("SELECT active FROM solutions WHERE id=?", (solution_id,)).fetchone()
    if not row:
        k.close(); raise HTTPException(404, "Solution not found.")
    new_value=0 if row["active"] else 1
    k.execute("UPDATE solutions SET active=? WHERE id=?", (new_value,solution_id))
    k.commit(); k.close()
    return {"status":"restored" if new_value else "archived","active":bool(new_value)}


@app.put("/api/admin/solutions/{solution_id}")
def admin_edit_solution(solution_id: int, body: AdminSolutionUpdate, authorization: str = Header(default="")):
    require_admin(authorization)
    if body.solution_type not in {"Natural", "Biological", "Chemical"}:
        raise HTTPException(400, "Solution type must be Natural, Biological or Chemical.")
    if body.severity not in {"Low", "Medium", "High"}:
        raise HTTPException(400, "Severity must be Low, Medium or High.")
    k = conn(KNOW_DB)
    row = k.execute("SELECT id FROM solutions WHERE id=?", (solution_id,)).fetchone()
    pest = k.execute("SELECT id FROM pests WHERE id=? AND active=1", (body.pest_id,)).fetchone()
    if not row:
        k.close(); raise HTTPException(404, "Solution not found.")
    if not pest:
        k.close(); raise HTTPException(400, "Choose an active pest.")
    k.execute("""UPDATE solutions SET pest_id=?,solution_type=?,severity=?,title=?,description=?,instructions=?,warning=?,source=? WHERE id=?""", (body.pest_id,body.solution_type,body.severity,body.title.strip(),body.description.strip(),body.instructions.strip(),body.warning.strip(),body.source.strip(),solution_id))
    k.commit(); k.close()
    return {"status":"updated"}


@app.delete("/api/admin/solutions/{solution_id}")
def admin_delete_solution(solution_id: int, authorization: str = Header(default="")):
    require_admin(authorization)
    k = conn(KNOW_DB)
    row = k.execute("SELECT id FROM solutions WHERE id=?", (solution_id,)).fetchone()
    if not row:
        k.close(); raise HTTPException(404, "Solution not found.")
    k.execute("DELETE FROM solutions WHERE id=?", (solution_id,))
    k.commit(); k.close()
    return {"status":"deleted"}


@app.post("/api/dev/simulate/{crop_id}")
def simulate(crop_id: int, authorization: str = Header(default="")):
    user = current_user(authorization)
    c = conn(APP_DB)
    crop = c.execute("""
        SELECT c.*, f.user_id, f.id AS farm_id FROM crops c JOIN farms f ON c.farm_id=f.id
        WHERE c.id=? AND f.user_id=? AND c.status='Active'
    """, (crop_id, user["id"])).fetchone()
    if not crop:
        c.close(); raise HTTPException(404, "Crop not found.")
    temp = round(random.uniform(25, 33), 1)
    humidity = round(random.uniform(65, 90), 1)
    moisture = round(random.uniform(45, 80), 1)
    rainfall = round(random.uniform(0, 18), 1)
    timestamp = now()
    device = c.execute("SELECT id FROM iot_devices WHERE farm_id=? LIMIT 1", (crop["farm_id"],)).fetchone()
    if not device:
        device_id = c.execute("INSERT INTO iot_devices(farm_id,device_name,device_type,status,last_seen) VALUES(?,?,?,?,?)",
                              (crop["farm_id"], "Demo Field Sensor", "ESP32 prototype", "Online", timestamp)).lastrowid
    else:
        device_id = device["id"]
    c.execute("""
        INSERT INTO sensor_readings(device_id,timestamp,temperature,humidity,soil_moisture,soil_temperature,soil_ph)
        VALUES(?,?,?,?,?,?,?)
    """, (device_id, timestamp, temp, humidity, moisture, round(temp-2.0,1), round(random.uniform(6.0,7.2),1)))
    c.execute("""
        INSERT INTO weather_data(farm_id,timestamp,temperature,humidity,rainfall,wind_speed,forecast_type)
        VALUES(?,?,?,?,?,?,?)
    """, (crop["farm_id"], timestamp, temp, humidity, rainfall, round(random.uniform(3,18),1), "Next 24 hours"))

    k = conn(KNOW_DB)
    pest_rows = k.execute("""
        SELECT p.id,p.name FROM pests p JOIN crops c ON p.crop_id=c.id
        WHERE c.name=? AND p.active=1
    """, (crop["crop_type"],)).fetchall()
    k.close()
    if pest_rows:
        chosen = random.choice(pest_rows)
        probability = min(0.95, max(0.12, (humidity/100)*0.55 + (rainfall/20)*0.25 + random.uniform(-0.08,0.08)))
        severity = "High" if probability >= 0.66 else "Medium" if probability >= 0.36 else "Low"
        c.execute("""
            INSERT INTO predictions(crop_id,pest_id,timestamp,probability,severity,confidence)
            VALUES(?,?,?,?,?,?)
        """, (crop_id, chosen["id"], timestamp, round(probability*100,1), severity, round(random.uniform(82,96),1)))
    c.commit(); c.close()
    return {"status":"simulated","temperature":temp,"humidity":humidity,"soil_moisture":moisture}


app.mount("/", StaticFiles(directory=FRONTEND, html=True), name="frontend")
