from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print(f"Attempting to connect to: {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL, echo=True)
    
    with engine.connect() as connection:
        result = connection.execute(text("SELECT @@VERSION"))
        for row in result:
            print(f"\n✅ Connection successful!")
            print(f"SQL Server Version: {row[0]}\n")
            
except Exception as e:
    print(f"\n❌ Connection failed!")
    print(f"Error: {str(e)}\n")