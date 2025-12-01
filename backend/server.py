from fastapi import FastAPI, APIRouter, HTTPException, Query, Body, UploadFile, File, Form
from fastapi.responses import FileResponse
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
import shutil


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


# ========================================
# SISTEMA DE AGENDAMENTOS
# ========================================

# Modelos
class HorarioDisponivel(BaseModel):
    """Horário disponível para agendamento"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    data: str  # YYYY-MM-DD
    hora_inicio: str  # HH:MM
    hora_fim: str  # HH:MM
    duracao_minutos: int = 60
    disponivel: bool = True
    tipo_permitido: str = "ambos"  # online, presencial, ambos
    observacoes: str = ""
    criado_em: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Agendamento(BaseModel):
    """Agendamento de consulta"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    processo_numero: str
    data: str
    hora_inicio: str
    hora_fim: str
    tipo: str  # online, presencial
    status: str = "agendado"  # agendado, confirmado, concluido, cancelado
    observacoes: str = ""
    origem: str = "site"  # site, whatsapp, manual
    criado_por: str = "cliente"  # cliente, admin
    criado_em: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    atualizado_em: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ========================================
# ENDPOINTS ADMIN - Gerenciar Horários
# ========================================

@api_router.post("/admin/horarios")
async def criar_horario_disponivel(horario: Dict = Body(...)):
    """
    Cria um novo horário disponível (Admin)
    """
    try:
        horario_obj = HorarioDisponivel(**horario)
        await db.horarios_disponiveis.insert_one(horario_obj.dict())
        
        return {
            "success": True,
            "message": "Horário criado com sucesso",
            "horario": horario_obj.dict()
        }
    except Exception as e:
        logger.error(f"Erro ao criar horário: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/horarios")
async def listar_todos_horarios():
    """
    Lista todos os horários (Admin)
    """
    try:
        horarios = await db.horarios_disponiveis.find({}, {"_id": 0}).sort("data", 1).to_list(1000)
        return {
            "success": True,
            "total": len(horarios),
            "horarios": horarios
        }
    except Exception as e:
        logger.error(f"Erro ao listar horários: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/admin/horarios/{horario_id}")
