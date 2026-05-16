#!/bin/zsh

# Keep this script simple: it is the Mac launcher for non-terminal users.
# It starts Sanity Studio and Local Visual Register, then opens both URLs.

set -u

# Resolve the launcher location, then derive the project root from it.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STUDIO_URL="http://localhost:3333"
VISUAL_REGISTER_URL="http://localhost:3334"
SANITY_PID=""
VISUAL_PID=""

cleanup() {
  echo ""
  echo "Stopping local app servers..."

  if [ -n "$SANITY_PID" ]; then
    kill "$SANITY_PID" >/dev/null 2>&1 || true
  fi

  if [ -n "$VISUAL_PID" ]; then
    kill "$VISUAL_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT
trap 'cleanup; exit 130' INT TERM

echo "Sanity AI Content OS"
echo "===================="
echo ""
echo "Project root:"
echo "$PROJECT_ROOT"
echo ""

# Move into the project root so npm commands run against the right package.json.
cd "$PROJECT_ROOT" || {
  echo "Could not enter project root."
  echo "Press Enter to close this window."
  read -r
  exit 1
}

# Confirm this looks like the expected project directory.
if [ ! -f "package.json" ]; then
  echo "package.json was not found."
  echo "This launcher may not be inside the expected project folder."
  echo ""
  echo "Press Enter to close this window."
  read -r
  exit 1
fi

# Confirm npm is available before trying to start the local app.
if ! command -v npm >/dev/null 2>&1; then
  echo "npm was not found."
  echo "Please install Node.js and npm, then run this launcher again."
  echo ""
  echo "Press Enter to close this window."
  read -r
  exit 1
fi

# If dependencies are missing, offer to install them.
if [ ! -d "node_modules" ]; then
  echo "node_modules was not found."
  echo "Dependencies need to be installed before the local app can start."
  echo ""
  printf "Run npm install now? [y/N]: "
  read -r SHOULD_INSTALL

  case "$SHOULD_INSTALL" in
    [yY]|[yY][eE][sS])
      echo ""
      echo "Running npm install..."
      npm install
      INSTALL_EXIT_CODE=$?
      if [ "$INSTALL_EXIT_CODE" -ne 0 ]; then
        echo ""
        echo "npm install failed with exit code $INSTALL_EXIT_CODE."
        echo "Please review the log above."
        echo ""
        echo "Press Enter to close this window."
        read -r
        exit "$INSTALL_EXIT_CODE"
      fi
      ;;
    *)
      echo ""
      echo "Install skipped."
      echo "Run npm install later, then launch this file again."
      echo ""
      echo "Press Enter to close this window."
      read -r
      exit 1
      ;;
  esac
fi

echo ""
echo "Starting local Studio and Visual Register..."
echo ""
echo "The browser will open:"
echo "$STUDIO_URL"
echo "$VISUAL_REGISTER_URL"
echo ""
echo "Keep this window open while using the local app."
echo "Press Ctrl+C in this window to stop both servers."
echo ""

# Start Sanity Studio in the background so this launcher can also start Visual Register.
echo "Starting Sanity Studio on $STUDIO_URL ..."
npm run dev &
SANITY_PID=$!

# Start Local Visual Register in the background. This tool does not write directly to Sanity.
echo "Starting Local Visual Register on $VISUAL_REGISTER_URL ..."
npm run visual:register &
VISUAL_PID=$!

# Open both browser pages shortly after the local servers start.
(sleep 5 && open "$STUDIO_URL" && open "$VISUAL_REGISTER_URL") &

# Wait for both servers. The terminal stays open as the shared log window.
wait "$SANITY_PID"
SANITY_EXIT_CODE=$?
wait "$VISUAL_PID"
VISUAL_EXIT_CODE=$?

echo ""
echo "Sanity Studio stopped with exit code $SANITY_EXIT_CODE."
echo "Local Visual Register stopped with exit code $VISUAL_EXIT_CODE."
echo "Press Enter to close this window."
read -r
exit "$SANITY_EXIT_CODE"
