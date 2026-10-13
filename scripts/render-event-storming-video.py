"""Compõe capturas reais da página em um MP4 com locução local e legendas em português.

Requer Pillow, ffmpeg e o comando say do macOS. Não modifica nem automatiza o navegador.
As capturas de entrada são obtidas com cua_repl e mantidas junto do vídeo.
"""
from pathlib import Path
import argparse, json, subprocess, wave, math, textwrap
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/video'
CAP = OUT / 'event-storming-captures'
WORK = OUT / 'event-storming-render'
WORK.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument('--ffmpeg', required=True)
parser.add_argument('--voice', default='Luciana')
parser.add_argument('--fps', type=int, default=24)
args = parser.parse_args()
W, H = 1920, 1080
fontroot=Path('/System/Library/Fonts/Supplemental')
F=lambda size,bold=False:ImageFont.truetype(str(fontroot/('Arial Bold.ttf' if bold else 'Arial.ttf')),size)
fonts={n:F(n) for n in [18,22,26,32,38,44]}
fontbold={n:F(n,True) for n in [22,32,38,44,56]}
titles=['Descoberta livre','Linha do tempo','Pontos de atenção','Eventos pivotais','Atores e comandos','Leituras e políticas','Agregados, entidades e VOs','Bounded contexts']
scenes=[]
def page(stage,text,title=None):scenes.append(dict(stage=stage,mode='page',text=text,title=title or titles[stage-1]))
def board(stage,text,start,end=None):scenes.append(dict(stage=stage,mode='board',text=text,start=start,end=end or start,title=titles[stage-1]))
page(1,'Este vídeo apresenta a página de Event Storming da oficina. As oito etapas mostram a evolução da descoberta dos fatos até o desenho dos agregados e dos contextos.','Event Storming da oficina')
board(1,'Na primeira etapa, os fatos aparecem sem ordem. O objetivo é descobrir a linguagem do negócio antes de escolher classes, repositórios ou tecnologias.',[0,160,1400,600],[480,420,1400,600])
board(1,'O quadro distingue dezessete eventos registrados dos fatos de cadastro. Um evento descreve algo ocorrido; uma consulta de progresso é um modelo de leitura.',[420,410,1400,600],[80,410,1400,600])
page(2,'Na segunda etapa, organizamos os acontecimentos no tempo e identificamos o caminho principal, as alternativas e os retornos.')
board(2,'O atendimento começa com a ordem recebida, segue para o cálculo do orçamento e o diagnóstico, e chega à apresentação da proposta para o cliente.',[0,340,1380,560],[250,340,1380,560])
board(2,'A aprovação autoriza a execução. A rejeição mantém a espera. Um reparo adicional pausa o trabalho, revisa o orçamento e exige uma nova decisão antes da retomada.',[880,380,1380,560])
page(3,'A terceira etapa registra pontos de atenção. Cada dúvida tem uma decisão explícita ou permanece identificada como questão em aberto.')
board(3,'A criação confere o estoque, mas não reserva peças. A aprovação verifica a disponibilidade novamente e confirma saldo, decisão e eventos em uma única transação.',[0,1195,1130,445])
board(3,'A versão do orçamento protege decisões antigas. Notificações e múltiplas unidades permanecem questões abertas; o quadro não apresenta essas funções como implementadas.',[1130,1195,1130,445])
page(4,'A quarta etapa marca os eventos pivotais: acontecimentos que mudam a fase do processo.')
board(4,'Os três marcos são a ordem recebida, o orçamento aprovado e o reparo finalizado. As linhas verticais tornam visíveis as mudanças de atendimento, autorização e encerramento.',[0,185,1430,650],[830,185,1430,650])
page(5,'A quinta etapa associa atores e comandos. O ator expressa uma intenção que pode ser aceita ou recusada pelo domínio.')
board(5,'O atendente recebe a ordem. A equipe inicia o diagnóstico e apresenta o orçamento. O cliente aprova ou rejeita a proposta. Cada intenção possui um handler específico.',[30,2750,1600,644],[30,2960,1600,644])
board(5,'Propor um reparo adicional, finalizar o serviço e registrar a entrega são comandos distintos. Eles usam comportamentos descritivos, com suas próprias condições de execução.',[420,3290,1620,652],[420,3800,1620,652])
page(6,'Na sexta etapa, acrescentamos modelos de leitura e políticas. A leitura fornece informações para que o ator decida qual comando enviar.')
board(6,'O cliente consulta o orçamento público antes de decidir. A equipe usa o detalhe e a fila de ordens. As políticas exigem aprovação e impedem a execução de um adicional sem novo aceite.',[30,2940,1770,712],[400,3290,1770,712])
board(6,'Histórico e tempo médio são consultas de auditoria e análise. Eles não alteram o agregado e não geram eventos de sucesso da ordem de serviço.',[0,4570,2220,420])
page(7,'A sétima etapa mostra os agregados e seus limites de consistência. Uma raiz controla como suas entidades internas podem mudar.')
board(7,'A raiz da ordem protege itens, decisões e histórico. Dinheiro, quantidade, código de acompanhamento, orçamento e versão são objetos de valor, validados e comparados por conteúdo.',[740,2780,1380,555])
board(7,'O agregado de peça protege o saldo e produz movimentos de estoque. Seu repositório usa controle de versão para recusar uma gravação concorrente obsoleta.',[440,1690,1640,660],[440,2200,1640,660])
board(7,'O usuário administrativo também possui identidade e repositório. Autenticar credenciais gera um token técnico; isso não é um evento do processo de reparo.',[0,4820,2100,400])
page(8,'A oitava etapa delimita os contextos. Cada contexto reúne um modelo, uma linguagem e responsabilidades próprias.')
board(8,'Relacionamento mantém clientes e veículos. Catálogo mantém serviços. Atendimento controla a ordem, enquanto peças e estoque controlam saldo e consumo.',[400,2700,1760,708],[400,3290,1760,708])
board(8,'O mapa também inclui identidade administrativa e operação da oficina. Esses limites são lógicos dentro do monólito; não representam microsserviços independentes.',[20,4820,2340,430])
board(8,'A aprovação coordena ordem e estoque de forma síncrona e transacional. Os eventos são registrados junto com a mudança. Não há broker, notificações ou Event Sourcing no projeto atual.',[20,4820,2340,430])
page(8,'Para explorar o material, abra a página local de Event Storming. Navegue pelas oito etapas e use ampliar, reduzir, ajustar largura ou baixar o SVG de cada quadro.','Explore as oito etapas')

