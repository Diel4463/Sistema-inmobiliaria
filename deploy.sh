#!/bin/bash
# Script de Deploy para InmoGest
# Uso: bash deploy.sh

set -e  # Exit on error

echo "🚀 InmoGest - Script de Deploy en Producción"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Por favor ejecuta como root: sudo bash deploy.sh${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Paso 1: Instalando dependencias...${NC}"
apt update && apt upgrade -y
apt install -y git curl nginx ufw certbot python3-certbot-nginx

echo -e "${YELLOW}🐳 Paso 2: Instalando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi
apt install -y docker-compose-plugin

echo -e "${YELLOW}🔥 Paso 3: Configurando Firewall...${NC}"
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

echo -e "${YELLOW}📂 Paso 4: Clonando repositorio...${NC}"
read -p "URL del repositorio GitHub: " REPO_URL
cd /opt
if [ -d "inmobiliaria" ]; then
    cd inmobiliaria
    git pull
else
    git clone "$REPO_URL" inmobiliaria
    cd inmobiliaria
fi

echo -e "${YELLOW}⚙️  Paso 5: Configurando variables de entorno...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo -e "${YELLOW}🔑 Generando JWT_SECRET...${NC}"
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
    
    echo ""
    read -p "Ingresa tu dominio (ej: inmobiliaria.com): " DOMAIN
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=https://api.$DOMAIN|g" .env
    
    echo ""
    read -sp "Password para PostgreSQL: " DB_PASSWORD
    echo ""
    sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$DB_PASSWORD|g" .env
    
    echo -e "${GREEN}✅ Archivo .env configurado${NC}"
else
    echo -e "${YELLOW}⚠️  .env ya existe, omitiendo...${NC}"
fi

echo -e "${YELLOW}🌐 Paso 6: Configurando Nginx...${NC}"
read -p "Dominio principal (ej: inmobiliaria.com): " MAIN_DOMAIN

cat > /etc/nginx/sites-available/inmobiliaria << EOF
# Frontend
server {
    listen 80;
    server_name $MAIN_DOMAIN www.$MAIN_DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# API
server {
    listen 80;
    server_name api.$MAIN_DOMAIN;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 50M;
    }
}
EOF

ln -sf /etc/nginx/sites-available/inmobiliaria /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo -e "${YELLOW}🔐 Paso 7: Configurando SSL...${NC}"
read -p "Email para Let's Encrypt: " LE_EMAIL
certbot --nginx --non-interactive --agree-tos -m "$LE_EMAIL" \
    -d "$MAIN_DOMAIN" -d "www.$MAIN_DOMAIN" -d "api.$MAIN_DOMAIN" || true

echo -e "${YELLOW}🐳 Paso 8: Levantando aplicación...${NC}"
docker compose down 2>/dev/null || true
docker compose up -d --build

echo -e "${YELLOW}💾 Paso 9: Inicializando base de datos...${NC}"
sleep 10  # Esperar a que PostgreSQL inicie
docker compose exec backend npm run prisma:seed || echo "Seed ya ejecutado o error"

echo -e "${YELLOW}🔄 Paso 10: Configurando auto-inicio...${NC}"
cat > /etc/systemd/system/inmobiliaria.service << EOF
[Unit]
Description=InmoGest Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/inmobiliaria
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable inmobiliaria

echo ""
echo -e "${GREEN}✅ ¡Deploy completado!${NC}"
echo ""
echo "📌 URLs de acceso:"
echo "   Frontend: https://$MAIN_DOMAIN"
echo "   API:      https://api.$MAIN_DOMAIN"
echo ""
echo "🔑 Credenciales por defecto:"
echo "   Usuario:   admin"
echo "   Password:  Admin123!"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs:       docker compose logs -f"
echo "   Reiniciar:      systemctl restart inmobiliaria"
echo "   Detener:        systemctl stop inmobiliaria"
echo "   Ver estado:     systemctl status inmobiliaria"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Cambia la contraseña del admin inmediatamente${NC}"
echo ""
