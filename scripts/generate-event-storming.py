"""Gera quadros SVG, Mermaid e um visualizador HTML offline a partir do catálogo versionado."""
from pathlib import Path
import json, textwrap, html
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/ddd/event-storming'
OUT.mkdir(parents=True, exist_ok=True)

events = [
 ('C01','WorkshopRegistered','Oficina cadastrada','Workshop','cadastro'),
 ('C02','CustomerRegistered','Cliente cadastrado','Customer','cadastro'),
 ('C03','CustomerContactChanged','Contato do cliente alterado','Customer','cadastro'),
 ('C04','VehicleRegistered','Veículo vinculado ao cliente','Vehicle','cadastro'),
 ('C05','VehicleDetailsChanged','Dados do veículo alterados','Vehicle','cadastro'),
 ('C06','ServiceRegistered','Serviço cadastrado','Service','cadastro'),
 ('C07','ServicePriceChanged','Preço do serviço alterado','Service','cadastro'),
 ('C08','ServiceDeactivated','Serviço desativado','Service','cadastro'),
 ('C09','PartRegistered','Peça cadastrada com saldo inicial','Part','cadastro'),
 ('C10','PartPriceChanged','Preço da peça alterado','Part','cadastro'),
 ('C11','MinimumStockChanged','Estoque mínimo alterado','Part','cadastro'),
 ('C12','PartDeactivated','Peça desativada','Part','cadastro'),
 ('E01','WorkOrderReceived','OS recebida','WorkOrder','evento'),
 ('E02','QuoteCalculated','Orçamento calculado','WorkOrder','evento'),
 ('E03','DiagnosisStarted','Diagnóstico iniciado','WorkOrder','evento'),
 ('E04','QuoteSubmitted','Orçamento apresentado','WorkOrder','evento'),
 ('E05','QuoteApproved','Orçamento aprovado','WorkOrder','evento'),
 ('E06','QuoteRejected','Orçamento rejeitado','WorkOrder','evento'),
 ('E07','ExecutionStarted','Execução iniciada','WorkOrder','evento'),
 ('E08','AdditionalRepairProposed','Reparo adicional proposto','WorkOrder','evento'),
 ('E09','ExecutionPaused','Execução pausada','WorkOrder','evento'),
 ('E10','QuoteRevised','Orçamento revisado','WorkOrder','evento'),
 ('E11','ExecutionResumed','Execução retomada','WorkOrder','evento'),
 ('E12','RepairFinished','Reparo finalizado','WorkOrder','evento'),
 ('E13','VehicleDelivered','Veículo entregue','WorkOrder','evento'),
 ('E14','StockReceived','Entrada de estoque registrada','Part','evento'),
 ('E15','StockWithdrawn','Saída manual registrada','Part','evento'),
 ('E16','PartsConsumed','Peças consumidas na OS','Part','evento'),
 ('E17','MinimumStockReached','Estoque mínimo atingido','Part','evento'),
]
# Uma linha por intenção. O comando é enviado pelo ator e processado pelo agregado.
rows = [
 ('Operação da oficina','Administrador','Dados da oficina','Cadastrar oficina','Workshop','C01','Nome/endereço válidos; documento válido','CreateWorkshop'),
 ('Relacionamento com clientes','Atendente','Cadastro de clientes','Cadastrar cliente','Customer','C02','CPF/CNPJ válido e único','CreateCustomer'),
 ('Relacionamento com clientes','Atendente','Cadastro de clientes','Alterar contato','Customer','C03','Preservar identidade do cliente','UpdateCustomer'),
 ('Relacionamento com clientes','Atendente','Veículos do cliente','Vincular veículo','Vehicle','C04','Cliente existente; placa válida e única','CreateVehicle'),
 ('Relacionamento com clientes','Atendente','Veículos do cliente','Alterar dados do veículo','Vehicle','C05','Ano válido; preservar dono e placa','UpdateVehicle'),
 ('Catálogo de serviços','Administrador','Catálogo de serviços','Cadastrar serviço','Service','C06','Preço ≥ 0; duração > 0','CreateService'),
 ('Catálogo de serviços','Administrador','Catálogo de serviços','Alterar preço do serviço','Service','C07','Money em centavos; OS mantém snapshot','UpdateService'),
 ('Catálogo de serviços','Administrador','Catálogo de serviços','Desativar serviço','Service','C08','Bloquear novas inclusões; manter histórico','DeactivateService'),
 ('Peças e estoque','Estoquista','Catálogo e saldo','Cadastrar peça','Part','C09','SKU único; saldo inicial ≥ 0','CreatePart'),
 ('Peças e estoque','Administrador','Catálogo e saldo','Alterar preço da peça','Part','C10','Money; não alterar preço da OS existente','UpdatePart'),
 ('Peças e estoque','Estoquista','Catálogo e saldo','Definir estoque mínimo','Part','C11','Mínimo ≥ 0','UpdatePart'),
 ('Peças e estoque','Estoquista','Saldo e movimentações','Receber estoque','Part','E14','Quantidade > 0; motivo válido; registrar movimento','ReceiveStock'),
 ('Peças e estoque','Estoquista','Saldo e movimentações','Retirar estoque','Part','E15','Saldo não negativo; registrar movimento','WithdrawStock'),
 ('Peças e estoque','Administrador','Catálogo e saldo','Desativar peça','Part','C12','Bloquear novos usos e consumo','DeactivatePart'),
 ('Atendimento e reparo','Atendente','Cliente, veículo e catálogo','Receber OS','WorkOrder','E01,E02','Veículo do cliente; itens ativos; disponibilidade inicial','CreateWorkOrder'),
 ('Atendimento e reparo','Equipe técnica','Fila de OS recebidas','Iniciar diagnóstico','WorkOrder','E03','RECEIVED → DIAGNOSIS','StartDiagnosis'),
 ('Atendimento e reparo','Equipe técnica','Detalhe da OS e orçamento','Apresentar orçamento','WorkOrder','E04','DIAGNOSIS → AWAITING_APPROVAL','SubmitQuote'),
 ('Atendimento e reparo','Cliente','Acompanhamento público','Aprovar orçamento','WorkOrder','E05,E07','Versão atual; estoque validado na transação; só então executar','ApproveQuote'),
 ('Atendimento e reparo','Cliente','Acompanhamento público','Rejeitar orçamento','WorkOrder','E06','Registrar decisão; não baixar estoque; continuar aguardando','RejectQuote'),
 ('Atendimento e reparo','Equipe técnica','Detalhe da OS em execução','Propor reparo adicional','WorkOrder','E08,E09,E10,E04','IN_PROGRESS; incrementar versão; pausar; nova aprovação','ProposeAdditionalRepair'),
 ('Atendimento e reparo','Cliente','Orçamento revisado público','Aprovar orçamento revisado','WorkOrder','E05,E11','Baixar somente itens pendentes; preservar decisões anteriores','ApproveQuote'),
 ('Atendimento e reparo','Equipe técnica','Fila de OS em execução','Finalizar reparo','WorkOrder','E12','IN_PROGRESS → FINISHED','FinishRepair'),
 ('Atendimento e reparo','Atendente','OS finalizadas','Registrar entrega','WorkOrder','E13','FINISHED → DELIVERED','RecordDelivery'),
 ('Peças e estoque','Política de aprovação','Itens pendentes da OS','Consumir peças aprovadas','Part','E16,E17','Mesmo UnitOfWork; locks por ID; saldo não negativo','ApproveQuote / Part.consumeForWorkOrder'),
]
hotspots = [
 ('H01','Reserva ou conferência?','Decidido: criação confere; não reserva. Aprovação confere novamente e consome atomicamente.'),
 ('H02','Rejeição cancela a OS?','Decidido: mantém AWAITING_APPROVAL, registra decisão e não consome estoque. Cancelamento não está no MVP.'),
 ('H03','Qual orçamento foi aprovado?','Decidido: decisões guardam versão e total. quoteVersion enviado pelo cliente rejeita versão antiga; campo ainda opcional por compatibilidade.'),
 ('H04','Reparo adicional pode executar?','Decidido: pausa e incrementa versão. Aprovação nova consome apenas peças ainda não consumidas.'),
 ('H05','Duas OS disputam a última peça?','Decidido: lock, versão otimista de Part e rollback conjunto de OS, saldo, movimentos e eventos.'),
 ('H06','Como o cliente é notificado?','Em aberto: não há email/SMS. O orçamento e o progresso são consultados pelo código público.'),
 ('H07','Como medir a execução?','Decidido: primeira aprovação até finalização, incluindo pausas. Não representa só horas de trabalho ativo.'),
 ('H08','A oficina possui várias unidades?','Em aberto: Workshop é cadastro único lógico; OS ainda não possui workshopId. Multiunidade não está implementada.'),
]
concepts = {
 'WorkOrder': ('WorkOrderItem, QuoteDecision, StatusChange','TrackingCode, Quote, QuoteVersion, Money, Quantity'),
 'Customer': ('raiz Customer','TaxDocument'), 'Vehicle': ('raiz Vehicle','VehiclePlate'),
 'Service': ('raiz Service','Money'), 'Part': ('InventoryMovement','Money, StockBalance, Quantity'),
 'Workshop': ('raiz Workshop','TaxDocument'), 'AdminUser': ('raiz AdminUser','nenhum VO de credencial próprio'),
}
colors = {'EV':'#ffca28','CMD':'#00c5cf','AT':'#fff8ae','AG':'#fff2a1','ML':'#76d66c','POL':'#e58be8','PA':'#ff6c88','ENT':'#e7f0ff','VO':'#e7ddff','D':'#dfadfa'}
titles = ['Descoberta livre','Linha do tempo','Pontos de atenção e decisões','Eventos pivotais','Atores e comandos','Modelos de leitura e políticas','Agregados, entidades e objetos de valor','Bounded contexts e integrações']
subtitles = [
 '29 fatos do domínio: comece pela linguagem do negócio, sem ordenar nem escolher classes.',
 'Ordene o caminho principal e separe rejeição, reparo adicional e movimentos de estoque.',
 'Associe perguntas a decisões explícitas; mantenha questões abertas visíveis.',
 'Marque as mudanças de fase: OS recebida, orçamento aprovado e reparo finalizado.',
 'O ator expressa uma intenção; o handler chama o comportamento que pode aceitar ou rejeitar o comando.',
 'A leitura ajuda o ator a decidir. Políticas descrevem as condições e reações do processo.',
 'A raiz protege a unidade de consistência e controla suas entidades internas e objetos de valor.',
 'Cada contexto possui uma linguagem/modelo. O monólito integra OS e estoque de forma síncrona e transacional.'
]
byid = {e[0]:e for e in events}
catalog = {'events':[dict(zip(['id','name','label','aggregate','persistence'],e)) for e in events],
 'commands':[dict(zip(['context','actor','readModel','command','aggregate','eventIds','policy','handler'],r)) for r in rows],
 'hotspots':[{'id':h[0],'question':h[1],'decision':h[2]} for h in hotspots]}
