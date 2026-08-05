from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
import stripe
from services.airtable import AirtableService
from services.cv_analysis import CVAnalysisService

load_dotenv()

app = FastAPI(
    title="TalentPulse API",
    description="Backend API for TalentPulse SaaS",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_your-key")

airtable = AirtableService()
cv_analysis = CVAnalysisService()

class UserCreate(BaseModel):
    email: str
    name: Optional[str] = None
    password: str
    company: Optional[str] = None

class EmployeeCreate(BaseModel):
    name: str
    email: str
    role: str
    department: Optional[str] = None

class PostCreate(BaseModel):
    title: Optional[str] = None
    content: str

class CVMatchRequest(BaseModel):
    cv_text: str
    job_description: str

@app.post("/api/auth/signup")
async def signup(user: UserCreate):
    if airtable.get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = pwd_context.hash(user.password)
    airtable.create_user(
        email=user.email,
        name=user.name,
        password=hashed_password,
        company=user.company
    )
    return {"message": "User created successfully"}

@app.post("/api/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = airtable.get_user_by_email(form_data.username)
    if not user or not pwd_context.verify(form_data.password, user["fields"]["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = jwt.encode(
        {"sub": user["fields"]["email"], "id": user["id"]},
        SECRET_KEY,
        algorithm=ALGORITHM,
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": user["id"]}

@app.post("/api/employees")
async def create_employee(employee: EmployeeCreate, request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token.split()[1], SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    airtable.create_employee(
        user_id=user_id,
        name=employee.name,
        email=employee.email,
        role=employee.role,
        department=employee.department
    )
    return {"message": "Employee created successfully"}

@app.get("/api/employees")
async def get_employees(request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token.split()[1], SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    employees = airtable.get_employees(user_id)
    return {"employees": employees}

@app.post("/api/posts")
async def create_post(post: PostCreate, request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"message": "Post created successfully"}

@app.get("/api/posts")
async def get_posts():
    return {"posts": []}

@app.post("/api/cv/match")
async def match_cv(cv_request: CVMatchRequest):
    score = cv_analysis.match_cv_job(cv_request.cv_text, cv_request.job_description)
    return {"match_score": score}

@app.post("/api/cv/skills")
async def extract_skills(cv_text: str):
    skills = cv_analysis.extract_skills(cv_text)
    return {"skills": skills}

@app.post("/api/stripe/create-subscription")
async def create_subscription(plan: str, request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        if plan == "PRO":
            price_id = "price_1U14Sd2KRBaOHP9JJMlDidIV"
        elif plan == "ENTERPRISE":
            price_id = "price_1U14TH2KRBaOHP9JndfF8sWk"
        else:
            raise HTTPException(status_code=400, detail="Invalid plan")
        customer = stripe.Customer.create(email="user@example.com")
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{"price": price_id}],
        )
        return {"subscription_id": subscription.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
