# API Documentation

## AgriPredictAI Backend API

### Base URL
```
http://localhost:8000
```

### Authentication
All API endpoints require JWT authentication token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints by Feature

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout user

#### Profile
- `GET /api/profile` - Get farmer profile
- `PUT /api/profile` - Update farmer profile
- `DELETE /api/profile` - Delete profile

#### Data
- `POST /api/data/upload` - Upload crop data
- `GET /api/data/historical` - Get historical data
- `GET /api/data/export` - Export data

#### Prediction
- `POST /api/prediction/price` - Get price prediction
- `GET /api/prediction/confidence` - Get confidence score
- `GET /api/prediction/history` - Get prediction history

#### Feasibility
- `POST /api/feasibility/analyze` - Analyze crop feasibility
- `GET /api/feasibility/score` - Get feasibility score
- `GET /api/feasibility/factors` - Get feasibility factors

#### Profit
- `POST /api/profit/estimate` - Estimate profit
- `POST /api/profit/compare` - Compare profit across crops
- `GET /api/profit/factors` - Get profitability factors

#### Risk
- `POST /api/risk/assess` - Assess crop risk
- `GET /api/risk/factors` - Get risk factors
- `GET /api/risk/mitigation` - Get mitigation strategies

#### Recommendation
- `POST /api/recommendation/get` - Get crop recommendations
- `GET /api/recommendation/personalized` - Get personalized recommendations
- `GET /api/recommendation/reasons` - Get recommendation reasons

#### Simulation
- `POST /api/simulation/run` - Run scenario simulation
- `POST /api/simulation/compare` - Compare scenarios
- `GET /api/simulation/results` - Export simulation results

#### Alerts
- `POST /api/alert/create` - Create alert rule
- `GET /api/alert/active` - Get active alerts
- `PUT /api/alert/update` - Update alert rule
- `DELETE /api/alert/delete` - Delete alert rule

#### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/charts` - Get dashboard charts data

### Response Format
All responses use JSON format:
```json
{
  "status": "success|error",
  "data": {},
  "message": "Response message"
}
```

### Error Codes
- 200 - OK
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 404 - Not Found
- 500 - Internal Server Error