(OUT/'catalogo.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')

class Board:
 def __init__(self,stage,width,height):
  self.width=width;self.height=height;self.parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title-{stage} desc-{stage}"><title id="title-{stage}">Etapa {stage}: {titles[stage-1]}</title><desc id="desc-{stage}">{html.escape(subtitles[stage-1])}</desc><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10" fill="#334155"/></marker></defs><rect width="100%" height="100%" fill="#fcfcf9"/>']
  self.text(38,44,f'{stage:02d} / EVENT STORMING · OFICINA',16,'#64748b')
  self.text(38,82,titles[stage-1],30)
  self.text(38,112,subtitles[stage-1],16,'#475569')
  x=38
  for kind in ['EV','CMD','AT','AG','ML','POL','PA','ENT','VO','D']:
   self.parts.append(f'<rect x="{x}" y="136" width="46" height="25" rx="3" fill="{colors[kind]}" stroke="#64748b"/>');self.text(x+8,154,kind,12);x+=64
  self.text(690,153,'E = evento registrado · C = fato de cadastro (sem envelope) · ★ = pivotal',13,'#475569')
 def text(self,x,y,t,size=16,color='#172033',weight=400):
  self.parts.append(f'<text x="{x}" y="{y}" font-family="Arial, sans-serif" font-size="{size}" fill="{color}" font-weight="{weight}">{html.escape(str(t))}</text>')
 def box(self,x,y,w,h,title,fill='#f5f7f9'):
  self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{fill}" stroke="#94a3b8" stroke-width="1.5"/>');self.text(x+14,y+26,title,16,'#334155',700)
 def card(self,x,y,kind,label,w=178,h=104,meta='',pivotal=False):
  self.parts.append(f'<rect x="{x+3}" y="{y+4}" width="{w}" height="{h}" rx="2" fill="#000" opacity=".07"/><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="2" fill="{colors[kind]}" stroke="#172033" stroke-width="{3 if pivotal else 1.3}"/>')
  self.text(x+9,y+19,kind+(' ★' if pivotal else ''),12,'#172033',700)
  lines=textwrap.wrap(label,width=max(12,int(w/8.4)))
  for i,line in enumerate(lines):self.text(x+10,y+44+i*19,line,15,'#172033',600)
  if meta:self.text(x+9,y+h-9,meta,10,'#475569')
 def event(self,x,y,eid,w=178,h=104,pivotal=False):
  e=byid[eid];self.card(x,y,'EV',e[2],w,h,meta=e[0]+' · '+('registro transacional' if e[4]=='evento' else 'cadastro persistido'),pivotal=pivotal)
 def arrow(self,x,y,x2,y2,dashed=False,label=None):
  self.parts.append(f'<path d="M{x},{y} L{x2},{y2}" fill="none" stroke="#334155" stroke-width="1.5" marker-end="url(#arrow)"'+(' stroke-dasharray="7 5"' if dashed else '')+'/>')
  if label:self.text((x+x2)/2-20,(y+y2)/2-7,label,11,'#475569')
 def diamond(self,x,y,label,w=190,h=130,kind='PA'):
  self.parts.append(f'<polygon points="{x+w/2},{y} {x+w},{y+h/2} {x+w/2},{y+h} {x},{y+h/2}" fill="{colors[kind]}" stroke="#172033"/>')
  self.text(x+w/2-12,y+23,kind,12,'#172033',700)
  for i,line in enumerate(textwrap.wrap(label,22)):self.text(x+38,y+49+i*18,line,12)
 def save(self,path):path.write_text(''.join(self.parts)+'</svg>')

