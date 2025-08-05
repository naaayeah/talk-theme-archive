#!/bin/bash

echo "카톡테마모음 로컬 서버를 시작합니다..."
echo "서버가 시작되면 브라우저에서 http://localhost:8000 으로 접속하세요."
echo "서버를 중지하려면 Ctrl+C를 누르세요."
echo ""

# Python 3가 설치되어 있는지 확인
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "Python이 설치되어 있지 않습니다."
    echo "다음 중 하나의 방법을 사용해주세요:"
    echo "1. Python 설치: https://www.python.org/downloads/"
    echo "2. Node.js 사용: npx serve"
    echo "3. VS Code Live Server 확장 사용"
    exit 1
fi 