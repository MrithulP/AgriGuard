# AgriGuard Prototype v10

This version is a frontend-only UI/UX update. Backend, database, authentication, IoT simulation, prediction logic, alerts logic, and admin APIs are unchanged.

## Run
```powershell
.venv\Scripts\python.exe -m uvicorn backend.main:app --reload
```
Open http://127.0.0.1:8000

## v10 UI update
- Replaced browser `alert()` dialogs with AgriGuard-designed in-app prompt popups.
- Replaced browser `confirm()` dialogs with branded confirmation dialogs.
- Delete confirmations use a clear danger action.
- Success/info prompts are lightweight and auto-dismiss.
- Error prompts remain until dismissed.
- Mobile prompts use bottom-sheet positioning; desktop prompts are centered.
- No backend or database changes.


## v11 UI changes
- My Crops navigation is hidden for admin accounts on desktop and mobile.
- Admin knowledge-base tabs switch in place without re-rendering the whole application shell.
- Crops, Pests and Solutions tab content uses a short, reduced-motion-aware transition.
- Backend and database logic are unchanged.
