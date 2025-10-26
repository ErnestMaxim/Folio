# Import key modules to make them accessible when importing `app`
from .database import Base, engine, get_db
from .models import User, Book, Author, Category, Loan
from .schemas import UserCreate, UserResponse, AuthorCreate, AuthorResponse, CategoryCreate, CategoryResponse, BookCreate, BookResponse, LoanCreate, LoanResponse
from .crud import create_user, get_user_by_username, get_user_by_email, create_author, get_authors, create_category, get_categories, create_book, get_books, create_loan, return_book
from .auth import get_password_hash, verify_password, create_access_token, get_current_active_user, require_role