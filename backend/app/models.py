from sqlalchemy import *
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    LIBRARIAN = "librarian"
    MEMBER = "member"

class LoanStatus(str, enum.Enum):
    ACTIVE = "active"
    RETURNED = "returned"
    OVERDUE = "overdue"

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="member")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Author(Base):
    __tablename__ = "authors"
    
    author_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    bio = Column(Text)
    country = Column(String(50))
    
    books = relationship("Book", back_populates="author")

class Category(Base):
    __tablename__ = "categories"
    
    category_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)
    
    books = relationship("Book", back_populates="category")

class Book(Base):
    __tablename__ = "books"
    
    book_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False, index=True)
    isbn = Column(String(13), unique=True, index=True)
    author_id = Column(Integer, ForeignKey("authors.author_id"))
    category_id = Column(Integer, ForeignKey("categories.category_id"))
    description = Column(Text)
    cover_image_url = Column(String(500))
    quantity_total = Column(Integer, default=1)
    quantity_available = Column(Integer, default=1)
    publication_year = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    author = relationship("Author", back_populates="books")
    category = relationship("Category", back_populates="books")
    loans = relationship("Loan", back_populates="book")

class Loan(Base):
    __tablename__ = "loans"
    
    loan_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    book_id = Column(Integer, ForeignKey("books.book_id"))
    loan_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime)
    status = Column(String(20), default="active")
    fine_amount = Column(Numeric(10, 2), default=0.00)
    
    user = relationship("User", back_populates="loans")
    book = relationship("Book", back_populates="loans")