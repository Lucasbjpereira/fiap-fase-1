# Vídeo do Event Storming

Arquivo: [event-storming-walkthrough.mp4](event-storming-walkthrough.mp4).

Walkthrough de 5min05s, em 1920 × 1080 a 24 fps, com locução sintética local em português (voz Luciana do macOS), legendas visíveis e faixa de legendas selecionável. As imagens são capturas reais da página local e dos SVGs renderizados no navegador, montadas com aproximações e movimentos lentos para facilitar a leitura.

## Capítulos

| Início | Etapa |
| --- | --- |
| 00:00 | Descoberta livre |
| 00:36 | Linha do tempo |
| 01:09 | Pontos de atenção e decisões |
| 01:46 | Eventos pivotais |
| 02:06 | Atores e comandos |
| 02:41 | Modelos de leitura e políticas |
| 03:17 | Agregados, entidades e objetos de valor |
| 04:04 | Bounded contexts e integrações |

As [legendas SRT](event-storming-walkthrough.srt) e o [mapa de cenas](event-storming-timeline.json) acompanham o vídeo. O roteiro completo da demonstração da API permanece em [roteiro.md](roteiro.md).

## Regenerar a montagem

Requisitos: macOS com `say` e voz Luciana, Python com Pillow e um binário FFmpeg. As capturas utilizadas ficam em `event-storming-captures/`; para refletir mudanças na página, atualize as capturas no navegador antes de renderizar.

```bash
python3 scripts/render-event-storming-video.py --ffmpeg /caminho/para/ffmpeg
```

O renderizador reaproveita a locução em `event-storming-render/`. Após editar uma frase ou trocar a voz, remova seus arquivos `.aiff` e `.wav` de cache antes de renderizar novamente.