async def atualizar_horario(horario_id: str, dados: Dict = Body(...)):
    """
    Atualiza um horário (Admin)
    """
    try:
        result = await db.horarios_disponiveis.update_one(
            {"id": horario_id},
            {"$set": dados}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Horário não encontrado")
        
        return {"success": True, "message": "Horário atualizado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar horário: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.delete("/admin/horarios/{horario_id}")
async def deletar_horario(horario_id: str):
    """
    Deleta um horário (Admin)
    """
    try:
        result = await db.horarios_disponiveis.delete_one({"id": horario_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Horário não encontrado")
        
        return {"success": True, "message": "Horário deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar horário: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/admin/horarios/lote")
async def criar_horarios_em_lote(dados: Dict = Body(...)):
    """
    Cria múltiplos horários de uma vez (Admin)
    Exemplo: todos os dias úteis de uma semana, de 9h às 18h, com slots de 1h
    """
    try:
        data_inicio = dados.get("data_inicio")  # YYYY-MM-DD
        data_fim = dados.get("data_fim")
        hora_inicio = dados.get("hora_inicio")  # HH:MM
        hora_fim = dados.get("hora_fim")
        duracao_minutos = dados.get("duracao_minutos", 60)
        dias_semana = dados.get("dias_semana", [1, 2, 3, 4, 5])  # 1=Seg, 7=Dom
        tipo_permitido = dados.get("tipo_permitido", "ambos")
        
        horarios_criados = []
        
        # Converte strings para datetime
        inicio = datetime.strptime(data_inicio, "%Y-%m-%d")
        fim = datetime.strptime(data_fim, "%Y-%m-%d")
        
        current = inicio
        while current <= fim:
            # Verifica se é dia da semana permitido (1=Segunda, 7=Domingo)
            if current.isoweekday() in dias_semana:
                # Cria slots de horário para este dia
                hora_atual = datetime.strptime(hora_inicio, "%H:%M")
                hora_limite = datetime.strptime(hora_fim, "%H:%M")
                
                while hora_atual < hora_limite:
                    hora_fim_slot = hora_atual + timedelta(minutes=duracao_minutos)
                    
                    horario = HorarioDisponivel(
                        data=current.strftime("%Y-%m-%d"),
                        hora_inicio=hora_atual.strftime("%H:%M"),
                        hora_fim=hora_fim_slot.strftime("%H:%M"),
                        duracao_minutos=duracao_minutos,
                        tipo_permitido=tipo_permitido
                    )
                    
                    await db.horarios_disponiveis.insert_one(horario.dict())
                    horarios_criados.append(horario.dict())
                    
                    hora_atual = hora_fim_slot
            
            current += timedelta(days=1)
        
        return {
            "success": True,
            "message": f"{len(horarios_criados)} horários criados com sucesso",
            "total": len(horarios_criados)
        }
    
    except Exception as e:
        logger.error(f"Erro ao criar horários em lote: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ========================================
# ENDPOINTS CLIENTE - Consultar e Agendar
# ========================================

@api_router.get("/horarios/disponiveis")
async def listar_horarios_disponiveis(
    data_inicio: str = Query(...),
    data_fim: Optional[str] = Query(None),
    tipo: Optional[str] = Query(None)
):
    """
    Lista horários disponíveis para agendamento (Cliente)
    """
    try:
        query = {
            "disponivel": True,
            "data": {"$gte": data_inicio}
        }
        
        if data_fim:
            query["data"]["$lte"] = data_fim
        
        if tipo and tipo != "ambos":
            query["$or"] = [
                {"tipo_permitido": tipo},
                {"tipo_permitido": "ambos"}
            ]
        
        horarios = await db.horarios_disponiveis.find(query, {"_id": 0}).sort("data", 1).to_list(1000)
        
        return {
            "success": True,
            "total": len(horarios),
            "horarios": horarios
        }
    
    except Exception as e:
        logger.error(f"Erro ao listar horários disponíveis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/agendamentos")
async def criar_agendamento(agendamento: Dict = Body(...)):
    """
    Cria um novo agendamento (Cliente)
    """
    try:
        # Verifica se o horário ainda está disponível
        horario = await db.horarios_disponiveis.find_one({
            "data": agendamento["data"],
            "hora_inicio": agendamento["hora_inicio"],
            "disponivel": True
        })
        
        if not horario:
            raise HTTPException(
                status_code=400,
                detail="Horário não está mais disponível"
            )
        
        # Cria o agendamento
        agendamento_obj = Agendamento(**agendamento)
        await db.agendamentos.insert_one(agendamento_obj.dict())
        
        # Marca o horário como ocupado
        await db.horarios_disponiveis.update_one(
            {"id": horario["id"]},
            {"$set": {"disponivel": False}}
        )
        
        return {
            "success": True,
            "message": "Agendamento realizado com sucesso",
            "agendamento": agendamento_obj.dict()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar agendamento: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/agendamentos/usuario/{user_id}")
async def listar_agendamentos_usuario(user_id: str):
    """
    Lista agendamentos de um usuário
    """
    try:
        agendamentos = await db.agendamentos.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("data", -1).to_list(1000)
        
        return {
            "success": True,
            "total": len(agendamentos),
            "agendamentos": agendamentos
        }
    
    except Exception as e:
        logger.error(f"Erro ao listar agendamentos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/agendamentos")
async def listar_todos_agendamentos():
    """
    Lista todos os agendamentos (Admin)
    """
    try:
        agendamentos = await db.agendamentos.find({}, {"_id": 0}).sort("data", -1).to_list(1000)
        
        return {
            "success": True,
            "total": len(agendamentos),
            "agendamentos": agendamentos
        }
    
    except Exception as e:
        logger.error(f"Erro ao listar todos agendamentos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/admin/agendamentos/{agendamento_id}")
async def atualizar_status_agendamento(agendamento_id: str, dados: Dict = Body(...)):
    """
    Atualiza status de um agendamento (Admin)
    """
    try:
        dados["atualizado_em"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.agendamentos.update_one(
            {"id": agendamento_id},
            {"$set": dados}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Agendamento não encontrado")
        
        # Se foi cancelado, libera o horário
        if dados.get("status") == "cancelado":
            agendamento = await db.agendamentos.find_one({"id": agendamento_id})
            if agendamento:
                await db.horarios_disponiveis.update_one(
                    {
                        "data": agendamento["data"],
                        "hora_inicio": agendamento["hora_inicio"]
                    },
                    {"$set": {"disponivel": True}}
                )
        
        return {"success": True, "message": "Agendamento atualizado com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar agendamento: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/admin/agendamentos/manual")
async def criar_agendamento_manual(dados: Dict = Body(...)):
    """
    Cria agendamento manual pelo admin (via WhatsApp, telefone, etc)
    """
    try:
        dados["origem"] = "manual"
        dados["criado_por"] = "admin"
        
        agendamento_obj = Agendamento(**dados)
        await db.agendamentos.insert_one(agendamento_obj.dict())
        
        # Marca horário como ocupado
        await db.horarios_disponiveis.update_one(
            {
                "data": dados["data"],
                "hora_inicio": dados["hora_inicio"]
            },
            {"$set": {"disponivel": False}}
        )
        
        return {
            "success": True,
            "message": "Agendamento manual criado com sucesso",
            "agendamento": agendamento_obj.dict()
        }
    
    except Exception as e:
        logger.error(f"Erro ao criar agendamento manual: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ========================================
# SISTEMA DE SOLICITAÇÃO DE DOCUMENTOS
# ========================================

# Criar pasta para armazenar documentos
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class SolicitacaoDocumento(BaseModel):
    """Solicitação de documento"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    solicitado_por: str = "admin"
    titulo: str
    descricao: str
    prazo: Optional[str] = None
    status: str = "pendente"  # pendente, enviado, aprovado, rejeitado
    criado_em: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    atualizado_em: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Documento(BaseModel):
    """Documento enviado"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    solicitacao_id: str
    user_id: str
    user_name: str
    filename: str
    filepath: str
    file_size: int
    file_type: str
    observacoes: Optional[str] = None
    enviado_em: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@api_router.post("/admin/solicitacoes-documento")
async def criar_solicitacao_documento(dados: Dict = Body(...)):
    """
    Admin solicita documentos a um cliente
    """
    try:
        solicitacao = SolicitacaoDocumento(**dados)
        await db.solicitacoes_documento.insert_one(solicitacao.dict())
        
        return {
            "success": True,
            "message": "Solicitação enviada com sucesso",
            "solicitacao": solicitacao.dict()
        }
    except Exception as e:
        logger.error(f"Erro ao criar solicitação: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/solicitacoes-documento/usuario/{user_id}")
async def listar_solicitacoes_usuario(user_id: str):
    """
    Lista solicitações de documentos de um usuário
    """
    try:
        solicitacoes = await db.solicitacoes_documento.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("criado_em", -1).to_list(1000)
        
        return {
            "success": True,
            "total": len(solicitacoes),
            "solicitacoes": solicitacoes
        }
    except Exception as e:
        logger.error(f"Erro ao listar solicitações: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/solicitacoes-documento")
async def listar_todas_solicitacoes():
    """
    Lista todas as solicitações (Admin)
    """
    try:
        solicitacoes = await db.solicitacoes_documento.find(
            {},
            {"_id": 0}
        ).sort("criado_em", -1).to_list(1000)
        
        return {
            "success": True,
            "total": len(solicitacoes),
            "solicitacoes": solicitacoes
        }
    except Exception as e:
        logger.error(f"Erro ao listar solicitações: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/documentos/upload")
async def upload_documento(
    solicitacao_id: str = Form(...),
    user_id: str = Form(...),
    user_name: str = Form(...),
    observacoes: Optional[str] = Form(None),
    file: UploadFile = File(...)
):
    """
    Cliente envia documento
    """
    try:
        # Criar pasta do usuário
        user_folder = UPLOAD_DIR / user_id
        user_folder.mkdir(exist_ok=True)
        
        # Gerar nome único para o arquivo
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = user_folder / unique_filename
        
        # Salvar arquivo
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Obter tamanho do arquivo
        file_size = file_path.stat().st_size
        
        # Criar registro do documento
        documento = Documento(
            solicitacao_id=solicitacao_id,
            user_id=user_id,
            user_name=user_name,
            filename=file.filename,
            filepath=str(file_path),
            file_size=file_size,
            file_type=file.content_type or "unknown",
            observacoes=observacoes
        )
        
        await db.documentos.insert_one(documento.dict())
        
        # Atualizar status da solicitação
        await db.solicitacoes_documento.update_one(
            {"id": solicitacao_id},
            {
                "$set": {
                    "status": "enviado",
                    "atualizado_em": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {
            "success": True,
            "message": "Documento enviado com sucesso",
            "documento": documento.dict()
        }
    
    except Exception as e:
        logger.error(f"Erro ao fazer upload: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/documentos/solicitacao/{solicitacao_id}")
async def listar_documentos_solicitacao(solicitacao_id: str):
    """
    Lista documentos de uma solicitação
    """
    try:
        documentos = await db.documentos.find(
            {"solicitacao_id": solicitacao_id},
            {"_id": 0}
        ).to_list(1000)
        
        return {
            "success": True,
            "total": len(documentos),
            "documentos": documentos
        }
    except Exception as e:
        logger.error(f"Erro ao listar documentos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/documentos/usuario/{user_id}")
async def listar_documentos_usuario(user_id: str):
    """
    Lista todos os documentos de um usuário
    """
    try:
        documentos = await db.documentos.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("enviado_em", -1).to_list(1000)
        
        return {
            "success": True,
            "total": len(documentos),
            "documentos": documentos
        }
    except Exception as e:
        logger.error(f"Erro ao listar documentos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/documentos/download/{documento_id}")
async def download_documento(documento_id: str):
    """
    Faz download de um documento
    """
    try:
        documento = await db.documentos.find_one({"id": documento_id})
        
        if not documento:
            raise HTTPException(status_code=404, detail="Documento não encontrado")
        
        file_path = Path(documento["filepath"])
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Arquivo não encontrado")
        
        return FileResponse(
            path=str(file_path),
            filename=documento["filename"],
            media_type=documento["file_type"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao fazer download: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/admin/solicitacoes-documento/{solicitacao_id}/status")
async def atualizar_status_solicitacao(solicitacao_id: str, dados: Dict = Body(...)):
    """
    Atualiza status de uma solicitação (Admin)
    """
    try:
        dados["atualizado_em"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.solicitacoes_documento.update_one(
            {"id": solicitacao_id},
            {"$set": dados}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Solicitação não encontrada")
        
        return {"success": True, "message": "Status atualizado com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar status: {str(e)}")
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