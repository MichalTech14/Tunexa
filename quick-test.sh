#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║              🎵 TUNEXA API COMPREHENSIVE TEST 🎵                  ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

API="http://localhost:3000"
PASS=0
FAIL=0

test_endpoint() {
    local name="$1"
    local endpoint="$2"
    local expected_code="${3:-200}"
    
    echo "Testing: $name"
    echo "Endpoint: $endpoint"
    
    start=$(date +%s%N)
    response=$(curl -s -w "\n%{http_code}" "$API$endpoint")
    end=$(date +%s%N)
    
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -1)
    latency=$(( (end - start) / 1000000 ))
    
    if [ "$http_code" = "$expected_code" ]; then
        echo "✅ Status: $http_code (Expected: $expected_code)"
        echo "⚡ Latency: ${latency}ms"
        if [ $latency -lt 50 ]; then
            echo "📊 Rating: ⚡ EXCELLENT"
        elif [ $latency -lt 100 ]; then
            echo "📊 Rating: ✅ GOOD"
        else
            echo "📊 Rating: ⚠️  ACCEPTABLE"
        fi
        echo "📦 Response: $(echo "$body" | head -c 100)..."
        PASS=$((PASS + 1))
    else
        echo "❌ FAIL: Got $http_code, expected $expected_code"
        echo "Response: $body"
        FAIL=$((FAIL + 1))
    fi
    echo "─────────────────────────────────────────────────────────────────"
    echo ""
}

echo "Starting tests..."
echo "════════════════════════════════════════════════════════════════════"
echo ""

# Test 1: Health Check
test_endpoint "Health Check" "/api/health" 200

# Test 2: Root endpoint
test_endpoint "Root API Info" "/" 200

# Test 3: Car List
test_endpoint "Car Database List" "/api/cars" 200

# Test 4: Status endpoint
test_endpoint "Engine Status" "/api/status" 200

# Test 5: Car comparison
test_endpoint "Car Comparison" "/api/compare?car1=bmw-3-series&car2=mercedes-benz-e-class" 200

# Test 6: Audio certification
test_endpoint "Audio Certification" "/api/certify/bmw-3-series" 200

# Test 7: Dashboard
test_endpoint "Dashboard Page" "/dashboard" 200

# Test 8: Test page
test_endpoint "Test Page" "/test" 200

echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                         TEST SUMMARY                              ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo "📊 Total:  $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED!"
    echo "✅ Tunexa API is FULLY FUNCTIONAL"
else
    echo "⚠️  Some tests failed"
    echo "Please review the output above"
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
