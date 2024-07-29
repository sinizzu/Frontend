# 베이스 이미지로 node.js 사용
FROM node:16

# package 설치
RUN apt-get -y update && apt-get -y upgrade && apt-get install git net-tools vim 

# 애플리케이션 디렉토리 생성
WORKDIR '/root'

# 의존성 설치
RUN git clone https://github.com/sinizzu/Frontend.git project
WORKDIR '/root/project/Frontend'
RUN npm install 
RUN npm install -g nodemon 

# 포트 설정
EXPOSE 8500

# docker 실행
CMD npm start

