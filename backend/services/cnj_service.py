"""
Serviço para integração com a API DataJud do CNJ
"""
import os
import requests
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class CNJService:
    """Serviço para consultar processos através da API DataJud do CNJ"""
    
    def __init__(self):
        self.api_key = os.environ.get('CNJ_API_KEY')
        self.base_url = os.environ.get('CNJ_API_BASE_URL', 'https://api-publica.datajud.cnj.jus.br')
        self.headers = {
            'Authorization': f'APIKey {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        # Mapeamento de tribunais para endpoints
        self.tribunal_endpoints = {
            'TRF3': 'api_publica_trf3',
            'TJSP': 'api_publica_tjsp',
            'TRT15': 'api_publica_trt15',
            'TJM': 'api_publica_tjm',  # Verificar se existe
            'STJ': 'api_publica_stj',
            'TST': 'api_publica_tst',
        }
    
    def _make_request(self, tribunal: str, payload: Dict) -> Optional[Dict]:
        """
        Faz uma requisição à API do CNJ
        
        Args:
            tribunal: Código do tribunal (ex: TRF3, TJSP)
            payload: Corpo da requisição (query Elasticsearch)
            
        Returns:
            Resposta da API em formato dict ou None em caso de erro
        """
        try:
            endpoint = self.tribunal_endpoints.get(tribunal.upper())
            if not endpoint:
                logger.error(f"Tribunal {tribunal} não encontrado no mapeamento")
                return None
            
            url = f"{self.base_url}/{endpoint}/_search"
            logger.info(f"Consultando CNJ: {url}")
            
            response = requests.post(url, json=payload, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            return response.json()
        
        except requests.exceptions.Timeout:
            logger.error(f"Timeout ao consultar tribunal {tribunal}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao consultar CNJ para tribunal {tribunal}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao consultar CNJ: {str(e)}")
            return None
    
    def buscar_processo_por_numero(self, numero_processo: str, tribunal: str) -> Optional[Dict]:
        """
        Busca um processo específico pelo número
        
        Args:
            numero_processo: Número do processo (formato CNJ: 0000000-00.0000.0.00.0000)
            tribunal: Código do tribunal (ex: TRF3, TJSP)
            
        Returns:
            Dados do processo ou None se não encontrado
        """
        # Remove caracteres especiais do número do processo para busca
        numero_limpo = numero_processo.replace('-', '').replace('.', '')
        
        payload = {
            "query": {
                "match": {
                    "numeroProcesso": numero_limpo
                }
            },
            "size": 1
        }
        
        result = self._make_request(tribunal, payload)
        
        if result and result.get('hits', {}).get('hits'):
            return self._format_processo(result['hits']['hits'][0])
        
        return None
    
    def buscar_processos_por_parte(self, nome_parte: str, tribunal: str, tipo_parte: str = 'ambos') -> List[Dict]:
        """
        Busca processos onde uma pessoa/empresa é parte
        
        Args:
            nome_parte: Nome da parte (pessoa ou empresa)
            tribunal: Código do tribunal
            tipo_parte: 'ativo', 'passivo' ou 'ambos'
            
        Returns:
            Lista de processos encontrados
        """
        if tipo_parte == 'ambos':
            payload = {
                "query": {
                    "bool": {
                        "should": [
                            {"match": {"dadosBasicos.polo.parts": nome_parte}},
                        ]
                    }
                },
                "size": 50
            }
        else:
            campo = "dadosBasicos.poloAtivo" if tipo_parte == 'ativo' else "dadosBasicos.poloPassivo"
            payload = {
                "query": {
                    "match": {
                        campo: nome_parte
                    }
                },
                "size": 50
            }
        
        result = self._make_request(tribunal, payload)
        
        if result and result.get('hits', {}).get('hits'):
            return [self._format_processo(hit) for hit in result['hits']['hits']]
        
        return []
    
    def buscar_movimentacoes(self, numero_processo: str, tribunal: str) -> List[Dict]:
        """
        Busca as movimentações de um processo
        
        Args:
            numero_processo: Número do processo
            tribunal: Código do tribunal
            
        Returns:
            Lista de movimentações
        """
        processo = self.buscar_processo_por_numero(numero_processo, tribunal)
        
        if processo and 'movimentos' in processo:
            return processo['movimentos']
        
        return []
    
    def _format_processo(self, hit: Dict) -> Dict:
        """
        Formata os dados do processo retornados pela API
        
        Args:
            hit: Hit do Elasticsearch
            
        Returns:
            Processo formatado
        """
        source = hit.get('_source', {})
        dados_basicos = source.get('dadosBasicos', {})
        movimentos = source.get('movimentos', [])
        
        # Formata as partes
        polo_ativo = []
        polo_passivo = []
        
        # Tenta extrair partes dos dados
        if 'polo' in dados_basicos:
            for polo in dados_basicos['polo']:
                if polo.get('polo') == 'Ativo':
                    polo_ativo.extend([p.get('nome', '') for p in polo.get('parts', [])])
                elif polo.get('polo') == 'Passivo':
                    polo_passivo.extend([p.get('nome', '') for p in polo.get('parts', [])])
        
        # Formata movimentações
        movimentos_formatados = []
        for mov in movimentos[:50]:  # Limita a 50 movimentações mais recentes
            movimentos_formatados.append({
                'data': mov.get('dataHora', ''),
                'descricao': mov.get('complementoNacional', {}).get('nome', mov.get('nome', '')),
                'codigo': mov.get('codigoNacional', ''),
            })
        
        return {
            'numeroProcesso': dados_basicos.get('numero', ''),
            'tribunal': source.get('tribunal', ''),
            'classe': dados_basicos.get('classeProcessual', {}).get('nome', ''),
            'assunto': dados_basicos.get('assunto', [{}])[0].get('nome', '') if dados_basicos.get('assunto') else '',
            'dataAjuizamento': dados_basicos.get('dataAjuizamento', ''),
            'orgaoJulgador': dados_basicos.get('orgaoJulgador', {}).get('nome', ''),
            'parteAtiva': ', '.join(polo_ativo) if polo_ativo else 'Não informado',
            'partePassiva': ', '.join(polo_passivo) if polo_passivo else 'Não informado',
            'movimentos': movimentos_formatados,
            'nivelSigilo': dados_basicos.get('nivelSigilo', 0),
            'raw_data': source  # Dados completos para análises futuras
        }
    
    def listar_tribunais_disponiveis(self) -> List[str]:
        """
        Retorna lista de tribunais disponíveis na API
        
        Returns:
            Lista de códigos de tribunais
        """
        return list(self.tribunal_endpoints.keys())


# Instância global do serviço
cnj_service = CNJService()
