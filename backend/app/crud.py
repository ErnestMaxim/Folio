from sqlalchemy.orm import Session
from sqlalchemy import or_
from app import models, schemas, auth
from datetime import datetime, timedelta
from typing import Optional

# User CRUD operations
def get_user_by_username(db: Session, username: str):
    """Get a user by username"""
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    """Get a user by email"""
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    """Get a user by ID"""
    return db.query(models.User).filter(models.User.user_id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    """Create a new user"""
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        role="member"  # Default role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Get all users with pagination"""
    return db.query(models.User).offset(skip).limit(limit).all()

# Author CRUD operations
def get_author(db: Session, author_id: int):
    """Get an author by ID"""
    return db.query(models.Author).filter(models.Author.author_id == author_id).first()

def get_authors(db: Session, skip: int = 0, limit: int = 100):
    """Get all authors with pagination"""
    return db.query(models.Author).offset(skip).limit(limit).all()

def create_author(db: Session, author: schemas.AuthorCreate):
    """Create a new author"""
    db_author = models.Author(**author.dict())
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author

# Category CRUD operations
def get_category(db: Session, category_id: int):
    """Get a category by ID"""
    return db.query(models.Category).filter(models.Category.category_id == category_id).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    """Get all categories with pagination"""
    return db.query(models.Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: schemas.CategoryCreate):
    """Create a new category"""
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# Book CRUD operations
def get_book(db: Session, book_id: int):
    """Get a book by ID"""
    return db.query(models.Book).filter(models.Book.book_id == book_id).first()

def get_books(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    """Get all books with pagination and optional search"""
    query = db.query(models.Book)
    
    if search:
        query = query.filter(
            or_(
                models.Book.title.ilike(f"%{search}%"),
                models.Book.isbn.ilike(f"%{search}%")
            )
        )
    
    return query.offset(skip).limit(limit).all()

def create_book(db: Session, book: schemas.BookCreate):
    """Create a new book"""
    db_book = models.Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

def update_book_quantity(db: Session, book_id: int, change: int):
    """Update book available quantity"""
    book = get_book(db, book_id)
    if book:
        book.quantity_available += change
        db.commit()
        db.refresh(book)
    return book

# Loan CRUD operations
def get_loan(db: Session, loan_id: int):
    """Get a loan by ID"""
    return db.query(models.Loan).filter(models.Loan.loan_id == loan_id).first()

def get_user_loans(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get all loans for a user"""
    return db.query(models.Loan).filter(models.Loan.user_id == user_id).offset(skip).limit(limit).all()

def get_active_loans(db: Session, skip: int = 0, limit: int = 100):
    """Get all active loans"""
    return db.query(models.Loan).filter(models.Loan.status == "active").offset(skip).limit(limit).all()

def create_loan(db: Session, user_id: int, loan: schemas.LoanCreate, days: int = 14):
    """Create a new loan"""
    book = get_book(db, loan.book_id)
    
    if not book or book.quantity_available <= 0:
        return None
    
    due_date = datetime.utcnow() + timedelta(days=days)
    
    db_loan = models.Loan(
        user_id=user_id,
        book_id=loan.book_id,
        due_date=due_date,
        status="active"
    )
    
    # Decrease available quantity
    update_book_quantity(db, loan.book_id, -1)
    
    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)
    return db_loan

def return_book(db: Session, loan_id: int):
    """Return a book"""
    loan = get_loan(db, loan_id)
    
    if not loan or loan.status != "active":
        return None
    
    loan.return_date = datetime.utcnow()
    loan.status = "returned"
    
    # Calculate fine if overdue
    if loan.return_date > loan.due_date:
        days_overdue = (loan.return_date - loan.due_date).days
        loan.fine_amount = days_overdue * 0.50  # $0.50 per day
    
    # Increase available quantity
    update_book_quantity(db, loan.book_id, 1)
    
    db.commit()
    db.refresh(loan)
    return loan