# Docker 이미지 빌드
build:
	docker build -t paperinsight-app .

# Docker 컨테이너 실행
run:
	docker run -d -p 8500:8500 --name paperinsight paperinsight-app

# 실행 중인 Docker 컨테이너 목록 표시
ps:
	docker ps -a

# Docker 이미지 목록 표시
img:
	docker images

# 모든 Docker 컨테이너 중지
stop:
	docker stop paperinsight

# 모든 Docker 컨테이너 삭제
rm:
	docker rm -f $$(docker ps -aq)

# 모든 Docker 이미지 삭제
rmi:
	docker rmi -f $$(docker images -q)
