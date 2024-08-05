# 베이스 이미지로 node.js 사용
FROM node:16

# package 설치
RUN apt-get -y update && apt-get -y upgrade && apt-get install -y git net-tools vim

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY paperinsight/package.json /app/paperinsight/

# 의존성 설치와 nodemon 전역 설치를 하나의 RUN 명령어로 결합
RUN cd paperinsight && npm install && npm install -g nodemon

# 현재 디렉토리의 모든 파일을 도커 컨테이너의 워킹 디렉토리에 복사
COPY paperinsight/ /app/

# 포트 설정
EXPOSE 8500

# docker 실행
CMD cd paperinsight && npm start
