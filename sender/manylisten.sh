echo "Spawning 500 processes"
for i in {1..5000}
do
    node listen.js &
done
