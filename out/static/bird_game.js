import { Circle, Vector2, Rect } from "./my_classes.js";
import { Intersect } from "./utility.js";
//might want to make an abstract gameobject class
class Bird {
    constructor(x = 0, y = 0, radius = 1, color = null, active = true) {
        this.circle = new Circle(new Vector2(x, y), radius);
        this.color = color;
        this.velocity = new Vector2();
        this.active = active;
    }
    get position() {
        return this.circle.position;
    }
    get radius() {
        return this.circle.radius;
    }
}
class Obstacle {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.rect = new Rect(x, y, width, height);
    }
    get position() {
        return new Vector2(this.rect.x, this.rect.y);
    }
    set position(pos) {
        this.rect.position = pos;
    }
    get width() {
        return this.rect.width;
    }
    get height() {
        return this.rect.height;
    }
}
class Game {
    constructor(width = 800, height = 500, numPlayers = 1, gravity = 9.81, timestep = 0.02, fwSpeed = 1, jumpFactor = 4) {
        this.active = true;
        this.step = 0;
        this.width = width;
        this.height = height;
        this.numPlayers = numPlayers;
        this.gravity = gravity * this.height;
        this.timestep = timestep;
        this.forwardSpeed = fwSpeed * this.width;
        this.jumpFactor = jumpFactor;
        this.birds = new Array(numPlayers); //create this many birds
        //this.active = new Array<boolean>(this.birds.length);
        for (let i = 0; i < this.birds.length; i++) {
            //start birds in center height but left side
            this.birds[i] = new Bird(this.width * 0.05, this.height * 0.5, 25); //position and radius
            //this.active[i] = true; //by default all birds are active
        }
        this.actions = new Array(this.birds.length);
        this.obstacles = new Array(0);
        this.winner = -1;
    }
    //when action is done by bird aka => button pressed to "jump"
    Action(index) {
        if (!this.active)
            return; //if the game is inactive
        if (!this.birds[index].active)
            return; //if not active ignore
        this.actions[index] = true;
        //this.birds[index].velocity.y = -this.jumpFactor*this.gravity; //set the up velocity to value
    }
    Winner() {
        let count = 0;
        let winner = -2;
        for (let i = 0; i < this.birds.length; i++) {
            if (this.birds[i].active) {
                winner = i;
                count += 1;
            }
            ;
            if (count > 1)
                return -2; //no winner yet
        }
        if (count === 0)
            return -1; //draw
        return winner;
    }
    Step(dt = this.timestep) {
        if (!this.active)
            return;
        this.step += 1;
        //integrate the accelaration
        for (let i = 0; i < this.birds.length; i++) {
            if (!this.birds[i].active)
                continue; //don't do anything
            if (!this.actions[i]) {
                this.birds[i].velocity.y += 0.5 * this.gravity * dt; //might want to make this conditional
            }
            else {
                this.birds[i].velocity.y = -this.jumpFactor * this.gravity * dt;
                this.actions[i] = false;
            }
            //if(this.birds[i].velocity.y > 50) this.birds[i].velocity.y = 50;
        }
        //integrate velocity
        for (let i = 0; i < this.birds.length; i++) {
            if (!this.birds[i].active)
                continue; //don't do anything
            this.birds[i].position.y += this.birds[i].velocity.y * dt; //might want to make this conditional
        }
        //console.log("move speed: ", this.forwardSpeed*dt);
        for (let i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].rect.x -= this.forwardSpeed * dt; //want them to move left
        }
        //evaluating collision
        //this.CheckValid();
        this.CheckCollision();
        //Checking if birds hit the bottom of the ground
        for (let i = 0; i < this.birds.length; i++) {
            if (this.birds[i].position.y > this.height + this.birds[i].radius || this.birds[i].position.y <= -this.birds[i].radius) {
                this.birds[i].active = false;
            }
        }
        //generate new obstacle
        if (this.obstacles.length <= 0) {
            this.GenerateObstacle(0.1 * this.width, 0.334 * this.height);
        }
        else {
            //if the very first element is behind a point generate new obstacle
            if (this.obstacles[0].position.x < -this.obstacles[0].width)
                this.GenerateObstacle(0.1 * this.width, 0.334 * this.height);
        }
        //Now we want to remove obstacles when they're out of the screen
        //the obstacles are ordered in terms of distance to bird
        if (this.obstacles.length <= 0)
            return;
        if (this.obstacles[0].position.x < -this.obstacles[0].width)
            this.obstacles.shift();
        //End case for the game
        //this.active = !this.GameOver();
        if (this.numPlayers != 1) {
            this.winner = this.Winner();
            if (this.winner >= -1) {
                this.active = false;
            }
        }
        else {
            if (this.birds[0].active)
                return;
            this.active = false;
        }
    }
    GameOver() {
        let count = 0;
        for (let i = 0; i < this.birds.length; i++) {
            if (this.birds[i].active)
                count += 1;
            if (count > 1)
                return false; //we have atleast 2 active players
        }
        return true;
    }
    //a bird is valid if it's on the obstacle
    CheckValid() {
        for (let i = 0; i < this.obstacles.length; i++) {
            for (let j = 0; j < this.birds.length; j++) {
                //ofset is measured from obstacle top left corner
                let offset = new Vector2(this.birds[j].position.x - this.obstacles[i].position.x, this.birds[j].position.y - this.obstacles[i].position.y);
                console.log("offset: ", offset);
                //check if within range of obstacle
                if (offset.x > 0 && offset.x < this.obstacles[i].width) {
                    console.log("within X range");
                    //now we need to check if the y range is valid
                    //then we are in valid bounds
                    if (offset.y > this.birds[j].radius && offset.y < this.obstacles[i].height - this.birds[j].radius) {
                    }
                    else {
                        this.birds[j].active = false; //de-active bird because not at right bit
                    }
                }
            }
        }
    }
    CheckCollision() {
        //we check if any of the birds overlap
        //first bruteforce check every obstacle with every bird, few enough stuff that it shouldn't matter
        for (let i = 0; i < this.obstacles.length; i++) {
            for (let j = 0; j < this.birds.length; j++) {
                let rectangeTop = new Rect(this.obstacles[i].position.x, 0, this.obstacles[i].width, this.obstacles[i].position.y);
                let rectangeBot = new Rect(this.obstacles[i].position.x, this.obstacles[i].height + this.obstacles[i].position.y, this.obstacles[i].width, this.height - (this.obstacles[i].position.y + this.obstacles[i].height));
                //let overlap = Intersect(this.birds[j].circle, this.obstacles[i].rect);
                let overlapTop = Intersect(this.birds[j].circle, rectangeTop);
                let overlapBot = Intersect(this.birds[j].circle, rectangeBot);
                if (overlapTop || overlapBot) {
                    //bird[j] is dead
                    this.birds[j].active = false;
                }
            }
        }
    }
    Reset() {
        for (let i = 0; i < this.birds.length; i++) {
            //start birds in center height but left side
            this.birds[i] = new Bird(this.width * 0.05, this.height * 0.5, 25); //position and radius
            //this.active[i] = true; //by default all birds are active
        }
        this.obstacles = new Array(0);
    }
    GenerateObstacle(width = 50, height = 100) {
        //want to decide the y offset only with fixed width and height
        //want to put it to just outside the screen
        let y = Math.random() * (this.height - height); //minimum -> 0, max -> screen_height - height
        let obstacle = new Obstacle(this.width, y, width, height);
        this.obstacles.push(obstacle); //add the obstacle to the array
    }
}
class BaseGame {
    constructor(width = 800, height = 600) {
        this.active = false; //by default the game is inactive
        this.width = width;
        this.height = height;
        this.intervalId = null;
        this.step = 0;
    }
    Start(frame_rate) {
        if (this.active)
            return; //we are already running
        this.step = 0;
        this.OnStart();
        this.intervalId = setInterval(() => {
            this.OnUpdate(1 / frame_rate);
            this.step += 1;
        });
        this.active = true;
    }
    Stop() {
        if (this.intervalId === null)
            return;
        clearInterval(this.intervalId);
        this.OnStop();
        this.active = false;
    }
}
class FlappyBirdGame extends BaseGame {
    constructor(width, height, gravity = 9.81, forwardSpeed = 1, jumpFactor = 4) {
        super(width, height);
        this.gravity = gravity;
        this.forwardSpeed = forwardSpeed;
        this.jumpFactor = jumpFactor;
        this.numPlayers = 0;
        this.birds = new Array(); //for now empty
        this.obstacles = new Array(); //empty obstacles
    }
    //add another bird
    AddPlayer() {
        let bird = new Bird(0, 0, (this.width + this.height) / (2 * 10));
        this.birds.push(bird);
    }
    AddPlayers(count) {
        for (let i = 0; i < count; i++) {
            this.AddPlayer();
        }
    }
    Reset() {
        for (let i = 0; i < this.birds.length; i++) {
            //start birds in center height but left side
            this.birds[i] = new Bird(this.width * 0.05, this.height * 0.5, 25); //position and radius
            //this.active[i] = true; //by default all birds are active
        }
        this.obstacles = new Array(0);
    }
    //generate a random height in pixel space
    GenerateObstacle(width = 20, height = 50) {
        //want to decide the y offset only with fixed width and height
        //want to put it to just outside the screen
        let y = Math.random() * (this.height - height); //minimum -> 0, max -> screen_height - height
        let obstacle = new Obstacle(this.width, y, width, height);
        this.obstacles.push(obstacle); //add the obstacle to the array
    }
    OnUpdate(deltatime) {
        if (!this.active)
            return;
        for (let i = 0; i < this.birds.length; i++) {
            if (!this.birds[i].active)
                continue;
            this.birds[i].velocity.y += this.gravity * deltatime;
        }
        for (let i = 0; i < this.birds.length; i++) {
            if (!this.birds[i].active)
                continue;
            this.birds[i].position.y += this.birds[i].velocity.y * deltatime;
        }
    }
    OnStart() {
    }
    OnStop() {
    }
}
export { Bird, Obstacle, Game };
