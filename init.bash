#!/bin/bash
# setup.sh

# OS 감지
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  OS="linux"
else
  echo "지원하지 않는 운영체제입니다: $OSTYPE"
  exit 1
fi

echo "운영체제: $OS"

# 필요한 패키지 설치
npm install

# PostgreSQL 설치 확인 및 설치
if ! command -v psql &> /dev/null; then
  echo "PostgreSQL이 설치되어 있지 않습니다. 설치를 시작합니다..."
  
  if [ "$OS" == "macos" ]; then
    # macOS용 PostgreSQL 설치 (Homebrew 사용)
    if ! command -v brew &> /dev/null; then
      echo "Homebrew가 설치되어 있지 않습니다. Homebrew를 먼저 설치합니다..."
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install postgresql
    brew services start postgresql
  elif [ "$OS" == "linux" ]; then
    # Linux용 PostgreSQL 설치
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
  fi
fi

# 데이터베이스 사용자 및 DB 생성
if [ "$OS" == "macos" ]; then
  # macOS에서는 postgres 사용자로 전환 없이 실행 가능할 수도 있음
  createuser -s fuan 2>/dev/null || echo "사용자가 이미 존재합니다"
  psql -d postgres -c "ALTER USER fuan WITH PASSWORD 'password' CREATEDB;"
  createdb -U fuan great_kingdom 2>/dev/null || echo "데이터베이스가 이미 존재합니다"
  psql -d great_kingdom -c "GRANT ALL ON SCHEMA public TO fuan;"
elif [ "$OS" == "linux" ]; then
  # Linux
  sudo -u postgres psql -c "CREATE USER fuan WITH PASSWORD 'password' CREATEDB;" 2>/dev/null || echo "사용자가 이미 존재합니다"
  sudo -u postgres psql -c "CREATE DATABASE great_kingdom;" 2>/dev/null || echo "데이터베이스가 이미 존재합니다"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE great_kingdom TO fuan;"
  sudo -u postgres psql -d great_kingdom -c "GRANT ALL ON SCHEMA public TO fuan;"
fi

# .env 파일 생성 (존재하지 않는 경우)
if [ ! -f .env ]; then
  echo "DATABASE_URL=\"postgresql://fuan:password@localhost:5432/great_kingdom?schema=public\"" > .env
  echo "JWT_SECRET=\"your-secret-key\"" >> .env
  echo "GOOGLE_CLIENT_ID=\"your-client-id\"" >> .env
  echo "GOOGLE_CLIENT_SECRET=\"your-client-secret\"" >> .env
  echo ".env 파일이 생성되었습니다. Google 인증 정보를 업데이트하세요."
else
  echo ".env 파일이 이미 존재합니다."
fi

# Prisma 마이그레이션
npx prisma generate
npx prisma migrate deploy

echo "설정이 완료되었습니다!"