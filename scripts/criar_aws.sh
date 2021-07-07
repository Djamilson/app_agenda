
sudo docker-machine create --driver amazonec2 aws01

sudo chown "$USER":"$USER" /home/"$USER"/.docker -R
sudo chmod g+rwx "/home/$USER/.docker" -R

sudo docker-machine env aws01
eval $(docker-machine env aws01)
docker network create web
docker-compose --compatibility -f docker-compose.yml -f docker-production.yml up -d --remove-orphans --no-deps --build

