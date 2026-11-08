# Ocuri Trail — Entrenamiento de fuerza para trail running

App web estática para generar programas de fuerza personalizados para corredores de trail.

## Funcionalidades

- 7 grupos musculares con 8 ejercicios cada uno
- Generación local sin conexión
- **✦ IA** — genera ejercicios personalizados con Claude Haiku según tu perfil
- **↻ Rotar** — cambia cualquier ejercicio sin repetir los ya mostrados en la sesión
- **★ Favoritos** — guarda ejercicios en localStorage con pestaña propia
- Modo oscuro / claro
- Vídeos de YouTube integrados (modal desktop, app nativa en móvil)

---

## Despliegue rápido (todo en un script)

```bash
# 1. Clona el repo
git clone https://github.com/antoniolardila-IA/ocuri-trail.git
cd ocuri-trail

# 2. Edita las dos líneas en index.html (ver sección "Configuración")

# 3. Lanza el script de setup (despliega el Worker y configura los secretos)
bash setup.sh
```

El script hace: login en Cloudflare → deploy del Worker → configura los 2 secretos.

---

## Configuración manual (si prefieres hacerlo paso a paso)

### A) Dos líneas en index.html

Al inicio del `<script>` hay dos constantes que **debes cambiar**:

```js
const PROXY_URL    = 'https://claude-proxy.TU_CUENTA.workers.dev';  // ← URL de tu Worker
const PROXY_SECRET = 'TU_PROXY_SECRET';                              // ← token secreto
```

- `PROXY_URL` → la URL que obtienes tras desplegar el Worker (ver paso 2 abajo)
- `PROXY_SECRET` → cualquier cadena aleatoria, p. ej. `ocuri-s3cr3t-2024`

### B) Worker proxy claude-proxy

El botón **✦ IA** llama a Claude Haiku desde el navegador a través de este proxy.

**Paso 1 — Instala Wrangler** (si no lo tienes):
```bash
npm install -g wrangler
```

**Paso 2 — Despliega el Worker** (desde la carpeta `claude-proxy`):
```bash
cd claude-proxy
wrangler login          # abre navegador, elige la cuenta antoniolardila
wrangler deploy         # sube el worker, imprime la URL final
```
La URL será algo como `https://claude-proxy.<subdominio>.workers.dev`.
Cópiala en `PROXY_URL` de `index.html`.

**Paso 3 — Añade los secretos**:
```bash
wrangler secret put CLAUDE_API_KEY   # tu clave de api.anthropic.com
wrangler secret put PROXY_SECRET     # el mismo valor que pusiste en index.html
```

### C) Despliegue del frontend

La app es un único `index.html` estático. Dos opciones:

**Opción 1 — Cloudflare Pages** (recomendado, gratis):
1. Entra en [dash.cloudflare.com](https://dash.cloudflare.com) → cuenta `antoniolardila`
2. Workers & Pages → Create → Pages → Connect to Git
3. Conecta el repo `antoniolardila-IA/ocuri-trail`
4. Build command: (vacío)
5. Build output directory: `/` (raíz del repo)
6. Deploy

**Opción 2 — GitHub Pages** (también gratis):
1. En el repo GitHub → Settings → Pages
2. Source: Deploy from branch → `main` → `/ (root)`
3. Save

---

## Estructura del repo

```
ocuri-trail/
├── index.html          ← app completa (editar PROXY_URL y PROXY_SECRET)
├── setup.sh            ← script de despliegue automático
├── README.md
├── .gitignore
└── claude-proxy/
    ├── worker.js       ← código del Worker proxy
    └── wrangler.toml   ← configuración de Wrangler
```

---

## Secretos necesarios (nunca en el código)

| Secreto | Dónde se configura | Qué es |
|---|---|---|
| `CLAUDE_API_KEY` | Worker secret (Wrangler) | Clave de api.anthropic.com |
| `PROXY_SECRET` | Worker secret + index.html | Token de autenticación app↔proxy |

**Nunca** incluyas la `CLAUDE_API_KEY` en el código frontend ni en el repo.

---

## Cómo obtener una clave de Anthropic

1. Entra en [console.anthropic.com](https://console.anthropic.com)
2. Settings → API Keys → Create Key
3. Copia la clave (empieza por `sk-ant-...`)
4. Úsala en `wrangler secret put CLAUDE_API_KEY`
