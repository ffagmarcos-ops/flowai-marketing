#!/bin/bash
# Script para iniciar um container MariaDB localmente para desenvolvimento

CONTAINER_NAME="flowai_db_dev"
DB_PASSWORD="30mariafn@"
DB_NAME="flowai"
PORT="3306"

echo "=========================================================="
echo "   Iniciando MariaDB Local para Desenvolvimento (Docker)"
echo "=========================================================="

# Verifica se o Docker está instalado
if ! [ -x "$(command -v docker)" ]; then
  echo "Erro: Docker não está instalado ou não está no PATH." >&2
  exit 1
fi

# Verifica se o container já existe
if [ "$(docker ps -a -q -f name=$CONTAINER_NAME)" ]; then
  echo "Aviso: O container '$CONTAINER_NAME' já existe."
  
  # Se estiver parado, inicia
  if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Iniciando container existente..."
    docker start $CONTAINER_NAME
  else
    echo "O container já está rodando!"
  fi
else
  # Cria e roda um novo container
  echo "Criando e iniciando novo container MariaDB (imagem mariadb:10.11)..."
  docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:3306 \
    -e MYSQL_ROOT_PASSWORD=$DB_PASSWORD \
    -e MYSQL_DATABASE=$DB_NAME \
    mariadb:10.11
fi

echo "----------------------------------------------------------"
echo " Conexão estabelecida com sucesso!"
echo " - Host: localhost"
echo " - Porta: $PORT"
echo " - Usuário: root"
echo " - Senha: $DB_PASSWORD"
echo " - Banco: $DB_NAME"
echo "----------------------------------------------------------"
echo " Para ver os logs do banco, rode: docker logs -f $CONTAINER_NAME"
echo " Para parar o banco, rode: docker stop $CONTAINER_NAME"
echo "=========================================================="
