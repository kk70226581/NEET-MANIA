# Solnut NEET CBT Platform - API Documentation

Complete API reference for Solnut backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer {token}
```

---

## 🔐 Authentication Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "9876543210",
  "class": "12"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "statistics": {
      "totalTestsTaken": 5,
      "totalAccuracy": 82.5,
      "bestScore": 580,
      "studyStreak": 7
    }
  }
}
```

### Update Profile

```http
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "preferences": {
    "languagePreference": "english",
    "darkMode": false
  }
}
```

### Change Password

```http
PUT /auth/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

---

## 📚 Question Endpoints

### Get All Questions

```http
GET /questions?subject=physics&chapter=Modern Physics&difficulty=medium&page=1&limit=20
```

**Query Parameters:**
- `subject`: physics, chemistry, botany, zoology
- `chapter`: Chapter name
- `topic`: Topic name
- `difficulty`: easy, medium, hard
- `source`: pyq, mock, dpp
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "question_id",
      "questionText": "What is...?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "subject": "physics",
      "chapter": "Modern Physics",
      "difficulty": "medium",
      "type": "mcq",
      "estimatedTime": 45
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 8
  }
}
```

### Get Single Question

```http
GET /questions/{questionId}
```

### Create Question (Admin Only)

```http
POST /questions
Authorization: Bearer {token}
Content-Type: application/json

{
  "questionText": "What is the formula for kinetic energy?",
  "options": {
    "A": "E = mc²",
    "B": "KE = ½mv²",
    "C": "F = ma",
    "D": "P = mgh"
  },
  "correctAnswer": "B",
  "explanation": "Kinetic energy is given by...",
  "subject": "physics",
  "chapter": "Work Energy and Power",
  "topic": "Energy",
  "difficulty": "easy",
  "source": "pyq"
}
```

### Publish Question (Admin Only)

```http
PUT /questions/{questionId}/publish
Authorization: Bearer {token}
```

### Upload PDF (Admin Only)

```http
POST /questions/upload-pdf
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "pdf": [binary_file],
  "subject": "physics",
  "chapter": "Modern Physics",
  "source": "pyq"
}
```

---

## 🧪 Test Endpoints

### Generate Test

```http
POST /tests/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "testType": "full_mock",
  "subject": "physics",
  "chapter": "Modern Physics",
  "questionCount": 30,
  "difficulty": ["easy", "medium", "hard"],
  "source": "pyq"
}
```

**testType options:**
- `full_mock` - 180 questions, 180 minutes (NTA format)
- `subject_test` - 60 questions, 90 minutes
- `chapter_test` - 30 questions, 45 minutes
- `topic_test` - 15 questions, 30 minutes
- `pyq_test` - Previous year questions

**Response (201):**
```json
{
  "success": true,
  "message": "Test generated successfully",
  "data": {
    "testId": "test_id_123",
    "questionCount": 180,
    "timeLimit": 180
  }
}
```

### Get Test Details

```http
GET /tests/{testId}
Authorization: Bearer {token}
```

### Get Test Questions

```http
GET /tests/{testId}/questions
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "testId": "test_id",
    "totalQuestions": 180,
    "totalTime": 180,
    "questions": [
      {
        "_id": "q_id",
        "questionText": "...",
        "options": { "A": "...", "B": "...", ... },
        "type": "mcq",
        "estimatedTime": 45
      }
    ]
  }
}
```

### Start Test Attempt

```http
POST /tests/{testId}/start
Authorization: Bearer {token}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Test started",
  "data": {
    "attemptId": "attempt_id",
    "totalTime": 180
  }
}
```

### Save Response

```http
PUT /tests/attempts/{attemptId}/response
Authorization: Bearer {token}
Content-Type: application/json

{
  "questionId": "question_id",
  "selectedOption": "B",
  "markedForReview": false,
  "timeSpent": 45
}
```

### Submit Test

```http
PUT /tests/attempts/{attemptId}/submit
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Test submitted successfully",
  "data": {
    "attemptId": "attempt_id",
    "score": 520,
    "accuracy": "82.50",
    "totalTime": 178
  }
}
```

### Get Test Results

```http
GET /tests/attempts/{attemptId}/results
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "score": 520,
    "maxScore": 720,
    "accuracy": "82.50",
    "analysis": "AI-generated analysis...",
    "questionsAttempted": 156,
    "questionsCorrect": 128,
    "questionsWrong": 28,
    "questionsSkipped": 24,
    "averageTimePerQuestion": "68.46",
    "rankPrediction": 45000
  }
}
```

### Get User Attempts

```http
GET /tests/attempts?page=1&limit=10
Authorization: Bearer {token}
```

---

## ✅ Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Not authorized for this action"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔄 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Successful request |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## 📝 Rate Limiting

- 100 requests per minute per IP
- API keys have higher limits

---

## 🧪 Testing with cURL

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "class": "12"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Questions

```bash
curl -X GET "http://localhost:5000/api/questions?subject=physics&limit=5" \
  -H "Authorization: Bearer {token}"
```

---

For more help, check the [Setup Guide](../SETUP_GUIDE.md)
