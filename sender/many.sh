echo "Spawning 100 processes"
for i in {1..500}
do
    chrome-cli open file:///Users/ethan/Work/C4C/p5/WWSTest/index.html
done