# Locução local: arquivos temporários tornam o vídeo reproduzível sem serviço externo.
rate=174
for i,scene in enumerate(scenes):
 stem=WORK/f'{i:02d}'
 textfile=stem.with_suffix('.txt');textfile.write_text(scene['text'],encoding='utf-8')
 aiff=stem.with_suffix('.aiff');wav=stem.with_suffix('.wav')
 if not aiff.exists():
  subprocess.run(['say','-v',args.voice,'-r',str(rate),'-f',str(textfile),'-o',str(aiff)],check=True)
 if not wav.exists():
  subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(aiff),'-ac','1','-ar','48000','-c:a','pcm_s16le',str(wav)],check=True)
 with wave.open(str(wav)) as audio:
  duration=audio.getnframes()/audio.getframerate()
 scene['duration']=math.ceil((duration+0.8)*args.fps)/args.fps
 scene['audio']=str(wav.relative_to(ROOT))
 print(f'Locução {i+1}/{len(scenes)}: {scene["duration"]:.1f}s',flush=True)

# Áudio concatenado com pequeno intervalo depois de cada frase.
audioout=OUT/'event-storming-narracao.wav'
with wave.open(str(audioout),'wb') as dest:
 dest.setnchannels(1);dest.setsampwidth(2);dest.setframerate(48000)
 for scene in scenes:
  with wave.open(str(ROOT/scene['audio'])) as src:
   samples=src.readframes(src.getnframes())
  dest.writeframes(samples)
  silence=max(0,round(scene['duration']*48000)-len(samples)//2)
  dest.writeframes(b'\0\0'*silence)

cache={}
def load(stage,mode):
 key=(stage,mode)
 if key not in cache:cache[key]=Image.open(CAP/f'{stage:02d}-{mode}.jpg').convert('RGB')
 return cache[key]
def fit(image,size):
 ratio=min(size[0]/image.width,size[1]/image.height)
 return image.resize((round(image.width*ratio),round(image.height*ratio)),Image.Resampling.LANCZOS)
def wrapped(draw,text,font,width):
 words=text.split();lines=[];line=''
 for word in words:
  new=(line+' '+word).strip()
  if draw.textlength(new,font=font)>width and line:lines.append(line);line=word
  else:line=new
 if line:lines.append(line)
 return lines

def frame(scene,p):
 image=Image.new('RGB',(W,H),'#111d2d');draw=ImageDraw.Draw(image)
 stage=scene['stage']
 draw.text((42,24),'OFICINA / EVENT STORMING',font=fontbold[22],fill='#afbed1')
 draw.text((42,57),f'{stage:02d}  {scene["title"]}',font=fontbold[38],fill='white')
 draw.text((1524,31),'Bun + Elysia · DDD',font=fonts[22],fill='#9ce3dc')
 area=(40,126,1880,876)
 if scene['mode']=='page':
  pageimage=fit(load(stage,'page'),(720,736))
  x=92+(720-pageimage.width)//2;y=132+(736-pageimage.height)//2
  image.paste(pageimage,(x,y))
  draw.rounded_rectangle((x-2,y-2,x+pageimage.width+2,y+pageimage.height+2),radius=3,outline='#8a9bab',width=2)
  draw.text((870,232),f'ETAPA {stage:02d} DE 08',font=fontbold[22],fill='#64d8d4')
  lines=wrapped(draw,scene['title'],fontbold[56],890)
  for j,line in enumerate(lines):draw.text((866,285+j*68),line,font=fontbold[56],fill='white')
  lines=wrapped(draw,scene['text'],fonts[32],894)
  for j,line in enumerate(lines):draw.text((870,480+j*43),line,font=fonts[32],fill='#d4dfed')
  draw.text((870,803),'localhost:3000/event-storming/',font=fonts[26],fill='#afbed1')
 else:
  start,end=scene['start'],scene['end']
  # Movimento lento; breve repouso no começo e no fim de cada close-up.
  t=max(0,min(1,(p-0.13)/0.74));t=t*t*(3-2*t)
  x,y,w,h=[a+(b-a)*t for a,b in zip(start,end)]
  source=load(stage,'board')
  crop=source.crop((round(x),round(y),round(x+w),round(y+h)))
  content=fit(crop,(1840,750))
  draw.rectangle(area,fill='#fcfcf9')
  image.paste(content,(40+(1840-content.width)//2,126+(750-content.height)//2))
  draw.rectangle(area,outline='#7f93aa',width=2)
  lines=wrapped(draw,scene['text'],fonts[32],1810)
  for j,line in enumerate(lines):draw.text((48,899+j*39),line,font=fonts[32],fill='white')
 # Marcadores de capítulo, distintos do conteúdo original da página.
 for i in range(8):
  x=40+i*233
  draw.rounded_rectangle((x,1030,x+214,1040),radius=3,fill='#00c5cf' if i+1==stage else '#33465d')
  draw.text((x,1045),f'{i+1:02d}',font=fonts[18],fill='#d4dfed')
 return image

video=OUT/'event-storming-walkthrough.mp4'
silent=WORK/'silent.mp4'
command=[args.ffmpeg,'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}',
 '-framerate',str(args.fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(silent)]
process=subprocess.Popen(command,stdin=subprocess.PIPE)
try:
 for i,scene in enumerate(scenes):
  count=round(scene['duration']*args.fps)
  if scene['mode']=='page' or scene.get('start')==scene.get('end'):
   raw=frame(scene,0).tobytes()
   for n in range(count):process.stdin.write(raw)
  else:
   for n in range(count):process.stdin.write(frame(scene,n/max(1,count-1)).tobytes())
  # Evidência visual do primeiro e de todos os capítulos, sem navegar no navegador.
  frame(scene,0.5).save(WORK/f'{i:02d}-preview.jpg',quality=92)
  print(f'Vídeo {i+1}/{len(scenes)}',flush=True)
finally:
 process.stdin.close()
if process.wait()!=0:raise RuntimeError('Falha ao codificar vídeo')

# SRT e capítulos com tempos coerentes com áudio/vídeo.
def timestamp(seconds):
 ms=round(seconds*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
 return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'
srt=[];chapters=[];elapsed=0
for i,scene in enumerate(scenes):
 srt.append(f'{i+1}\n{timestamp(elapsed)} --> {timestamp(elapsed+scene["duration"]-0.15)}\n{scene["text"]}\n')
 if scene['mode']=='page':chapters.append({'time':round(elapsed,3),'stage':scene['stage'],'title':scene['title']})
 scene['startSeconds']=round(elapsed,3);elapsed+=scene['duration']
(OUT/'event-storming-walkthrough.srt').write_text('\n'.join(srt),encoding='utf-8')
(OUT/'event-storming-timeline.json').write_text(json.dumps({'durationSeconds':round(elapsed,3),'resolution':[W,H],'fps':args.fps,'voice':args.voice,'language':'pt-BR','chapters':chapters,'scenes':scenes},ensure_ascii=False,indent=2)+'\n')
subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(silent),'-i',str(audioout),'-i',str(OUT/'event-storming-walkthrough.srt'),
 '-map','0:v:0','-map','1:a:0','-map','2:s:0','-c:v','copy','-c:a','aac','-b:a','160k','-c:s','mov_text','-metadata:s:s:0','language=por','-metadata:s:a:0','language=por',
 '-metadata','title=Event Storming da oficina — oito etapas','-movflags','+faststart','-shortest',str(video)],check=True)
# Capa: timeline com pontos pivotais, vinda das capturas da página.
cover=next(scene for scene in scenes if scene['stage']==4 and scene['mode']=='board')
frame(cover,0.68).save(OUT/'event-storming-video-cover.jpg',quality=94)
print(json.dumps({'video':str(video),'durationSeconds':round(elapsed,3),'sizeBytes':video.stat().st_size},ensure_ascii=False),flush=True)
