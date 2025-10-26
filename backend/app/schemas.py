from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    user_id: int
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserInDB(UserResponse):
    password_hash: str

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Author Schemas
class AuthorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    bio: Optional[str] = None
    country: Optional[str] = None

class AuthorCreate(AuthorBase):
    pass

class AuthorResponse(AuthorBase):
    author_id: int
    
    class Config:
        from_attributes = True

# Category Schemas
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    category_id: int
    
    class Config:
        from_attributes = True

# Book Schemas
class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    isbn: Optional[str] = Field(None, max_length=13)
    author_id: int
    category_id: int
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    quantity_total: int = Field(default=1, ge=0)
    quantity_available: int = Field(default=1, ge=0)
    publication_year: Optional[int] = None

class BookCreate(BookBase):
    pass

class BookResponse(BookBase):
    book_id: int
    created_at: datetime
    author: Optional[AuthorResponse] = None
    category: Optional[CategoryResponse] = None
    
    class Config:
        from_attributes = True

# Loan Schemas
class LoanBase(BaseModel):
    book_id: int

class LoanCreate(LoanBase):
    pass

class LoanResponse(LoanBase):
    loan_id: int
    user_id: int
    loan_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    status: str
    fine_amount: float
    
    class Config:
        from_attributes = True