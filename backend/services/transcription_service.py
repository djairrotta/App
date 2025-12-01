"""
Serviço de transcrição de áudio
Suporta OpenAI Whisper, Google Speech-to-Text, ou serviço local
"""
import os
import logging
from pathlib import Path
from typing import Optional
import requests

logger = logging.getLogger(__name__)

class TranscriptionService:
    """Serviço para transcrever áudios"""
    
    def __init__(self):
        self.openai_api_key = os.environ.get('OPENAI_API_KEY', '')
        self.emergent_api_key = os.environ.get('EMERGENT_LLM_KEY', '')
        self.use_openai = bool(self.openai_api_key or self.emergent_api_key)
        
        if not self.use_openai:
            logger.warning("API de transcrição não configurada. Transcrições não serão realizadas.")
    
    def transcribe_audio(self, audio_file_path: str) -> Optional[str]:
        """
        Transcreve áudio usando OpenAI Whisper API
        
        Args:
            audio_file_path: Caminho do arquivo de áudio
            
        Returns:
            Texto transcrito ou None se falhar
        """
        if not self.use_openai:
            logger.info("[SIMULADO] Transcrição de áudio não disponível")
            return "[Transcrição não disponível - Configure OPENAI_API_KEY ou EMERGENT_LLM_KEY]"
        
        try:
            # Usar Emergent LLM Key se disponível, senão OpenAI direta
            api_key = self.emergent_api_key if self.emergent_api_key else self.openai_api_key
            
            url = "https://api.openai.com/v1/audio/transcriptions"
            
            headers = {
                "Authorization": f"Bearer {api_key}"
            }
            
            with open(audio_file_path, 'rb') as audio_file:
                files = {
                    'file': audio_file,
                    'model': (None, 'whisper-1'),
                    'language': (None, 'pt')  # Português
                }
                
                response = requests.post(url, headers=headers, files=files, timeout=60)
                response.raise_for_status()
                
                result = response.json()
                transcription = result.get('text', '')
                
                logger.info(f"Áudio transcrito com sucesso: {Path(audio_file_path).name}")
                return transcription
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao transcrever áudio: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado na transcrição: {str(e)}")
            return None
    
    def transcribe_with_metadata(self, audio_file_path: str) -> dict:
        """
        Transcreve áudio e retorna com metadados
        """
        transcription = self.transcribe_audio(audio_file_path)
        
        file_path = Path(audio_file_path)
        
        return {
            "success": transcription is not None,
            "transcription": transcription,
            "filename": file_path.name,
            "file_size": file_path.stat().st_size if file_path.exists() else 0,
            "error": None if transcription else "Falha na transcrição"
        }


# Instância global
transcription_service = TranscriptionService()
