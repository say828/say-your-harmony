#!/bin/bash
# Simple test script for the REST API endpoints

BASE_URL="http://localhost:3000"

echo "Testing REST API Endpoints"
echo "=========================="
echo ""

# Check if server is running
echo "1. Health Check"
curl -s -X GET "$BASE_URL/health" | jq '.' || echo "Server not running"
echo ""

echo "2. Create Todo #1"
curl -s -X POST "$BASE_URL/todos" \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn TypeScript", "description": "Study TypeScript fundamentals"}' | jq '.'
echo ""

echo "3. Create Todo #2"
curl -s -X POST "$BASE_URL/todos" \
  -H "Content-Type: application/json" \
  -d '{"title": "Build REST API", "description": "Create Express.js server with SQLite"}' | jq '.'
echo ""

echo "4. Get All Todos"
curl -s -X GET "$BASE_URL/todos" | jq '.'
echo ""

echo "5. Get Todo by ID (1)"
curl -s -X GET "$BASE_URL/todos/1" | jq '.'
echo ""

echo "6. Update Todo #1 (mark as completed)"
curl -s -X PUT "$BASE_URL/todos/1" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}' | jq '.'
echo ""

echo "7. Get Completed Todos"
curl -s -X GET "$BASE_URL/todos?completed=true" | jq '.'
echo ""

echo "8. Delete Todo #2"
curl -s -X DELETE "$BASE_URL/todos/2" -w "\nHTTP Status: %{http_code}\n"
echo ""

echo "9. Get All Todos (after deletion)"
curl -s -X GET "$BASE_URL/todos" | jq '.'
echo ""

echo "10. Test Validation (missing title)"
curl -s -X POST "$BASE_URL/todos" \
  -H "Content-Type: application/json" \
  -d '{"description": "No title provided"}' | jq '.'
echo ""

echo "11. Test 404 (non-existent todo)"
curl -s -X GET "$BASE_URL/todos/999" | jq '.'
echo ""

echo "Tests Complete!"
