"""
Serviço de armazenamento e organização de arquivos por cliente
"""
import os
import logging
from pathlib import Path
from datetime import datetime
import shutil
import json
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class StorageService:
    """Gerencia armazenamento de arquivos por cliente"""
    
    def __init__(self):
        self.base_dir = Path("/app/backend/storage")
        self.base_dir.mkdir(exist_ok=True)
    
    def _normalize_name(self, name: str) -> str:
        """
        Normaliza nome para usar como nome de pasta
        Remove caracteres especiais e substitui espaços
        """
        import unicodedata
        import re
        
        # Remove acentos
        name = unicodedata.normalize('NFKD', name)
        name = name.encode('ASCII', 'ignore').decode('ASCII')
        
        # Remove caracteres especiais, mantém apenas letras, números e espaços
        name = re.sub(r'[^\w\s-]', '', name)
        
        # Substitui espaços por underscores
        name = name.replace(' ', '_')
        
        # Remove múltiplos underscores
        name = re.sub(r'_+', '_', name)
        
        return name.lower()
    
    def get_client_folder(self, client_id: str, client_name: str) -> Path:
        """
        Retorna ou cria a pasta do cliente
        Formato: storage/{client_id}_{nome_normalizado}/
        """
        folder_name = f"{client_id}_{self._normalize_name(client_name)}"
        client_folder = self.base_dir / folder_name
        client_folder.mkdir(exist_ok=True)
        
        # Criar subpastas
        (client_folder / "documentos").mkdir(exist_ok=True)
        (client_folder / "whatsapp").mkdir(exist_ok=True)
        (client_folder / "whatsapp" / "audios").mkdir(exist_ok=True)
        (client_folder / "whatsapp" / "transcricoes").mkdir(exist_ok=True)
        (client_folder / "whatsapp" / "imagens").mkdir(exist_ok=True)
        (client_folder / "whatsapp" / "documentos").mkdir(exist_ok=True)
        (client_folder / "reunioes").mkdir(exist_ok=True)
        (client_folder / "atendimentos").mkdir(exist_ok=True)
        (client_folder / "backup_conversas").mkdir(exist_ok=True)
        
        return client_folder
    
    def save_whatsapp_message(
        self, 
        client_id: str, 
        client_name: str, 
        message_data: Dict
    ) -> str:
        """
        Salva mensagem do WhatsApp no backup de conversas
        """
        client_folder = self.get_client_folder(client_id, client_name)
        backup_folder = client_folder / "backup_conversas"
        
        # Arquivo de backup (JSON com todas as mensagens)
        backup_file = backup_folder / "conversas.json"
        
        # Carregar conversas existentes
        conversas = []
        if backup_file.exists():
            with open(backup_file, 'r', encoding='utf-8') as f:
                conversas = json.load(f)
        
        # Adicionar nova mensagem
        conversas.append({
            "timestamp": datetime.now().isoformat(),
            "data": message_data
        })
        
        # Salvar
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(conversas, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Mensagem salva no backup de {client_name}")
        return str(backup_file)
    
    def save_whatsapp_audio(
        self, 
        client_id: str, 
        client_name: str, 
        audio_data: bytes,
        filename: str,
        transcription: Optional[str] = None
    ) -> Dict[str, str]:
        """
        Salva áudio do WhatsApp e sua transcrição
        """
        client_folder = self.get_client_folder(client_id, client_name)
        
        # Salvar áudio
        audio_folder = client_folder / "whatsapp" / "audios"
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        audio_filename = f"{timestamp}_{filename}"
        audio_path = audio_folder / audio_filename
        
        with open(audio_path, 'wb') as f:
            f.write(audio_data)
        
        result = {
            "audio_path": str(audio_path),
            "transcription_path": None
        }
        
        # Salvar transcrição se disponível
        if transcription:
            transcription_folder = client_folder / "whatsapp" / "transcricoes"
            transcription_filename = f"{timestamp}_{Path(filename).stem}.txt"
            transcription_path = transcription_folder / transcription_filename
            
            with open(transcription_path, 'w', encoding='utf-8') as f:
                f.write(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
                f.write(f"Arquivo de áudio: {audio_filename}\n")
                f.write("=" * 50 + "\n\n")
                f.write(transcription)
            
            result["transcription_path"] = str(transcription_path)
            logger.info(f"Áudio transcrito e salvo para {client_name}")
        
        return result
    
    def save_whatsapp_image(
        self, 
        client_id: str, 
        client_name: str, 
        image_data: bytes,
        filename: str
    ) -> str:
        """
        Salva imagem recebida pelo WhatsApp
        """
        client_folder = self.get_client_folder(client_id, client_name)
        image_folder = client_folder / "whatsapp" / "imagens"
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_filename = f"{timestamp}_{filename}"
        image_path = image_folder / image_filename
        
        with open(image_path, 'wb') as f:
            f.write(image_data)
        
        logger.info(f"Imagem salva para {client_name}: {image_filename}")
        return str(image_path)
    
    def save_whatsapp_document(
        self, 
        client_id: str, 
        client_name: str, 
        document_data: bytes,
        filename: str
    ) -> str:
        """
        Salva documento recebido pelo WhatsApp
        """
        client_folder = self.get_client_folder(client_id, client_name)
        doc_folder = client_folder / "whatsapp" / "documentos"
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        doc_filename = f"{timestamp}_{filename}"
        doc_path = doc_folder / doc_filename
        
        with open(doc_path, 'wb') as f:
            f.write(document_data)
        
        logger.info(f"Documento salvo para {client_name}: {doc_filename}")
        return str(doc_path)
    
    def save_meeting_record(
        self, 
        client_id: str, 
        client_name: str, 
        meeting_data: Dict
    ) -> str:
        """
        Salva registro de reunião
        """
        client_folder = self.get_client_folder(client_id, client_name)
        meeting_folder = client_folder / "reunioes"
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        meeting_file = meeting_folder / f"reuniao_{timestamp}.json"
        
        with open(meeting_file, 'w', encoding='utf-8') as f:
            json.dump(meeting_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Registro de reunião salvo para {client_name}")
        return str(meeting_file)
    
    def list_client_files(self, client_id: str, client_name: str) -> Dict[str, List[str]]:
        """
        Lista todos os arquivos de um cliente organizados por tipo
        """
        client_folder = self.get_client_folder(client_id, client_name)
        
        result = {
            "documentos": [],
            "whatsapp_audios": [],
            "whatsapp_transcricoes": [],
            "whatsapp_imagens": [],
            "whatsapp_documentos": [],
            "reunioes": [],
            "atendimentos": []
        }
        
        # Listar documentos
        doc_folder = client_folder / "documentos"
        if doc_folder.exists():
            result["documentos"] = [f.name for f in doc_folder.iterdir() if f.is_file()]
        
        # Listar WhatsApp
        whatsapp_folders = {
            "audios": "whatsapp_audios",
            "transcricoes": "whatsapp_transcricoes",
            "imagens": "whatsapp_imagens",
            "documentos": "whatsapp_documentos"
        }
        
        for folder_name, result_key in whatsapp_folders.items():
            folder = client_folder / "whatsapp" / folder_name
            if folder.exists():
                result[result_key] = [f.name for f in folder.iterdir() if f.is_file()]
        
        # Listar reuniões
        meeting_folder = client_folder / "reunioes"
        if meeting_folder.exists():
            result["reunioes"] = [f.name for f in meeting_folder.iterdir() if f.is_file()]
        
        # Listar atendimentos
        atendimento_folder = client_folder / "atendimentos"
        if atendimento_folder.exists():
            result["atendimentos"] = [f.name for f in atendimento_folder.iterdir() if f.is_file()]
        
        return result


# Instância global
storage_service = StorageService()
