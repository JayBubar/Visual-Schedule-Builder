echo 📁 Phase 1: Finding legacy component files...
echo.

REM Check what's in your calendar components folder
echo 🗂️ Contents of src/components/calendar/:
if exist "src\components\calendar\" (
    dir /b "src\components\calendar\"
) else (
    echo ❌ Calendar folder not found at src\components\calendar\
)
echo.

REM Look for specific legacy component files
echo 🔍 Searching for specific legacy files:
if exist "src\components\calendar\DailyCheckIn.tsx" (
    echo ✅ Found: DailyCheckIn.tsx
) else (
    echo ❌ Not found: DailyCheckIn.tsx
)

if exist "src\components\calendar\DailyHighlights.tsx" (
    echo ✅ Found: DailyHighlights.tsx
) else (
    echo ❌ Not found: DailyHighlights.tsx
)

if exist "src\components\calendar\AreWeReady.tsx" (
    echo ✅ Found: AreWeReady.tsx
) else (
    echo ❌ Not found: AreWeReady.tsx
)

if exist "src\components\calendar\CalendarMathLegacy.tsx" (
    echo ✅ Found: CalendarMathLegacy.tsx
) else (
    echo ❌ Not found: CalendarMathLegacy.tsx
)

echo.

REM Check utils folder for legacy utilities
echo 📁 Contents of src/utils/:
if exist "src\utils\" (
    dir /b "src\utils\"
) else (
    echo ❌ Utils folder not found at src\utils\
)
echo.

echo 🔍 Searching for specific legacy utility files:
if exist "src\utils\choiceDataManager.ts" (
    echo ✅ Found: choiceDataManager.ts
) else (
    echo ❌ Not found: choiceDataManager.ts
)

if exist "src\utils\celebrationManager.ts" (
    echo ✅ Found: celebrationManager.ts
) else (
    echo ❌ Not found: celebrationManager.ts
)

if exist "src\utils\dailyCheckInUtils.ts" (
    echo ✅ Found: dailyCheckInUtils.ts
) else (
    echo ❌ Not found: dailyCheckInUtils.ts
)

echo.