3D Pong Three.js Game
======

#MIT License

Started playing around with Three.js. Feel free to play with the code.

1. It has a few bugs, I'm sure. There are no tests, I was just playing.
2. It's not the best organized code. (Again, just playing around)
3. Lists look better with three things in them.

I hope this benefits someone.

1. Pomocí knihovny Three.js implementujte 3D variantu počítačové hry Pong.
2. Základní varianta předpokládá ovládání 2 hráči za pomoci klávesnice
3. Pro získání lepšího hodnocení je možné aplikaci vylepšovat a vyšperkovat v různých oblastech
  3.1 AI protivník </br>
  3.2 Přehrávání zvuků </br>
  3.3 Grafická prezentace aplikace (jak UI, tak vlastní 3D scéna) </br>

## Some points about the code:

I started off with the `init()` function. Basically I created a renderer, a camera,
a scene, a light, and a ball. From there I thought, "This ball should do something!".
So I animated the ball with the `render()` function and the `processBallMovement()`
function. After that there were some tweaks for collisions, then scoring... THEN, 
I realized I needed an opponent, so I added the `processCpuMovement()` function.

Then I decided to make the ball arc with a simple parabolic movement... because I 
was bored.

... then a simple scoreboard. That's pretty much it.
