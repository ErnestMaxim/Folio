from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
from app.database import get_db, engine, Base
from app import models, schemas, crud, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Folio - Library Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Authentication Routes ====================

@app.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if username already exists
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login to get access token"""
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=schemas.Token)
def login_json(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login with JSON payload to get access token"""
    user = auth.authenticate_user(db, user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    """Get current user information"""
    return current_user

# ==================== User Routes ====================

@app.get("/users", response_model=List[schemas.UserResponse])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "librarian"]))
):
    """Get all users (Admin/Librarian only)"""
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific user"""
    db_user = crud.get_user_by_id(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# ==================== Author Routes ====================

@app.post("/authors", response_model=schemas.AuthorResponse, status_code=status.HTTP_201_CREATED)
def create_author(
    author: schemas.AuthorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "librarian"]))
):
    """Create a new author (Admin/Librarian only)"""
    return crud.create_author(db=db, author=author)

@app.get("/authors", response_model=List[schemas.AuthorResponse])
def read_authors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all authors"""
    authors = crud.get_authors(db, skip=skip, limit=limit)
    return authors

@app.get("/authors/{author_id}", response_model=schemas.AuthorResponse)
def read_author(author_id: int, db: Session = Depends(get_db)):
    """Get a specific author"""
    db_author = crud.get_author(db, author_id=author_id)
    if db_author is None:
        raise HTTPException(status_code=404, detail="Author not found")
    return db_author

# ==================== Category Routes ====================

@app.post("/categories", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "librarian"]))
):
    """Create a new category (Admin/Librarian only)"""
    return crud.create_category(db=db, category=category)

@app.get("/categories", response_model=List[schemas.CategoryResponse])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all categories"""
    categories = crud.get_categories(db, skip=skip, limit=limit)
    return categories

@app.get("/categories/{category_id}", response_model=schemas.CategoryResponse)
def read_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific category"""
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

# ==================== Book Routes ====================

@app.post("/books", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    book: schemas.BookCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "librarian"]))
):
    """Create a new book (Admin/Librarian only)"""
    return crud.create_book(db=db, book=book)

@app.get("/books", response_model=List[schemas.BookResponse])
def read_books(skip: int = 0, limit: int = 100, search: str = None, db: Session = Depends(get_db)):
    """Get all books with optional search"""
    books = crud.get_books(db, skip=skip, limit=limit, search=search)
    return books

@app.get("/books/{book_id}", response_model=schemas.BookResponse)
def read_book(book_id: int, db: Session = Depends(get_db)):
    """Get a specific book"""
    db_book = crud.get_book(db, book_id=book_id)
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return db_book

# ==================== Loan Routes ====================

@app.post("/loans", response_model=schemas.LoanResponse, status_code=status.HTTP_201_CREATED)
def create_loan(
    loan: schemas.LoanCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new loan (borrow a book)"""
    db_loan = crud.create_loan(db=db, user_id=current_user.user_id, loan=loan)
    if db_loan is None:
        raise HTTPException(status_code=400, detail="Book not available")
    return db_loan

@app.get("/loans/my-loans", response_model=List[schemas.LoanResponse])
def read_my_loans(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get current user's loans"""
    loans = crud.get_user_loans(db, user_id=current_user.user_id, skip=skip, limit=limit)
    return loans

@app.get("/loans", response_model=List[schemas.LoanResponse])
def read_all_loans(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "librarian"]))
):
    """Get all active loans (Admin/Librarian only)"""
    loans = crud.get_active_loans(db, skip=skip, limit=limit)
    return loans

@app.put("/loans/{loan_id}/return", response_model=schemas.LoanResponse)
def return_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Return a borrowed book"""
    db_loan = crud.return_book(db, loan_id=loan_id)
    if db_loan is None:
        raise HTTPException(status_code=400, detail="Loan not found or already returned")
    return db_loan

# ==================== Root Route ====================

@app.get("/")
def root():
    """API root endpoint"""
    return {
        "message": "Welcome to Folio Library Management System API",
        "version": "1.0",
        "docs": "/docs"
    }