# 1: descoberta deliberadamente desordenada, determinística para diffs estáveis.
b=Board(1,1880,1060)
for i,e in enumerate(events):
 col=(i*3)%7;row=i//7;x=70+col*254+((i%3)-1)*13;y=210+row*152+(i%4)*9
 b.event(x,y,e[0],202,116)
b.text(38,1020,'Não confundir consulta com evento: consultar progresso não muda o agregado; é um modelo de leitura.',17)
b.save(OUT/'01-descoberta.svg')

# 2–4: linha do tempo de processo, com ramificações e retornos explícitos.
for stage in [2,3,4]:
 b=Board(stage,2260,1640 if stage>=3 else 1250)
 if stage==4:
  for x,label in [(245,'OS RECEBIDA'),(1324,'ORÇAMENTO APROVADO'),(1960,'REPARO FINALIZADO')]:
   b.parts.append(f'<path d="M{x},195 L{x},1080" stroke="#172033" stroke-width="4"/>');b.text(x+9,211,label,12,'#172033',700)
 b.text(38,237,'PRÉ-REQUISITOS / CADASTROS E CATÁLOGO',13,'#64748b',700)
 for i,eid in enumerate(['C01','C02','C04','C06','C09']):
  b.event(55+i*220,254,eid)
  if i<4:b.arrow(233+i*220,306,266+i*220,306,dashed=True)
 b.text(1200,276,'Cadastros podem ocorrer independentemente.',15)
 b.text(1200,301,'Preços novos não alteram snapshots de OS existentes.',15)
 b.text(38,403,'FLUXO PRINCIPAL →',13,'#64748b',700)
 main=['E01','E02','E03','E04','E05','E07','E12','E13']
 positions=[55,270,485,700,1130,1345,1775,1990]
 for i,(eid,x) in enumerate(zip(main,positions)):
  b.event(x,422,eid,pivotal=stage==4 and eid in ['E01','E05','E12'])
  if i<7:b.arrow(x+178,474,positions[i+1]-10,474)
 b.diamond(920,414,'Cliente aprova?',176,124,'D')
 b.arrow(878,480,920,480);b.arrow(1096,480,1120,480,label='sim')
 b.text(38,573,'ALTERNATIVAS / CICLOS',13,'#64748b',700)
 b.event(920,603,'E06');b.arrow(1008,538,1008,596,dashed=True,label='não')
 b.parts.append('<path d="M920,655 C820,655 820,550 789,535" fill="none" stroke="#334155" stroke-dasharray="7 5" marker-end="url(#arrow)"/>')
 for eid,x,y in [('E08',1345,603),('E09',1560,603),('E10',1775,603),('E11',1130,755)]:b.event(x,y,eid)
 b.arrow(1434,526,1434,596,dashed=True,label='adicional')
 b.arrow(1523,655,1550,655);b.arrow(1738,655,1765,655)
 b.parts.append('<path d="M1864,708 C1864,740 789,740 789,536" fill="none" stroke="#334155" stroke-dasharray="7 5" marker-end="url(#arrow)"/>')
 b.text(1600,731,'Nova versão → apresentar → decidir novamente',12)
 b.arrow(1219,526,1219,748,dashed=True,label='reaprovação')
 b.text(38,901,'ESTOQUE / INTEGRAÇÃO',13,'#64748b',700)
 for eid,x in [('E14',55),('E15',270),('E16',1130),('E17',1345)]:b.event(x,920,eid)
 b.arrow(1308,972,1335,972,dashed=True)
 b.text(1345,1050,'E17: somente ao cruzar para saldo ≤ mínimo',12)
 b.text(1570,945,'Aprovar → consumir estoque + registrar decisão + iniciar/retomar.',14)
 b.text(1570,972,'Sem saldo: HTTP 409 e rollback; não é um evento de aprovação.',14)
 b.text(1570,999,'Movimentos manuais são independentes do ciclo da OS.',14)
 b.text(38,1083,'MANUTENÇÃO DO CADASTRO / FATOS INDEPENDENTES DO CICLO DA OS',13,'#64748b',700)
 for i,eid in enumerate(['C03','C05','C07','C08','C10','C11','C12']):b.event(55+i*305,1100,eid)
 if stage>=3:
  for i,h in enumerate(hotspots):
   x=55+(i%4)*540;y=1280+(i//4)*150
   b.diamond(x,y,h[0]+' · '+h[1],190,130)
   for j,line in enumerate(textwrap.wrap(h[2],43)):b.text(x+205,y+25+j*16,line,12)
 b.save(OUT/(f'{stage:02d}-'+['','','linha-do-tempo.svg','pontos-de-atencao.svg','eventos-pivotais.svg'][stage]))

# 5–8: desenho de fluxo por intenção, adicionando leituras, agregados e contextos.
for stage in [5,6,7,8]:
 rowh=182; top=242;width=2400;height=top+len(rows)*rowh+(640 if stage>=7 else 380 if stage==6 else 100)
 b=Board(stage,width,height)
 labels=[(64,'ATOR'),(253,'MODELO DE LEITURA'),(511,'COMANDO'),(802,'AGREGADO'),(1140,'EVENTO(S)'),(1600,'POLÍTICA / DECISÃO')]
 for x,label in labels:
  if label=='MODELO DE LEITURA' and stage<6:continue
  if label=='AGREGADO' and stage<7:continue
  b.text(x,211,label,13,'#64748b',700)
 # Limites por contexto: não usar cada tabela como contexto.
 groups=[]
 for i,row in enumerate(rows):
  if not groups or groups[-1][0]!=row[0]:groups.append([row[0],i,i])
  else:groups[-1][2]=i
 if stage==8:
  for ctx,start,end in groups:
   b.box(24,top+start*rowh-13,width-48,(end-start+1)*rowh-3,'BC · '+ctx+(' · integração com aprovação' if start==23 else ''),'#f1f5f9')
 if stage>=7:
  groupsag=[]
  for i,row in enumerate(rows):
   if not groupsag or groupsag[-1][0]!=row[4]:groupsag.append([row[4],i,i])
   else:groupsag[-1][2]=i
  for ag,start,end in groupsag:
   y=top+start*rowh+31;h=(end-start)*rowh+104
   b.box(802,y,291,h,'AG · '+ag,colors['AG'])
   ent,vo=concepts[ag]
   for j,line in enumerate(textwrap.wrap('ENT: '+ent,31)):b.text(816,y+53+j*18,line,12)
   if h>180:
    for j,line in enumerate(textwrap.wrap('VO: '+vo,31)):b.text(816,y+112+j*18,line,12)
   else:
    b.text(816,y+h-10,'VO: '+vo,11)
 for i,row in enumerate(rows):
  ctx,actor,read,cmd,ag,eids,pol,handler=row;y=top+i*rowh+31
  b.card(64,y,'AT',actor,157,104)
  if stage>=6:b.card(253,y,'ML',read,225,104);b.arrow(478,y+52,501,y+52)
  b.card(511,y,'CMD',cmd,249,104,handler)
  if stage<6:b.arrow(221,y+52,501,y+52)
  else:
   b.arrow(253,y+52,231,y+52)
   b.parts.append(f'<path d="M142,{y+104} L142,{y+147} L636,{y+147} L636,{y+114}" fill="none" stroke="#334155" marker-end="url(#arrow)"/>')
  if stage>=7:
   b.arrow(760,y+52,792,y+52);b.arrow(1093,y+52,1122,y+52)
  else:b.arrow(760,y+52,1122,y+52)
  ids=eids.split(',')
  b.card(1140,y,'EV','',410,132,pivotal=any(eid in ['E01','E05','E12'] for eid in ids))
  for k,eid in enumerate(ids):b.text(1150,y+43+k*21,eid+' · '+byid[eid][2],14,'#172033',600)
  if len(ids)<4:b.text(1150,y+120,'registro transacional' if ids[0].startswith('E') else 'cadastro persistido · sem envelope de evento',10,'#475569')
  b.card(1600,y,'POL',pol,450,112)
  b.arrow(1550,y+52,1590,y+52)
  b.text(2080,y+32,'DECISÃO',12,'#64748b',700)
  notes={'C01':'Cadastre antes da operação.','E01,E02':'Saldo apenas conferido.','E05,E07':'Sem saldo → rollback.','E06':'Rejeitar ≠ cancelar.','E08,E09,E10,E04':'Suspender execução.','E05,E11':'Versão antiga → 409.','E16,E17':'Alerta só ao cruzar mínimo.'}
  for j,line in enumerate(textwrap.wrap(notes.get(eids,'Invariante recusada → erro; nenhum evento de sucesso.'),29)):b.text(2080,y+57+j*18,line,13)
 y=top+len(rows)*rowh+35
 if stage>=7:
  b.box(40,y,2320,170,'FRONTEIRAS DE CONSISTÊNCIA E REPOSITÓRIOS')
  messages=['WorkOrderRepository.save(raiz) persiste itens, decisões e histórico juntos. Não existem escritas públicas isoladas para seus filhos.',
   'PartRepository.save(raiz) persiste saldo com versão otimista; Part produz InventoryMovement e eventos, registrados pelo handler na mesma transação.',
   'Referências entre agregados usam IDs. Customer, Vehicle, Service, Part, Workshop e AdminUser possuem repositórios próprios.',
   'Aprovação é a exceção transacional do monólito: OS + Part + movimentos + eventos. Não é uma saga nem há consistência eventual.']
  for j,line in enumerate(messages):b.text(58,y+58+j*26,line,15)
 if stage==6:
  b.card(40,y,'ML','Histórico de status da OS',330,112,'GetWorkOrderHistory')
  b.card(420,y,'ML','Tempo médio entre primeira aprovação e finalização',380,132,'GetAverageExecutionTime')
  b.text(850,y+42,'Consultas analíticas e de auditoria não alteram o agregado.',17)
  b.text(850,y+76,'Não produzem eventos de domínio nem comandos de mutação.',17)
 if stage==7:
  y+=210;b.card(40,y,'AG','AdminUser · Identidade administrativa',360,145,'AdminUserRepository')
  b.card(440,y,'ENT','Usuário administrativo identificado por user ID',360,145)
  b.text(850,y+40,'Autenticação: leitura de credenciais por AuthenticateAdmin.',17)
  b.text(850,y+72,'Email/hash ainda são strings; não há VO de credencial próprio.',17)
  b.text(850,y+104,'JWT é resultado técnico da autenticação; não é evento da OS.',17)
 if stage==8:
  y+=204;b.box(40,y,2320,200,'MAPA DE CONTEXTOS · MONÓLITO MODULAR')
  contextlist=[('Identidade administrativa','AdminUser / JWT → comandos administrativos'),('Relacionamento com clientes','IDs de Customer/Vehicle → Atendimento'),('Catálogo de serviços','Snapshot de descrição/preço → Atendimento'),('Atendimento e reparo','Aprovação → consumo síncrono de peças'),('Peças e estoque','Saldo/consumo → resultado da aprovação'),('Operação da oficina','Cadastro; multiunidade ainda em aberto')]
  for i,(ctx,contract) in enumerate(contextlist):
   x=58+(i%3)*752;yy=y+45+(i//3)*72;b.text(x,yy,ctx,17,'#172033',700);b.text(x,yy+24,contract,14,'#475569')
  y+=223;b.box(40,y,2320,120,'LIMITES IMPLEMENTADOS')
  b.text(58,y+54,'Contextos são fronteiras lógicas documentadas; compartilham processo, banco e composição. Não há isolamento de deploy ou ACL independente.',15)
  b.text(58,y+81,'Read models consultam estado persistido de forma síncrona; não há projetor assíncrono. domain_events é um registro transacional, sem broker.',15)
 filenames={5:'atores-e-comandos',6:'leituras-e-politicas',7:'agregados',8:'bounded-contexts'}
 b.save(OUT/f'{stage:02d}-{filenames[stage]}.svg')

# Mermaid separado por etapa; SVGs são o quadro visual completo, com conteúdo idêntico ao catálogo.
for stage in range(1,9):
 lines=['flowchart LR','  classDef ev fill:#ffca28,stroke:#172033;','  classDef cmd fill:#00c5cf,stroke:#172033;','  classDef ag fill:#fff2a1,stroke:#172033;','  classDef ml fill:#76d66c,stroke:#172033;','  classDef pol fill:#e58be8,stroke:#172033;','  classDef pa fill:#ff6c88,stroke:#172033;']
 if stage<=4:
  for eid,name,label,ag,persistence in events:lines.append(f'  {eid}["EV {eid}: {label}"]:::ev')
  if stage>=2:
   lines+=['  C02 --> C04 --> E01 --> E02 --> E03 --> E04 --> E05 --> E07 --> E12 --> E13', '  E04 --> E06 -. nova decisão .-> E04','  E07 --> E08 --> E09 --> E10 --> E04','  E05 --> E16 --> E17','  E05 -. reaprovação .-> E11']
  if stage>=3:
   for h in hotspots:lines.append(f'  {h[0]}{{"PA {h[0]}: {h[1]}"}}:::pa')
   lines+=['  H01 -.-> E01','  H02 -.-> E06','  H03 -.-> E05','  H04 -.-> E08','  H05 -.-> E16','  H06 -.-> E04','  H07 -.-> E12','  H08 -.-> C01']
  if stage==4:lines.append('  style E01 stroke-width:5px\n  style E05 stroke-width:5px\n  style E12 stroke-width:5px')
 else:
  contexts=list(dict.fromkeys(row[0] for row in rows)) if stage==8 else [None]
  for ci,context in enumerate(contexts):
   if context is not None:lines.append(f'  subgraph BC{ci}["{context}"]')
   aggregates=set()
   for i,row in enumerate(rows):
    ctx,actor,read,cmd,ag,eids,pol,handler=row
    if context is not None and ctx!=context:continue
    lines.append(f'  A{i}["AT: {actor}"] --> C{i}["CMD: {cmd}"]:::cmd')
    if stage>=6:lines.append(f'  R{i}["ML: {read}"]:::ml --> A{i}')
    if stage>=7:
     node=f'G{ci}_{ag}'
     if ag not in aggregates:
      lines.append(f'  {node}["AG: {ag}"]:::ag');aggregates.add(ag)
     lines.append(f'  C{i} --> {node}');prefix=node
    else:prefix=f'C{i}'
    for k,eid in enumerate(eids.split(',')):
     lines.append(f'  {prefix} --> E{i}_{k}["EV: {byid[eid][2]}"]:::ev')
    if stage>=6:lines.append(f'  E{i}_0 --> P{i}["POL: {pol}"]:::pol')
   if context is not None:lines.append('  end')
  if stage==8:lines.append('  C17 -. consumo sincrono / UnitOfWork .-> C23')
 (OUT/f'{stage:02d}.mmd').write_text('\n'.join(lines)+'\n')

# HTML autossuficiente: SVGs embutidos; arquivo abre sem rede e sem servidor.
svgfiles=sorted(OUT.glob('[0-9][0-9]-*.svg'))
css='''body{margin:0;background:#f5f5f1;color:#182333;font-family:system-ui,sans-serif}header{padding:24px 28px;background:#172333;color:white}h1{margin:0;font-size:26px}header p{max-width:1100px;line-height:1.5;color:#d5dfeb}.controls{position:sticky;top:0;background:#fff;border-bottom:1px solid #d4d9df;padding:14px 24px;z-index:2;display:flex;gap:8px;flex-wrap:wrap}button{cursor:pointer;border:1px solid #ccd2d9;background:#f8f9fa;color:#172333;border-radius:5px;padding:10px 14px;font-weight:600}button[aria-pressed=true]{background:#172333;color:white}.stage{display:none;padding:24px}.stage.active{display:block}.viewport{overflow:auto;border:1px solid #cfd5dc;background:white;max-height:76vh}.viewport svg{display:block;max-width:none}.guide{max-width:1100px;line-height:1.6;margin:24px 28px}.guide h2{margin-bottom:8px}.legend{display:flex;gap:8px;flex-wrap:wrap}.badge{padding:5px 10px;border-radius:3px;border:1px solid #677485}.download{margin:12px 0}a{color:#145da0}.note{padding:14px 18px;background:#fff;border-left:4px solid #e5aa23}.hotspots td,.hotspots th{padding:12px;border-bottom:1px solid #d4d9df;text-align:left;vertical-align:top}.hotspots{border-collapse:collapse} @media print{.controls,.viewport-controls{display:none}header{background:white;color:#172333}.stage.active{display:block;padding:0}.viewport{max-height:none;overflow:visible;border:none}.viewport svg{width:100%!important;height:auto}.guide{break-before:page}}'''
controls=''.join(f'<button data-stage="{i}" aria-pressed="{str(i==1).lower()}">{i:02d} · {html.escape(t)}</button>' for i,t in enumerate(titles,1))
sections=[]
for i,path in enumerate(svgfiles,1):
 svg=path.read_text()
 sections.append(f'<section id="stage-{i}" class="stage'+(' active' if i==1 else '')+f'"><h2>{i:02d} · {html.escape(titles[i-1])}</h2><p>{html.escape(subtitles[i-1])}</p><div class="viewport-controls"><button data-zoom="0.8">− Reduzir</button> <button data-zoom="1.25">+ Ampliar</button> <button data-fit="true">Ajustar largura</button> <button onclick="window.print()">Imprimir etapa</button></div><p class="download"><a href="{path.name}" download>SVG desta etapa</a> · <a href="{i:02d}.mmd" download>Fonte Mermaid</a> · Arraste as barras para explorar o quadro.</p><div class="viewport">{svg}</div></section>')
legend=''.join(f'<span class="badge" style="background:{color}">{kind}: '+{'EV':'evento passado','CMD':'intenção','AT':'ator','AG':'agregado','ML':'modelo de leitura','POL':'política','PA':'ponto de atenção','ENT':'entidade','VO':'objeto de valor','D':'decisão'}[kind]+'</span>' for kind,color in colors.items())
htable=''.join(f'<tr><td>{h[0]}</td><td>{html.escape(h[1])}</td><td>{html.escape(h[2])}</td></tr>' for h in hotspots)
body=f'''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Event Storming — Oficina · 8 etapas</title><style>{css}</style><header><h1>Oficina / Event Storming em oito etapas</h1><p>Da descoberta de fatos ao desenho dos contextos. Quadros separados, regras explícitas e correspondência com Bun + Elysia. Use as etapas 2–4 para explicar o processo e 5–8 para explicar o modelo e a implementação.</p></header><nav class="controls" aria-label="Etapas">{controls}</nav>{''.join(sections)}<section class="guide"><h2>Como ler o quadro</h2><div class="legend">{legend}</div><p>Ator → comando → agregado → evento → política. O modelo de leitura fornece dados ao ator. Uma consulta não é um evento de domínio. Regras recusadas não produzem eventos de sucesso.</p><p class="note">E01–E17 são envelopes de eventos registrados atomicamente em <code>domain_events</code>. C01–C12 são fatos de cadastro implementados como mudanças de estado, ainda sem envelope de evento. Notificações, cancelamento e multiunidade permanecem questões abertas. O quadro não declara essas funções implementadas.</p><h2>Entidade, objeto de valor e agregado</h2><p><strong>Entidade:</strong> tem identidade e continuidade (ex.: uma OS ou um item). <strong>Objeto de valor:</strong> é imutável, validado e comparado por conteúdo (ex.: Money, StockBalance e QuoteVersion). <strong>Agregado:</strong> unidade de consistência controlada pela raiz; itens, decisões e histórico são alterados pela WorkOrder e persistidos pelo seu repositório.</p><h2>Decisões e questões abertas</h2><table class="hotspots"><thead><tr><th>ID</th><th>Ponto de atenção</th><th>Decisão / situação</th></tr></thead><tbody>{htable}</tbody></table><h2>Relação com o código</h2><p><code>src/domain/work-order/</code>: raiz e seus objetos. <code>src/application/use-cases/work-order/</code>: um handler por intenção. <code>src/domain/part/</code>: saldo e consumo. Repositórios PostgreSQL e in-memory implementam os mesmos contratos; UnitOfWork inclui o registro de eventos.</p><p><a href="catalogo.json">Catálogo estruturado</a> · Consulte também README.md e as oito páginas Markdown nesta pasta. SVG e Mermaid podem ser importados em uma ferramenta colaborativa. Publicar o link externo continua a cargo do grupo.</p></section><script>
function active(){{return document.querySelector('.stage.active')}}
function natural(){{const s=active().querySelector('svg');s.style.width=s.getAttribute('width')+'px';s.style.height='auto'}}
function fit(){{const s=active().querySelector('svg'),v=active().querySelector('.viewport');s.style.width=Math.max(360,v.clientWidth-2)+'px';s.style.height='auto'}}
document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>{{document.querySelectorAll('.stage').forEach(s=>s.classList.toggle('active',s.id==='stage-'+b.dataset.stage));document.querySelectorAll('[data-stage]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));natural()}}));
document.querySelectorAll('[data-zoom]').forEach(b=>b.addEventListener('click',()=>{{const s=active().querySelector('svg');s.style.width=Math.max(360,Math.min(7000,s.getBoundingClientRect().width*Number(b.dataset.zoom)))+'px';s.style.height='auto'}}));
document.querySelectorAll('[data-fit]').forEach(b=>b.addEventListener('click',fit));natural();
</script></html>'''
(OUT/'index.html').write_text(body+'\n')
print(f'Gerados {len(svgfiles)} quadros SVG, 8 fontes Mermaid, catálogo e visualizador offline.')
