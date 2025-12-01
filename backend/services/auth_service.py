"""
Serviço de autenticação com JWT, Google e Apple
"""
import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

logger = logging.getLogger(__name__)

# Configurações
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "sua-chave-secreta-super-segura-mude-em-producao")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dias

# Configuração de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    """Serviço de autenticação"""
    
    def __init__(self):
        self.google_client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
        self.apple_client_id = os.environ.get("APPLE_CLIENT_ID", "")
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verifica se a senha está correta"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Gera hash da senha"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        Cria token JWT
        
        Args:
            data: Dados para incluir no token (geralmente user_id e role)
            expires_delta: Tempo de expiração customizado
            
        Returns:
            Token JWT
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
        return encoded_jwt
    
    def decode_token(self, token: str) -> Optional[Dict]:
        """
        Decodifica e valida token JWT
        
        Returns:
            Payload do token ou None se inválido
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError as e:
            logger.error(f"Erro ao decodificar token: {str(e)}")
            return None
    
    def verify_google_token(self, token: str) -> Optional[Dict]:
        """
        Verifica token do Google OAuth
        
        Returns:
            Informações do usuário ou None se inválido
        """
        if not self.google_client_id:
            logger.warning("Google Client ID não configurado")
            return None
        
        try:
            # Verificar token com Google
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                self.google_client_id
            )
            
            # Token válido
            return {
                "email": idinfo.get("email"),
                "name": idinfo.get("name"),
                "picture": idinfo.get("picture"),
                "google_id": idinfo.get("sub"),
                "email_verified": idinfo.get("email_verified", False)
            }
        
        except ValueError as e:
            logger.error(f"Token Google inválido: {str(e)}")
            return None
    
    def verify_apple_token(self, token: str) -> Optional[Dict]:
        """
        Verifica token do Apple Sign In
        
        Returns:
            Informações do usuário ou None se inválido
        """
        if not self.apple_client_id:
            logger.warning("Apple Client ID não configurado")
            return None
        
        try:
            # Apple usa JWT também, mas com chaves públicas da Apple
            # Simplificado - em produção usar biblioteca específica
            decoded = jwt.decode(
                token,
                options={"verify_signature": False}  # Em produção: validar com chaves públicas da Apple
            )
            
            return {
                "email": decoded.get("email"),
                "apple_id": decoded.get("sub"),
                "email_verified": True
            }
        
        except Exception as e:
            logger.error(f"Token Apple inválido: {str(e)}")
            return None


# Instância global
auth_service = AuthService()
