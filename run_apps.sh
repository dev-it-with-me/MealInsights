#!/bin/bash

# MealInsights Application Runner
# Runs both FastAPI backend and React frontend with proper logging

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$SCRIPT_DIR/logs"

# Create logs directory if it doesn't exist
mkdir -p "$LOGS_DIR"

# PID files for process management
BACKEND_PID_FILE="$LOGS_DIR/backend.pid"
FRONTEND_PID_FILE="$LOGS_DIR/frontend.pid"

# Log function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Function to cleanup processes on script exit
cleanup() {
    log "Cleaning up processes..."
    
    # Kill backend process
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if kill -0 "$BACKEND_PID" 2>/dev/null; then
            log "Stopping backend process (PID: $BACKEND_PID)..."
            kill -TERM "$BACKEND_PID" 2>/dev/null || true
            # Wait up to 10 seconds for graceful shutdown
            for i in {1..10}; do
                if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
                    break
                fi
                sleep 1
            done
            # Force kill if still running
            if kill -0 "$BACKEND_PID" 2>/dev/null; then
                kill -KILL "$BACKEND_PID" 2>/dev/null || true
            fi
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
    
    # Kill frontend process
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$FRONTEND_PID" 2>/dev/null; then
            log "Stopping frontend process (PID: $FRONTEND_PID)..."
            kill -TERM "$FRONTEND_PID" 2>/dev/null || true
            # Wait up to 5 seconds for graceful shutdown
            for i in {1..5}; do
                if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
                    break
                fi
                sleep 1
            done
            # Force kill if still running
            if kill -0 "$FRONTEND_PID" 2>/dev/null; then
                kill -KILL "$FRONTEND_PID" 2>/dev/null || true
            fi
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    success "Cleanup completed"
}

# Trap signals to ensure cleanup on exit
trap cleanup EXIT INT TERM

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start backend
start_backend() {
    log "Starting FastAPI backend..."
    
    # Check if backend port is already in use
    if check_port 8000; then
        warning "Port 8000 is already in use. Backend might already be running."
        return 1
    fi
    
    cd "$SCRIPT_DIR"
    
    # Check if uv is available
    if ! command -v uv &> /dev/null; then
        error "uv is not installed. Please install it first: pip install uv"
        return 1
    fi
    
    # Sync dependencies
    log "Syncing backend dependencies..."
    uv sync
    
    # Start FastAPI with uvicorn
    log "Starting uvicorn server..."
    uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > "$LOGS_DIR/backend.log" 2>&1 &
    
    BACKEND_PID=$!
    echo $BACKEND_PID > "$BACKEND_PID_FILE"
    
    # Wait a moment and check if the process is still running
    sleep 2
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        error "Backend failed to start. Check $LOGS_DIR/backend.log for details."
        return 1
    fi
    
    success "Backend started successfully (PID: $BACKEND_PID)"
    log "Backend logs: $LOGS_DIR/backend.log"
    return 0
}

# Function to start frontend
start_frontend() {
    log "Starting React frontend..."
    
    # Check if frontend port is already in use
    if check_port 5173; then
        warning "Port 5173 is already in use. Frontend might already be running."
        return 1
    fi
    
    cd "$SCRIPT_DIR/MealInsightsFront"
    
    # Ensure we're using the correct environment
    export PATH="/usr/bin:/bin:/usr/local/bin:$PATH"
    
    # Check if we have nvm and use it
    if [ -f "$HOME/.nvm/nvm.sh" ]; then
        source "$HOME/.nvm/nvm.sh"
        nvm use node >/dev/null 2>&1 || nvm install node >/dev/null 2>&1
    fi
    
    # Check if npm is available and use Linux version
    NPM_CMD=$(which npm 2>/dev/null | grep -v "/mnt/c" | head -1)
    if [ -z "$NPM_CMD" ]; then
        error "Linux npm is not available. Please install Node.js and npm in the Linux environment."
        log "You can install it with: sudo apt update && sudo apt install npm"
        return 1
    fi
    
    log "Using npm from: $NPM_CMD"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        log "Installing frontend dependencies..."
        "$NPM_CMD" install
    fi
    
    # Start React development server
    log "Starting Vite development server..."
    "$NPM_CMD" run dev > "$LOGS_DIR/frontend.log" 2>&1 &
    
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$FRONTEND_PID_FILE"
    
    # Wait a moment and check if the process is still running
    sleep 3
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        error "Frontend failed to start. Check $LOGS_DIR/frontend.log for details."
        return 1
    fi
    
    success "Frontend started successfully (PID: $FRONTEND_PID)"
    log "Frontend logs: $LOGS_DIR/frontend.log"
    return 0
}

# Function to show status
show_status() {
    log "Application Status:"
    
    # Check backend
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if kill -0 "$BACKEND_PID" 2>/dev/null; then
            success "Backend is running (PID: $BACKEND_PID) - http://localhost:8000"
        else
            error "Backend is not running (stale PID file)"
            rm -f "$BACKEND_PID_FILE"
        fi
    else
        warning "Backend is not running"
    fi
    
    # Check frontend
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$FRONTEND_PID" 2>/dev/null; then
            success "Frontend is running (PID: $FRONTEND_PID) - http://localhost:5173"
        else
            error "Frontend is not running (stale PID file)"
            rm -f "$FRONTEND_PID_FILE"
        fi
    else
        warning "Frontend is not running"
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start both backend and frontend applications"
    echo "  stop      Stop both applications"
    echo "  restart   Restart both applications"
    echo "  status    Show status of both applications"
    echo "  logs      Show live logs from both applications"
    echo "  help      Show this help message"
    echo ""
    echo "The script will create log files in ./logs/:"
    echo "  - backend.log   FastAPI application logs"
    echo "  - frontend.log  React application logs"
}

# Function to show logs
show_logs() {
    log "Showing live logs (Press Ctrl+C to exit)..."
    log "Backend logs: $LOGS_DIR/backend.log"
    log "Frontend logs: $LOGS_DIR/frontend.log"
    echo ""
    
    # Use tail to follow both log files
    tail -f "$LOGS_DIR/backend.log" "$LOGS_DIR/frontend.log" 2>/dev/null || {
        warning "Log files not found. Applications might not be running."
        return 1
    }
}

# Function to stop applications
stop_apps() {
    log "Stopping applications..."
    cleanup
}

# Main script logic
case "${1:-start}" in
    "start")
        log "Starting MealInsights applications..."
        
        # Start backend
        if start_backend; then
            # Start frontend
            if start_frontend; then
                success "Both applications started successfully!"
                echo ""
                log "Applications are running at:"
                log "  Backend:  http://localhost:8000"
                log "  Frontend: http://localhost:5173"
                log "  API Docs: http://localhost:8000/docs"
                echo ""
                log "Log files:"
                log "  Backend:  $LOGS_DIR/backend.log"
                log "  Frontend: $LOGS_DIR/frontend.log"
                echo ""
                log "Press Ctrl+C to stop both applications"
                
                # Wait for user interrupt
                while true; do
                    sleep 1
                done
            else
                error "Failed to start frontend"
                cleanup
                exit 1
            fi
        else
            error "Failed to start backend"
            exit 1
        fi
        ;;
    "stop")
        stop_apps
        ;;
    "restart")
        log "Restarting applications..."
        stop_apps
        sleep 2
        exec "$0" start
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
