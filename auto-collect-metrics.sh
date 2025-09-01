#!/bin/bash

# Auto-Collect Metrics Script
# Automated data collection for crosspost performance monitoring
# Usage: ./auto-collect-metrics.sh [interval_minutes]

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/auto-collect.log"
METRICS_FILE="$SCRIPT_DIR/crosspost-metrics.json"
MONITOR_SCRIPT="$SCRIPT_DIR/crosspost-monitor.js"
INTERVAL_MINUTES=${1:-30}  # Default 30 minutes if not specified

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
handle_error() {
    log "❌ ERROR: $1"
    echo -e "${RED}ERROR: $1${NC}"
    exit 1
}

# Success logging
log_success() {
    log "✅ SUCCESS: $1"
    echo -e "${GREEN}SUCCESS: $1${NC}"
}

# Warning logging
log_warning() {
    log "⚠️  WARNING: $1"
    echo -e "${YELLOW}WARNING: $1${NC}"
}

# Info logging
log_info() {
    log "ℹ️  INFO: $1"
    echo -e "${BLUE}INFO: $1${NC}"
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        handle_error "Node.js is not installed or not in PATH"
    fi
    
    if [ ! -f "$MONITOR_SCRIPT" ]; then
        handle_error "Monitor script not found at $MONITOR_SCRIPT"
    fi
    
    if ! node -e "require('fs')" 2>/dev/null; then
        handle_error "Node.js fs module not available"
    fi
    
    log_success "Dependencies check passed"
}

# Collect metrics
collect_metrics() {
    log_info "Starting metrics collection..."
    
    # Run the metrics collection
    if node "$MONITOR_SCRIPT" collect >> "$LOG_FILE" 2>&1; then
        log_success "Metrics collection completed"
        return 0
    else
        log_warning "Metrics collection failed or returned warnings"
        return 1
    fi
}

# Generate report
generate_report() {
    log_info "Generating performance report..."
    
    if node "$MONITOR_SCRIPT" report >> "$LOG_FILE" 2>&1; then
        log_success "Performance report generated"
        return 0
    else
        log_warning "Report generation failed"
        return 1
    fi
}

