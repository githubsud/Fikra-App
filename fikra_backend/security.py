# fikra_backend/security.py

from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext

# Create a CryptContext object for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# =================================================================
# NEW: JWT Token Configuration
# =================================================================

# This is a secret key. In a real application, this MUST be loaded
# from an environment variable and should be a long, random string.
SECRET_KEY = "a_very_secret_key_for_fikra_app__change_it_later"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Creates a new JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# =================================================================
# Existing Password Hashing Functions
# =================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a plain password."""
    return pwd_context.hash(password)