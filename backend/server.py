from fastapi import FastAPI, APIRouter, HTTPException, Query, Body
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from services.cnj_service import cnj_service


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ========================================
# ENDPOINTS CNJ DataJud API
# ========================================

@api_router.get("/cnj/tribunais")
async def listar_tribunais():
    """Lista os tribunais disponíveis na API do CNJ"""
    try:
        tribunais = cnj_service.listar_tribunais_disponiveis()
        return {
            "success": True,
            "tribunais": tribunais
        }
    except Exception as e:
        logger.error(f"Erro ao listar tribunais: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/cnj/processo")
async def buscar_processo(
    numero: str = Query(..., description="Número do processo no formato CNJ"),
    tribunal: str = Query(..., description="Código do tribunal (ex: TJSP, TRF3)")
):
    """
    Busca um processo específico pelo número na API do CNJ
    
    Exemplo: /api/cnj/processo?numero=0000000-00.0000.0.00.0000&tribunal=TJSP
    """
    try:
        logger.info(f"Buscando processo {numero} no tribunal {tribunal}")
        
        processo = cnj_service.buscar_processo_por_numero(numero, tribunal)
        
        if not processo:
            raise HTTPException(
                status_code=404, 
                detail=f"Processo {numero} não encontrado no tribunal {tribunal}"
            )
        
        return {
            "success": True,
            "processo": processo
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar processo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/cnj/processos/parte")
async def buscar_processos_por_parte(
    nome: str = Query(..., description="Nome da parte"),
    tribunal: str = Query(..., description="Código do tribunal"),
    tipo: str = Query("ambos", description="Tipo de parte: ativo, passivo ou ambos")
):
    """
    Busca processos onde uma pessoa/empresa é parte
    
    Exemplo: /api/cnj/processos/parte?nome=João Silva&tribunal=TJSP&tipo=ambos
    """
    try:
        logger.info(f"Buscando processos de {nome} no tribunal {tribunal}")
        
        processos = cnj_service.buscar_processos_por_parte(nome, tribunal, tipo)
        
        return {
            "success": True,
            "total": len(processos),
            "processos": processos
        }
    
    except Exception as e:
        logger.error(f"Erro ao buscar processos por parte: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/cnj/processo/movimentacoes")
async def buscar_movimentacoes(
    numero: str = Query(..., description="Número do processo"),
    tribunal: str = Query(..., description="Código do tribunal")
):
    """
    Busca as movimentações de um processo específico
    
    Exemplo: /api/cnj/processo/movimentacoes?numero=0000000-00.0000.0.00.0000&tribunal=TJSP
    """
    try:
        logger.info(f"Buscando movimentações do processo {numero} no tribunal {tribunal}")
        
        movimentacoes = cnj_service.buscar_movimentacoes(numero, tribunal)
        
        return {
            "success": True,
            "total": len(movimentacoes),
            "movimentacoes": movimentacoes
        }
    
    except Exception as e:
        logger.error(f"Erro ao buscar movimentações: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/cnj/processo/monitorar")
async def adicionar_processo_monitoramento(
    numero_processo: str,
    tribunal: str,
    user_id: str
):
    """
    Adiciona um processo para monitoramento automático
    """
    try:
        # Primeiro, busca o processo na API do CNJ para validar
        processo = cnj_service.buscar_processo_por_numero(numero_processo, tribunal)
        
        if not processo:
            raise HTTPException(
                status_code=404,
                detail="Processo não encontrado na API do CNJ"
            )
        
        # Salva no MongoDB para monitoramento
        processo_doc = {
            "user_id": user_id,
            "numero_processo": numero_processo,
            "tribunal": tribunal,
            "dados_processo": processo,
            "ativo": True,
            "criado_em": datetime.now(timezone.utc).isoformat(),
            "ultima_atualizacao": datetime.now(timezone.utc).isoformat()
        }
        
        result = await db.processos_monitorados.insert_one(processo_doc)
        
        return {
            "success": True,
            "message": "Processo adicionado ao monitoramento com sucesso",
            "processo_id": str(result.inserted_id)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao adicionar processo ao monitoramento: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/cnj/processos/monitorados")
async def listar_processos_monitorados(user_id: str = Query(...)):
    """
    Lista todos os processos monitorados de um usuário
    """
    try:
        processos = await db.processos_monitorados.find(
            {"user_id": user_id, "ativo": True},
            {"_id": 0}
        ).to_list(1000)
        
        return {
            "success": True,
            "total": len(processos),
            "processos": processos
        }
    
    except Exception as e:
        logger.error(f"Erro ao listar processos monitorados: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()