# Check metrics file age
check_metrics_freshness() {
    if [ -f "$METRICS_FILE" ]; then
        # Get file modification time in seconds since epoch
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            FILE_TIME=$(stat -f %m "$METRICS_FILE")
        else
            # Linux
            FILE_TIME=$(stat -c %Y "$METRICS_FILE")
        fi
        
        CURRENT_TIME=$(date +%s)
        AGE_SECONDS=$((CURRENT_TIME - FILE_TIME))
        AGE_MINUTES=$((AGE_SECONDS / 60))
        
        if [ $AGE_MINUTES -gt $((INTERVAL_MINUTES * 2)) ]; then
            log_warning "Metrics file is $AGE_MINUTES minutes old (stale data)"
            return 1
        else
            log_info "Metrics file is $AGE_MINUTES minutes old (fresh)"
            return 0
        fi
    else
        log_warning "Metrics file does not exist"
        return 1
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    local issues=0
    
    # Check if metrics file exists and is readable
    if [ ! -r "$METRICS_FILE" ]; then
        log_warning "Metrics file is not readable or does not exist"
        ((issues++))
    fi
    
    # Check disk space
    local disk_usage=$(df "$SCRIPT_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        log_warning "Disk usage is high: ${disk_usage}%"
        ((issues++))
    fi
    
    # Check log file size
    if [ -f "$LOG_FILE" ]; then
        local log_size=$(wc -c < "$LOG_FILE")
        if [ "$log_size" -gt 10485760 ]; then  # 10MB
            log_warning "Log file is large (${log_size} bytes), consider rotating"
            ((issues++))
        fi
    fi
    
    if [ $issues -eq 0 ]; then
        log_success "Health check passed"
        return 0
    else
        log_warning "Health check found $issues issue(s)"
        return 1
    fi
}

# Cleanup old logs
cleanup_logs() {
    if [ -f "$LOG_FILE" ]; then
        local log_lines=$(wc -l < "$LOG_FILE")
        if [ "$log_lines" -gt 1000 ]; then
            log_info "Rotating log file (${log_lines} lines)"
            tail -500 "$LOG_FILE" > "${LOG_FILE}.tmp"
            mv "${LOG_FILE}.tmp" "$LOG_FILE"
            log_success "Log file rotated"
        fi
    fi
}

# Main execution function
run_collection_cycle() {
    log_info "Starting collection cycle (interval: ${INTERVAL_MINUTES} minutes)"
    
    # Health check
    health_check
    
    # Check if we need to collect new metrics
    if ! check_metrics_freshness; then
        log_info "Metrics need updating, collecting fresh data..."
        collect_metrics
    else
        log_info "Metrics are fresh, skipping collection"
    fi
    
    # Generate report periodically (every 4 cycles)
    local cycle_file="$SCRIPT_DIR/.collection_cycle"
    local cycle_count=0
    
    if [ -f "$cycle_file" ]; then
        cycle_count=$(cat "$cycle_file")
    fi
    
    cycle_count=$((cycle_count + 1))
    echo "$cycle_count" > "$cycle_file"
    
    if [ $((cycle_count % 4)) -eq 0 ]; then
        log_info "Generating periodic report (cycle $cycle_count)"
        generate_report
    fi
    
    # Cleanup
    cleanup_logs
    
    log_success "Collection cycle completed"
}

# Continuous monitoring mode
start_continuous_monitoring() {
    log_info "Starting continuous monitoring mode (every ${INTERVAL_MINUTES} minutes)"
    log_info "Press Ctrl+C to stop"
    
    # Create PID file
    echo $$ > "$SCRIPT_DIR/.monitor_pid"
    
    # Trap signals for graceful shutdown
    trap 'log_info "Stopping continuous monitoring..."; rm -f "$SCRIPT_DIR/.monitor_pid"; exit 0' INT TERM
    
    while true; do
        run_collection_cycle
        log_info "Sleeping for ${INTERVAL_MINUTES} minutes..."
        sleep $((INTERVAL_MINUTES * 60))
    done
}

# Stop continuous monitoring
stop_monitoring() {
    local pid_file="$SCRIPT_DIR/.monitor_pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log_info "Stopping monitoring process (PID: $pid)"
            kill "$pid"
            rm -f "$pid_file"
            log_success "Monitoring stopped"
        else
            log_warning "Process $pid not found, cleaning up PID file"
            rm -f "$pid_file"
        fi
    else
        log_warning "No monitoring process found"
    fi
}

# Check if monitoring is running
check_monitoring_status() {
    local pid_file="$SCRIPT_DIR/.monitor_pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}Monitoring is running (PID: $pid)${NC}"
            return 0
        else
            echo -e "${RED}PID file exists but process not running${NC}"
            rm -f "$pid_file"
            return 1
        fi
    else
        echo -e "${YELLOW}Monitoring is not running${NC}"
        return 1
    fi
}

# Display usage
usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [minutes]    Start continuous monitoring (default: 30 minutes)"
    echo "  stop              Stop continuous monitoring"
    echo "  status            Check monitoring status"
    echo "  once              Run collection once and exit"
    echo "  health            Run health check only"
    echo ""
    echo "Examples:"
    echo "  $0 start 15       # Start monitoring every 15 minutes"
    echo "  $0 once           # Run collection once"
    echo "  $0 health         # Check system health"
}

# Main script logic
main() {
    # Create log file if it doesn't exist
    touch "$LOG_FILE"
    
    case "${1:-start}" in
        start)
            INTERVAL_MINUTES=${2:-30}
            check_dependencies
            start_continuous_monitoring
            ;;
        stop)
            stop_monitoring
            ;;
        status)
            check_monitoring_status
            ;;
        once)
            INTERVAL_MINUTES=${2:-30}
            check_dependencies
            run_collection_cycle
            ;;
        health)
            check_dependencies
            health_check
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            echo "Unknown command: $1"
            usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
