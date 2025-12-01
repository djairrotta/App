"""
Serviço para integração com Z-API WhatsApp Business
"""
import os
import requests
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class WhatsAppService:
    """Serviço para enviar mensagens via Z-API WhatsApp"""
    
    def __init__(self):
        self.api_url = os.environ.get('ZAPI_URL', '')
        self.instance_id = os.environ.get('ZAPI_INSTANCE_ID', '')
        self.api_token = os.environ.get('ZAPI_TOKEN', '')
        self.enabled = bool(self.api_url and self.instance_id and self.api_token)
        
        if not self.enabled:
            logger.warning("Z-API WhatsApp não configurado. Mensagens não serão enviadas.")
    
    def _send_message(self, phone: str, message: str) -> bool:
        """
        Envia mensagem de texto via Z-API
        
        Args:
            phone: Número do WhatsApp (formato: 5511999999999)
            message: Texto da mensagem
            
        Returns:
            True se enviado com sucesso, False caso contrário
        """
        if not self.enabled:
            logger.info(f"[SIMULADO] Mensagem para {phone}: {message}")
            return True
        
        try:
            url = f"{self.api_url}/send-text"
            
            payload = {
                "phone": phone,
                "message": message
            }
            
            headers = {
                "Content-Type": "application/json",
                "Client-Token": self.api_token
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            
            logger.info(f"Mensagem enviada com sucesso para {phone}")
            return True
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao enviar mensagem WhatsApp: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Erro inesperado ao enviar WhatsApp: {str(e)}")
            return False
    
    def enviar_solicitacao_documentos(self, nome: str, phone: str, titulo: str, descricao: str, prazo: Optional[str] = None) -> bool:
        """
        Envia notificação de solicitação de documentos
        """
        # Remove caracteres não numéricos do telefone
        phone_clean = ''.join(filter(str.isdigit, phone))
        
        # Adicionar código do país se não tiver
        if not phone_clean.startswith('55'):
            phone_clean = '55' + phone_clean
        
        prazo_text = f"\n📅 Prazo: {prazo}" if prazo else ""
        
        message = f"""🔔 *SOLICITAÇÃO DE DOCUMENTOS*

Olá, {nome}!

O escritório solicitou o envio dos seguintes documentos:

📋 *{titulo}*

{descricao}{prazo_text}

Por favor, acesse sua área do cliente em nosso site/app e faça o upload dos documentos solicitados.

Qualquer dúvida, estamos à disposição!

_Mensagem automática - Consultar Processos_"""
        
        return self._send_message(phone_clean, message)
    
    def enviar_confirmacao_agendamento(
        self, 
        nome: str, 
        phone: str, 
        data: str, 
        hora: str, 
        tipo: str,
        processo: Optional[str] = None
    ) -> bool:
        """
        Envia confirmação de agendamento de reunião
        """
        # Remove caracteres não numéricos do telefone
        phone_clean = ''.join(filter(str.isdigit, phone))
        
        # Adicionar código do país se não tiver
        if not phone_clean.startswith('55'):
            phone_clean = '55' + phone_clean
        
        tipo_emoji = "💻" if tipo == "online" else "🏢"
        tipo_text = "Online (Videochamada)" if tipo == "online" else "Presencial (No Escritório)"
        
        processo_text = f"\n📄 Processo: {processo}" if processo else ""
        
        message = f"""✅ *REUNIÃO AGENDADA*

Olá, {nome}!

Sua consulta foi agendada com sucesso:

📅 Data: {data}
⏰ Horário: {hora}
{tipo_emoji} Tipo: {tipo_text}{processo_text}

{"O link para a videochamada será enviado próximo ao horário." if tipo == "online" else "O endereço do escritório será confirmado por mensagem."}

Para reagendar ou cancelar, entre em contato conosco.

Até breve!

_Mensagem automática - Consultar Processos_"""
        
        return self._send_message(phone_clean, message)
    
    def enviar_lembrete_aniversario(self, nome: str, phone: str) -> bool:
        """
        Envia mensagem de parabéns de aniversário
        """
        # Remove caracteres não numéricos do telefone
        phone_clean = ''.join(filter(str.isdigit, phone))
        
        # Adicionar código do país se não tiver
        if not phone_clean.startswith('55'):
            phone_clean = '55' + phone_clean
        
        message = f"""🎂🎉 *FELIZ ANIVERSÁRIO!*

Olá, {nome}!

Toda a equipe do escritório deseja um feliz aniversário! 🎈

Que este novo ano seja repleto de conquistas, alegrias e realizações.

Conte sempre conosco!

Um grande abraço,
_Equipe Consultar Processos_"""
        
        return self._send_message(phone_clean, message)


# Instância global do serviço
whatsapp_service = WhatsAppService()
