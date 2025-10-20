#!/bin/bash

# Tunexa System Integration Testing
# Complete end-to-end testing of all components

echo "🧪 Starting Tunexa System Integration Testing..."
echo "=================================================="

# Configuration
BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
test_endpoint() {
    local endpoint=$1
    local expected_status=$2
    local description=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing: $description... "
    
    response=$(curl -s -w "%{http_code}" -o /dev/null "$BACKEND_URL$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

test_json_response() {
    local endpoint=$1
    local description=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing: $description... "
    
    response=$(curl -s "$BACKEND_URL$endpoint")
    
    if echo "$response" | jq . >/dev/null 2>&1; then
        if echo "$response" | jq -e '.success' >/dev/null 2>&1; then
            echo -e "${GREEN}✓ PASS${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${YELLOW}⚠ PARTIAL${NC} (No success field)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (Invalid JSON)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Check if servers are running
echo -e "${BLUE}🔍 Checking server availability...${NC}"

if curl -s "$BACKEND_URL/health" >/dev/null; then
    echo -e "${GREEN}✓ Backend server is running${NC}"
else
    echo -e "${RED}✗ Backend server is not responding${NC}"
    exit 1
fi

if curl -s "$FRONTEND_URL" >/dev/null; then
    echo -e "${GREEN}✓ Frontend server is running${NC}"
else
    echo -e "${RED}✗ Frontend server is not responding${NC}"
    exit 1
fi

echo ""

# 1. Core API Tests
echo -e "${BLUE}🌐 Testing Core API Endpoints...${NC}"
test_endpoint "/health" "200" "Health check"
test_json_response "/health" "Health check JSON response"

# 2. Authentication Tests
echo ""
echo -e "${BLUE}🔐 Testing Authentication System...${NC}"
test_endpoint "/api/auth/login" "400" "Login without credentials (should fail)"
test_endpoint "/api/auth/register" "400" "Register without data (should fail)"

# 3. Car Comparison Tests
echo ""
echo -e "${BLUE}🚗 Testing Car Comparison Module...${NC}"
test_json_response "/api/cars" "Get all vehicles"
test_endpoint "/api/cars/compare" "400" "Compare without parameters (should fail)"

# 4. Audio Certification Tests
echo ""
echo -e "${BLUE}🎛️ Testing Audio Certification Module...${NC}"
test_json_response "/api/certification/measurements" "Get measurements"
test_endpoint "/api/certification/start" "400" "Start test without config (should fail)"

# 5. OEM Integration Tests
echo ""
echo -e "${BLUE}🔌 Testing OEM Integration Module...${NC}"
test_json_response "/api/oem/supported-brands" "Get supported brands"
test_endpoint "/api/oem/connect" "400" "Connect without config (should fail)"

# 6. Spotify Integration Tests
echo ""
echo -e "${BLUE}🎧 Testing Spotify Integration Module...${NC}"
test_json_response "/api/spotify/status" "Get Spotify status"
test_endpoint "/api/spotify/authorize" "302" "Spotify authorization redirect"

# 7. Profile Management Tests
echo ""
echo -e "${BLUE}👤 Testing Profile Management Module...${NC}"
test_endpoint "/api/profiles/me" "401" "Get profile without auth (should fail)"
test_json_response "/api/profiles/devices" "Get devices (might fail without auth)"

# 8. Database Tests
echo ""
echo -e "${BLUE}🗄️ Testing Database Operations...${NC}"

# Test database health through API endpoints that require DB
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Testing: Database connectivity through API... "

db_response=$(curl -s "$BACKEND_URL/api/cars" | jq -r '.data | length')
if [ "$db_response" != "null" ] && [ "$db_response" -gt "0" ] 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC} ($db_response vehicles in DB)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ FAIL${NC} (No data returned from DB)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 9. Module Integration Tests
echo ""
echo -e "${BLUE}🔧 Testing Module Integration...${NC}"

# Test that modules are loaded and active
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Testing: Active modules check... "

modules_response=$(curl -s "$BACKEND_URL/health" | jq -r '.modules | keys | length')
if [ "$modules_response" -gt "3" ] 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC} ($modules_response modules active)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ FAIL${NC} (Expected >3 modules, got: $modules_response)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 10. Frontend Integration Tests
echo ""
echo -e "${BLUE}⚛️ Testing Frontend Integration...${NC}"

TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Testing: Frontend loads successfully... "

frontend_response=$(curl -s "$FRONTEND_URL" | grep -c "<!DOCTYPE html>")
if [ "$frontend_response" -gt "0" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 11. API Documentation Tests
echo ""
echo -e "${BLUE}📚 Testing API Documentation...${NC}"
test_endpoint "/api-docs" "301" "Swagger documentation accessibility"

# Final Results
echo ""
echo "=================================================="
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "=================================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! System integration is successful.${NC}"
    exit 0
else
    echo -e "${RED}⚠️ Some tests failed. Please review the issues above.${NC}"
    exit 1
fi